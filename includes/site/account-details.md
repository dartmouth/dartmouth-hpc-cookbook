<!-- includes/site/account-details.md
     Institution-specific: Dartmouth-only colour for the {{ cluster.name }} account flow.
     The universal Unity walkthrough lives in docs/getting-started/account.md.
     Replace this file when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ institution.name }}.
-->

## {{ institution.short_name }}-specific notes

The walkthrough above works for any {{ cluster.name }} institution. A few details are specific to {{ institution.short_name }}:

**Username.** When you log in via SSH, your username is your {{ institution.username_label }} with the suffix `{{ institution.username_suffix }}`. For example, if your {{ institution.username_label }} is `f006pfk`, your {{ cluster.name }} username is `f006pfk{{ institution.username_suffix }}`.

**Catch-all PI group.** If you don't have a specific research group to join in Step 2, search for `{{ cluster.catchall_pi_group }}` and request to join. {{ institution.short_name }} maintains this group so any {{ institution.short_name }} researcher can get started on {{ cluster.name }} without waiting on a sponsoring lab.

**Storage tiers at {{ institution.short_name }}.** Members of the catch-all group get the free tier:

- {{ storage.home_quota }} home directory
- Shared access to {{ storage.scratch_path }} for temporary work

If you need the full {{ storage.work_quota }} `{{ storage.work_path }}` allocation or dedicated `{{ storage.project_path }}` storage, your PI group needs to upgrade to a paid tier. See [{{ institution.support_url }}/hpc/unity/]({{ institution.support_url }}/hpc/unity/) for the current pricing and request process.

!!! note "Non-{{ institution.short_name }} collaborators"
    External collaborators need an account through their own institution's {{ cluster.name }} portal. If your collaborator's institution is not part of the {{ cluster.name }} consortium, they may be able to get an affiliate account at {{ institution.short_name }}; contact [{{ institution.support_team }}](mailto:{{ institution.support_email }}) for guidance, or see [{{ cluster.docs_url }}getting-access/]({{ cluster.docs_url }}getting-access/) for the consortium-wide affiliate process.

## Where to ask for help

- **{{ institution.short_name }} questions** (account access, onboarding, billing): [{{ institution.support_team }}](mailto:{{ institution.support_email }}) or [{{ institution.support_url }}]({{ institution.support_url }})
- **{{ cluster.name }} cluster questions** (jobs, software, storage, partitions): [{{ cluster.support_email }}](mailto:{{ cluster.support_email }}) or the {{ cluster.name }} Slack `#help-desk` channel
