## Conda environment presets

{{ cluster.name }} provides a set of pre-configured Conda environment presets
for common frameworks. Two helper scripts make it easy to work with them:

- **`unity-conda-list`**: shows available presets (no arguments), or lists the
  packages in a specific preset.
- **`unity-conda-create`**: creates a Conda environment from a preset.

To make the helper scripts available, add this to your `~/.bashrc`:

```bash
export PATH=/modules/user-resources/unity-conda:$PATH
```

### List available presets

```bash
unity-conda-list
```

### Create an environment from a preset

```bash
unity-conda-create -n pytorch-latest -p /path/to/your/scratch/envs/pytorch
```

The `-n` flag selects the preset name, and `-p` sets the environment prefix
(where the files are stored). Always use `-p` to keep the environment off your
home directory.

The presets live in `/modules/user-resources/unity-conda/unity-conda-presets`.
