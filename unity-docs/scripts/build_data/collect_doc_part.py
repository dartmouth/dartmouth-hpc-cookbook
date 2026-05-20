#!/usr/bin/python

import sys
import requests
import os
import json
from subprocess import run  # nosec
from math import floor
from ClusterShell import NodeSet

# Set the JWT authentication token

# Check to see if one is in the environment
jwt_token = os.getenv("SLURM_JWT")
if not jwt_token:
    # Otherwise generate a new token with a short lifespan
    token_ps = run(
        ["/usr/bin/scontrol", "token", "lifespan=300"],
        capture_output=True,
        encoding="utf8",
    )  # nosec
    token_env, jwt_token = token_ps.stdout.strip().split("=")

# Set the Slurm REST API endpoint
api_endpoint = "http://slurmctld1:6820/slurm/v0.0.39/"
dbapi_endpoint = "http://slurmctld1:6820/slurmdb/v0.0.39/"

# Set the headers with the JWT token
headers = {"Authorization": f"Bearer {jwt_token}", "Content-Type": "application/json"}

# Collect Node data
response = requests.get(api_endpoint + "nodes", headers=headers)
if response.status_code != 200:
    print(f"Error: {response.status_code} - {response.text}")
    sys.exit(1)


def toGB(amt):
    return floor(float(amt) / 1024)


data = response.json()
node_cpus = {}
node_ram = {}
for node in data["nodes"]:
    node_cpus[node["name"]] = node["cpus"]
    node_ram[node["name"]] = toGB(node["real_memory"])


def find_max_cpus(nodelist):
    ns = NodeSet.NodeSet(nodelist)
    maxcpus = 0
    for n in ns:
        maxcpus = max(maxcpus, node_cpus[n])
    return maxcpus


def find_max_ram(nodelist):
    ns = NodeSet.NodeSet(nodelist)
    maxram = 0
    for n in ns:
        maxram = max(maxram, node_ram[n])
    return maxram


# Collect QOS Data
response = requests.get(dbapi_endpoint + "qos", headers=headers)
if response.status_code != 200:
    print(f"Error: {response.status_code} - {response.text}")
    sys.exit(1)

data = response.json()
qos_info = {}
# Convert list to dictionary based on name
for qos in data["qos"]:
    qos_info[qos["name"]] = qos


# Make a GET request to the API endpoint with headers
response = requests.get(api_endpoint + "partitions", headers=headers)


def human_minutes(m):
    if m / 60 < 24:
        return f"{m/60} hours"
    else:
        return f"{m/60/24} days"


# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Parse the response as JSON
    data = response.json()

    # Extract partition information
    partitions = data["partitions"]

    doc_data = []
    # Print partition information
    for partition in partitions:
        part_data = {
            "name": partition["name"],
            "node_count": partition["nodes"]["total"],
        }
        if partition["maximums"]["time"]["set"]:
            part_data["maxtime"] = human_minutes(
                partition["maximums"]["time"]["number"]
            )
        else:
            part_data["maxtime"] = "Unlimited"
        if partition["defaults"]["time"]["set"]:
            part_data["deftime"] = human_minutes(
                partition["defaults"]["time"]["number"]
            )

        part_data["max_cpus"] = find_max_cpus(partition["nodes"]["configured"])
        part_data["max_ram"] = find_max_ram(partition["nodes"]["configured"])
        part_qos = partition["qos"]["assigned"]
        if part_qos:
            if part_qos == "default":

                def get_tres_part(treses, part, name=None):
                    for tres in treses:
                        if tres["type"] == part and (name or tres["name"] == name):
                            return tres["count"]

                MaxCPUPA = get_tres_part(
                    qos_info[part_qos]["limits"]["max"]["tres"]["per"]["account"], "cpu"
                )
                MaxGPUPA = get_tres_part(
                    qos_info[part_qos]["limits"]["max"]["tres"]["per"]["account"],
                    "gres",
                    "gpu",
                )
                if MaxCPUPA != 4294967295:
                    part_data["MaxCPUPA"] = MaxCPUPA
                if MaxGPUPA != 4294967295:
                    part_data["MaxGPUPA"] = MaxGPUPA
                part_qos = "normal"
            MaxJobsPU = qos_info[part_qos]["limits"]["max"]["jobs"]["active_jobs"][
                "per"
            ]["user"]
            if MaxJobsPU != 4294967295:
                part_data["MaxJobsPU"] = MaxJobsPU
            MaxSubmitPU = qos_info[part_qos]["limits"]["max"]["jobs"]["per"]["user"]
            if MaxSubmitPU != 4294967295:
                part_data["MaxSubmitPU"] = MaxSubmitPU
            doc_data.append(part_data)
    print(json.dumps(doc_data))
else:
    print(f"Error: {response.status_code} - {response.text}")
    sys.exit(1)
