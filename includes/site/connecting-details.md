<!-- includes/site/connecting-details.md
     Institution-specific: describes how to connect to the HPC systems.
     Replace this file with your own connection details when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ institution.name }}.
-->

Each of {{ institution.short_name }}'s HPC systems has its own address:

| Host | Description | Address |
|------|-------------|---------|
| Discovery | {{ institution.short_name }}'s primary HPC cluster with a shared job scheduler | `{{ cluster.login_node }}` |
| Andes | Large shared-memory system for memory-intensive workloads | `andes.dartmouth.edu` |
| Polaris | Large shared-memory system for memory-intensive workloads  | `polaris.dartmouth.edu` |
| Babylon | Thayer / CS shared-memory nodes (12 hosts) | `babylon1.dartmouth.edu` – `babylon12.dartmouth.edu` |

To connect, use your NetID (which is also your HPC account name) and the address (a.k.a. hostname) of the system you want to log in to.

For example, to log into the Discovery cluster:

```bash
ssh your_netid@{{ cluster.login_node }}
```

To connect to one of {{ institution.short_name }}'s shared-memory systems:

```bash
ssh your_netid@andes.dartmouth.edu
ssh your_netid@polaris.dartmouth.edu
```

If you are a member of Thayer or in the CS program, you can log into one of the Babylon systems, for example:

```bash
ssh your_netid@babylon1.dartmouth.edu
```

To help you choose, check out the [Babylon usage page](https://cluster-usage.thayer.dartmouth.edu/) and pick one with a low user count.