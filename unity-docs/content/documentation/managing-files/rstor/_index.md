---
title: RStor Research Storage System
aliases:
    - /about/rstor
---
# RStor Research Storage System

RStor is a mid-performance low-cost storage system launched in 2025 for storing research data that doesn’t have unusual security requirements.
RStor is mounted on the Unity batch cluster via NFS and is mountable on UMass Amherst desktop computers via SMB. Shares are managed via the new [Unity HPC Platform Allocation Portal]({{< param allocation-url >}}). RStor is currently only available to **qualified PIs at UMass Amherst**.

{{< callout note >}}
RStor is hosted at the MGHPCC and undergoes:
- A yearly downtime for a 1-3 days every spring, usually late May or early June
- A monthly maintenance period on the first Tuesday of every month 6-9AM
{{< /callout >}}

## Data Security
RStor is currently approved for data levels 1 and 2 only, according to [UMass Amherst's Data Categorization Levels](https://www.umass.edu/it/data-categorization-levels).

{{< callout warning >}}
RStor is not approved for any data subject to restrictions under the **Export Administration Regulations (15 CFR Parts 730-774)** or the **International Traffic in Arms Regulations (22 CFR Parts 120-130**), as well as data subject to **Health Insurance Portability and Accountability Act (HIPAA) or Controlled Unclassified Information (CUI)** safeguarding requirements.
{{< /callout >}}

## Purchasing & Related Policies
- **Minimum purchase period** is 1 year
- **Backed-up storage** pricing is TBD
- **Backups** (if applicable) are retained for 90 days and performed daily from snapshots that are taken every 4 hours. 18 snapshots are retained and can be accessed at <share>/.zfs/snapshot but user self-restore functionality from this location hasn’t been extensively tested yet. Backups are not currently offsite or immutable.
- **Snapshots** are available for backed-up and non-backed-up shares
- **Non backed-up storage** pricing is TBD
- We will do our best to accommodate share size increase requests but cannot guarantee our ability to do so in all cases. **Please try to keep share size change requests to a maximum of twice per year.**
- We will **pro-rate and co-term space** increase requests with the original request
- You have **30 days** to get your data off RStor after the end of a purchase agreement before it will be permanently deleted.
- UMass Amherst Research Computing & Data (RCD) will commit to keeping RStor as a service for **at least 3 years from share purchase time**, or will offer an analogous service to migrate to. Pricing will stay the same for the duration of the initial agreement, regardless of platform.

## Beta-Testing Users
- **By the end of February 2026**, beta-testing users will need to submit payment or remove their data from RStor.
- To continue access, email drparker@umass.edu and werikson@umass.edu with:
    - Share name
    - Accounts that should have access
    - Storage size

## How to Request a Share
Shares are managed via the new [Unity HPC Platform Allocation Portal]({{< param allocation-url >}}). You will need to provide the following:
1. **Name of share**
    - No spaces, all alphanumeric characters, limit 32 characters
2. **Size of share**
    - Increments of 1TB
    - Anything over 200TB might require extra time
    - Maximum ~700TB
3. **Length of time you expect to have the share (in years)**
4. **Backed-up storage or non-backed up storage**
5. **Speedtype** to be charged
6. **Contact information** for who can set up payment
