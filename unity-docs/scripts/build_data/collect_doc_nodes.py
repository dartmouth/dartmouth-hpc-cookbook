from ClusterShell.NodeSet import NodeSet
from subprocess import run  # nosec
from math import floor
import json

# Data tables
gpu_types = {
    "a40": {"model": "NVIDIA A40", "vram": 48},
    "m40": {"model": "NVIDIA Tesla M40", "vram": 24},
    "titanx": {"model": "NVIDIA GeForce GTX TITAN X", "vram": 12},
    "rtx8000": {"model": "NVIDIA Quadro RTX 8000", "vram": 48},
    "a100-40g": {"model": "NVIDIA Tesla A100", "vram": 40},
    "a100-80g": {"model": "NVIDIA Tesla A100", "vram": 80},
    "v100": {"model": "NVIDIA Tesla V100", "vram": 16},
    "1080ti": {"model": "NVIDIA GeForce GTX 1080 Ti", "vram": 11},
    "2080": {"model": "NVIDIA RTX 2080", "vram": 8},
    "2080ti_12": {"model": "NVIDIA RTX 2080ti", "vram": 12},
    "2080ti_11": {"model": "NVIDIA GeForce GTX 2080 Ti", "vram": 11},
}

cpu_feature_mapping = {
    "amd1900x": "AMD Ryzen Threadripper 1900X 8-Core Processor",
    "amd7402": "AMD EPYC 7402 24-Core Processor",
    "amd7502": "AMD EPYC 7502 32-Core Processor",
    "amd7543": "AMD EPYC 7543 32-Core Processor",
    "amd7702": "AMD EPYC 7702 64-Core Processor",
    "amd7763": "AMD EPYC 7763 64-Core Processor",
    "armn1": "Neoverse-N1",
    "intel2620v3": "Intel(R) Xeon(R) E5-2620 v3",
    "intel4110": "Intel(R) Xeon(R) Silver 4110",
    "intel4116": "Intel(R) Xeon(R) Silver 4116",
    "intel4214r": "Intel(R) Xeon(R) Silver 4214R",
    "intel4215r": "Intel(R) Xeon(R) Silver 4215R",
    "intel5118": "Intel(R) Xeon(R) Gold 5118",
    "intel5218": "Intel(R) Xeon(R) Gold 5218",
    "intel6126": "Intel(R) Xeon(R) Gold 6126",
    "intel6130": "Intel(R) Xeon(R) Gold 6130",
    "intel6140": "Intel(R) Xeon(R) Gold 6140",
    "intel6148": "Intel(R) Xeon(R) Gold 6148",
    "intel6226r": "Intel(R) Xeon(R) Gold 6226R",
    "intel6238r": "Intel(R) Xeon(R) Gold 6238R",
    "intel6248r": "Intel(R) Xeon(R) Gold 6248R",
    "intel8352y": "Intel(R) Xeon(R) Platinum 8352Y",
    "intel8358": "Intel(R) Xeon(R) Platinum 8358",
    "intel6326": "Intel(R) Xeon(R) Gold 6326",
    "intel8480": "Intel(R) Xeon(R) Platinum 8480+",
    "p922": "POWER9, altivec supported",
    "p923": "POWER9, altivec supported",
}

general_no_preempt_partitions = {
    'cpu',
    'cpu-long',
    'gpu',
    'gpu-long',
    'power9',
    'power9-gpu'
}

def toGB(amt):
    return floor(float(amt) / 1024)


def gpu_lookup(greses, features):
    if greses == "(null)":
        return {"model": None, "vram": None}
    for feature in features:
        if feature in gpu_types:
            return gpu_types[feature]


def getCPU(node, features):
    for fstr, model in cpu_feature_mapping.items():
        if fstr in features:
            return model
    raise Exception(f"No CPU fround for {node} with {features}")


sinfo = run(
    ["sinfo", "-hNo", "%n|%P|%b|%X|%Y|%m|%G"], encoding="utf8", capture_output=True
)
node_info = {}
last_node = None
part_list = []
for row in sinfo.stdout.split("\n"):
    if row == "":
        break
    node, partitions, features, sockets, cores, memory, gres = row.split("|")
    if node != last_node:
        last_node = node
        part_list = []

    features = sorted(features.split(","))
    cpu_model = getCPU(node, features)
    gpu = gpu_lookup(gres, features)
    gpu_count = 0
    if gres != "(null)":
        greses = gres.split(",")
        for gres in greses:
            gres_info = gres.split(":")
            if gres_info[0] == "gpu":
                gpu_count = int(gres_info[-1])

    # Remove * from default partition
    if partitions[-1] == "*":
        partitions = partitions[:-1]
    if partitions != "building":
        part_list.append(partitions)
    range = node[:-3]
    node_info[node] = {
        "group": range,
        "partitions": sorted(part_list),
        "features": features,
        "cores": int(sockets) * int(cores),
        "ram": toGB(memory),
        "gpu_model": gpu["model"],
        "gpu_count": gpu_count,
        "vram": gpu["vram"],
        "cpus": f"{sockets}x {cpu_model} ({cores} core)",
        "general_use": bool(general_no_preempt_partitions.intersection(set(part_list)))
        }


nodes = {}
groups = {}
group_counts = {}
for name, n in node_info.items():
    key = len(groups)
    for k, v in groups.items():
        if n == v:
            group_counts[k] += 1
            nodes[k].append(name)
            break
    else:
        groups[key] = n
        group_counts[key] = 1
        nodes[key] = list()
        nodes[key].append(name)

for k, v in groups.items():
    v["key"] = k
    v["count"] = group_counts[k]
    v["nodes"] = nodes[k]
    v["nodes_folded"] = str(NodeSet.fromlist(nodes[k]))

print(json.dumps(list(groups.values())))
