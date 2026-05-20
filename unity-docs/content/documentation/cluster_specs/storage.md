---
title: Storage
icon: package_2
aliases:
    - /storage
blurb: >
    A table of Unity's storage systems and use cases.
weight: 50
---

# Storage



## Storage types

Unity provides access to a variety of storage methods for different use cases, including high performance storage, mid performance/large storage, and archival storage.



### High performance storage

Unity's `/home`, `/work`, and [`/scratch`]({{< relref "hpc-workspace" >}}) directories use high performance [VAST DataStore](https://www.vastdata.com/platform/datastore). This storage is suitable for Job I/O (reading and writing to files during a [job]({{< relref jobs>}})), which requires a fast, parallel filesystem for best job performance. **You must store or stage all data for Job I/O in a high performance storage location**. While it is possible to purchase additional `/work` space, we strongly advise using [`/scratch` via HPC Workspace]({{< relref "hpc-workspace" >}}) or a lower performance storage option (see below) if possible.

{{< callout "warning" "Snapshots" >}}
The `/home`, `/work`, and now the `/project` directories are [snapshotted]({{< relref "#snapshots" >}}) on a 3-day rolling basis.  
***Other directories on Unity, including `/scratch`, DO NOT have snapshots!*** We can't restore data lost from these directories.
{{< /callout >}}


### Mid performance, large storage

