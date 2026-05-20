<!-- includes/site/connecting-details.md
     Institution-specific: describes how to connect to the HPC systems.
     Replace this file with your own connection details when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ institution.name }}.
-->

{{ cluster.name }} offers two ways to connect:

| Method | Address | Best For |
|--------|---------|----------|
| **SSH** (command line) | `{{ cluster.login_node }}` | Terminal access, scripts, file transfers |
| **Open OnDemand** (web portal) | [{{ cluster.ondemand_url }}]({{ cluster.ondemand_url }}) | Jupyter, RStudio, VS Code, file browser |

To connect via SSH, use your {{ institution.short_name }} {{ institution.username_label }} in the format `{{ institution.username_label | lower }}_dartmouth_edu`:

```bash
ssh your_{{ institution.username_label | lower }}_dartmouth_edu@{{ cluster.login_node }}
```

!!! note "SSH key required"
    {{ cluster.name }} uses SSH key authentication. If you haven't set up your key yet, see the [account setup instructions](account.md#step-3-generate-an-ssh-key).

!!! note "Open OnDemand uses separate SSO"
    The Open OnDemand web portal at [{{ cluster.ondemand_url }}]({{ cluster.ondemand_url }}) requires a separate SSO login through your institutional identity provider.
