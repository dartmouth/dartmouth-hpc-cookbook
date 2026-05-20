---
title: Unity Security Statement
---
Unity runs Ubuntu 24.04LTS. We run monthly security and OS updates on all world-facing nodes, and quarterly on all compute nodes. Unity is behind a next-generation firewall with a DMZ for all nodes that provide world-facing services, and all other nodes are behind NAT. Data is not encrypted at rest on our storage devices nor in transit internally to the cluster, but there is no way to log into or transport data into Unity that doesn't utilize encryption. Unity utilizes normal linux user separation schemes for data protection and a central logging server for internal auditing purposes. Unity runs regular automated checks to report on users that have exposed their data to readability beyond their research group, with an exception system for groups that have special needs to do this.

Authentication for the web interface of Unity is done via Shibboleth/SAML over https, leveraging InCommon, through which you can then upload SSH keys for command line access to the cluster. Therefore, Unity never receives, much less stores, your password, as your home institution does the authentication, not Unity.

Unity is housed at the [Massachusetts Green High Performance Computing Center (MGHPCC)](https://www.mghpcc.org), which provides centralized physical access control and 24/7 monitoring.

For any further questions or concerns, reach out to {{< help-email >}}.