Often, researchers need "warm" data storage that's larger than their [high performance storage group quotas]({{< relref quotas >}}). We recommend storing the bulk of your data in `/project` and staging the portions you need for a particular workload in `/work` or [`/scratch`]({{< relref "hpc-workspace" >}}) as needed. While the location of
`/project` directories varies by institution, most are housed on the [Northeast Storage Exchange (NESE)'s Disk Storage](https://nesedev.readthedocs.io/en/latest/user-docs.html#nese-disk). Storing your data in `/project` is a cost-effective way to house data in a location with excellent transfer speeds to Unity's high performance storage. To request `/project` space, email {{< help-email >}}. Most campuses provide a base allocation free of charge to research groups upon request.

In addition to NESE Disk, Unity researchers can request access to the [Open Storage Network (OSN)](https://www.openstoragenetwork.org/) S3 storage pods. UMass Amherst and URI own pods with storage available upon request (cost varies), or researchers can request an allocation of 10T through 50T through the [NSF's ACCESS program](https://access-ci.org/).

To request `/project` or OSN storage, email {{< help-email >}}.

### Archival storage

Researchers who need to store data long-term (several years) can purchase archival tape storage through [NESE's Tape Storage](https://nesedev.readthedocs.io/en/latest/user-docs.html#nese-tape). NESE Tape is extremely cost-effective, high-capacity storage meant to house data that's not often used or modified. To request NESE Tape storage, email {{< help-email >}}.

### Storage summary and mountpoint table

| Mountpoint | Name                | Type     | Base quota                                   | Notes                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ------------------- |  -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/home`    | Home directories    | SSD      | 100 GB                                   | Home directories should be used only for user init files. |
| `/work/pi_`    | Work directories    | SSD      | 1 TB                                  | Work is the primary location for running cluster jobs. This is a shared folder for all users in the PI group.|
| `/project` | Project directories | HDD      | As Needed                                 | Project directories are available to PIs upon request. A common use case is generating job output in `/work` and copying to `/project` afterwards. **Not for job I/O** |
| `/scratch` | Scratch space       | SSD      | 15TB | Exceptions may apply. See [the HPC Workspace scratch documentation]({{< relref "hpc-workspace" >}})  |
| `/nese`    | NESE mounts         | HDD | Varying                                 | **DEPRECATED:** Legacy location for mounts from the Northeast Storage Exchange (NESE). **Not for job I/O** |
| `/nas`     | Buy-in NAS mounts   | Varying  | Varying                                 | **DEPRECATED:** Location for legacy buy-in NAS hardware. |
| `/gypsum`  | Gypsum devices      | HDD      | Varying                                 | **DEPRECATED:** Storage from the former UMass Amherst CICS Gypsum cluster. |

## I need more storage!

To request additional storage on Unity:

1. Check out our [storage management information]({{< relref quotas >}}) to determine if you can reduce storage use without storage expansion.
2. Determine the amount, duration, and type of storage needed using our handy [flowchart]({{< relref "#storage-expansion-flowchart">}}) and our [storage descriptions]({{< relref "#storage-types" >}}).
3. If you're requesting a storage expansion that requires payment (see the [storage expansion options table]({{< relref "#storage-expansion-options" >}})), identify the appropriate institution payment method (e.g. speedtype, Chartfield string, etc) for your payment source and the name and email of the finance representative within your department. If you're unsure what to use, contact your [institution's representative]({{< relref "people#points-of-contact" >}}) for institution-specific information.
4. Email {{< help-email >}}. If you're not the PI (head) of your research group, this must be done by your PI or with your PI's consent.

{{< callout "note" "Storage purchasing via grants" >}}
You can also write Unity storage purchases into grants. See our [grant page]({{< relref boilerplate >}}) for
grant boilerplate and information.
{{< /callout >}}

### Storage expansion options

| **Resource** | **Free Tier Threshold** | **Notes** |
|---|---|---|
| [PI group work directories]({{< relref "#high-performance-storage" >}}) | 1T | *Free tier:* automatically allocated on PI account creation.<br>*Purchasing:* available in 1T increments on 6 month intervals, up to 3 years at a time. |
| [PI group project directories]({{< relref "#mid-performance-large-storage" >}}) | 5T (URI, UMassD threshold may vary) | *Free tier:* allocated upon request via the storage form.<br>*Purchasing:* available in 5T increments on 1 year intervals, up to 5 years at a time. |
| [Scratch space]({{< relref "hpc-workspace" >}}) | 50T soft cap | No purchasing necessary, see our [scratch documentation]({{< relref "hpc-workspace" >}}). |
| [NESE Tape]({{< relref "#archival-storage" >}}) | N/A | *Free tier:* none available<br>*Purchasing:* available in 10T increments on 5 year intervals. |
| [OpenStorageNetwork S3]({{< relref "#mid-performance-large-storage" >}})<br>from URI and UMass Amherst | TBD | *Purchasing:* TBD |

### Storage expansion flowchart

The following flowchart is intended to help decide what [type of storage]({{< relref "#storage-types" >}}) you need or whether your existing data is ideally placed.

```mermaid
flowchart TD
    start("`We need more storage!`")
    quotaCheck("`My group can't reduce space without an increase.`")
    active("`Are the data needed for active jobs?`")
    frequent("`Can you stage subsets of this data in high performance storage as needed for active jobs?`")
    longtermLimited("`Do you need to archive data for a long time without frequent access or modification?`")
    sharing("`Do you need to share this data publicly?`")
    tape("`Request/Purchase NESE Tape archival storage.`")
    osn("`Request/Purchase OSN S3 storage or NESE /project space.`")
    intermediate("`Do you need additional storage for workflows that create temporary intermediate files?`")
    inactiveWorkData("`Does your group have inactive data in /work that could be moved to other storage?`")
    scratch("`Try Unity's scratch space: HPC Workspace.`")
    publicData("`Do you need additional storage to store a public, open-access dataset?`")
    email("`Email hpc@umass.edu about /datasets.`")
    purchaseWork("`Purchase additional /work storage.`")

    start --> quotaCheck
    quotaCheck --> intermediate
    intermediate -- NO --> active
    intermediate -- YES --> scratch
    active -- YES --> publicData
    active -- NO --> longtermLimited
    frequent -- NO --> purchaseWork
    frequent -- YES --> osn
    longtermLimited -- YES --> sharing
    sharing -- YES --> osn
    sharing -- NO --> tape
    longtermLimited -- NO --> osn
    inactiveWorkData -- YES --> osn
    inactiveWorkData -- NO --> frequent
    publicData -- YES --> email
    publicData -- NO --> inactiveWorkData

    click scratch "{{< relref "hpc-workspace" >}}" "Scratch space link"
    click email "mailto:hpc@umass.edu" "Help email"
    click quotaCheck "{{< relref quotas >}}" "Space management link"
    click osn "{{< relref "#mid-performance-large-storage" >}}" "Mid performance storage"
    click purchaseWork "{{< relref "#high-performance-storage" >}}" "High performance storage"
    click tape "{{< relref "#archival-storage" >}}" "Tape storage"
```

## Snapshots

Backups are not available on the Unity cluster.  
There are temporary snapshots created each day at 5am UTC.  
Snapshots older than three days are deleted.  
Self-directed restores are accomplished by accessing read-only snapshots (see table below).

| Filesystem | Name | Snapshot location |
| --- | --- | --- |
| `/home/<username>` | Home directory | `/snapshots/home/unity_<timestamp>/<username>` |
| `/work/pi_<pi-username>` | Work directory | `/snapshots/work/unity_<timestamp>/pi_<pi-username>` |
| `/project/pi_<pi-username>` | Project directory | `/snapshots/project/<organization>-nesepool@<timestamp>` |

### **Accessing /project Snapshots**
Snapshots for `/project` directories are stored under `/snapshots/project/`, but you need to know which **organization** the project belongs to. Inside `/snapshots/project/`, go to the correct *nesepool*:

- `5col` = Non-UMass Five Colleges  
- `corp` = Corporate partners  
- `uma` = UMass Amherst  
- `umb` = UMass Boston  
- `umd` = UMass Dartmouth  
- `uml` = UMass Lowell  
- `uri` = University of Rhode Island 

### Restore files from a snapshot

The following code sample shows how to restore a specific directory from a snapshot. The example restores to a `restore` directory first to ensure that changes aren't overwritten.

```bash
mkdir ~/restore
cp -a /snapshot/home/unity_2023-02-08_05_00_00_UTC/<username>/path/to/file/or/directory ~/restore/
```
