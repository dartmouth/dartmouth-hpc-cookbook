---
title: Unity HPC Cluster Acceptable Use Policy
aliases:
  - /policy
---
Unity is a High Performance Computing Cluster running Ubuntu Linux housed at the [Massachusetts Green High Performance Computing Center (MGHPCC)](https://www.mghpcc.org). Unity is operated primarily by the University of Massachusetts Amherst (UMass Amherst), but is a joint project between many institutions, including the University of Rhode Island, and the Dartmouth, Boston, and Lowell UMass campuses.

Unity also has some users from corporate partners, defined as for profit or non-profit entities that contract with UMass Amherst IT for Unity access.

This policy was written to clarify the terms under which Unity may be accessed and used and to help ensure fair and equitable access. Unity services are provided on shared resources. This policy applies to all users of Unity, including but not limited to faculty, staff, students, researchers, and external collaborators. It covers all resources associated with Unity, including hardware, software, data storage, and network infrastructure. Use of Unity must adhere to the following terms. These terms and conditions may be amended from time to time.

## ACCOUNTS
1. For users from an academic institution, all uses of Unity must be directly related to non-commercial research or other approved educational activities at said user’s home institution. For users from a corporate partner, all uses of Unity must be authorized by that partner.
2. Granting of PI (research group lead) accounts is determined by the home institution’s policies.
3. If a prospective user does not qualify for a PI account, said user can request to join a PI’s account, provided that user is working on said PI’s team. Access to that PI group is granted or denied solely by said PI. All uses of that access must be directly related to that PI’s research.
4. Access is restricted to authorized users affiliated with UMass Amherst or approved partner institutions and their approved collaborators.
5. User access to Unity is tied to the user’s account access at user’s home institution. When a user’s account at their home institution expires, so does said user’s access to Unity.
6. Users are required to log into the Unity portal once every six months to keep their account active. If user is a PI, they are required to check the members of their PI group to certify that said members are all actively working in said PI’s research group and still need Unity access for that purpose.
7. Please see our [Unity Account Expiration and Deletion Policy]({{< relref "account-expiration.md" >}}) for additional information.

## STORAGE
8. Unity storage is not backed up. Therefore, Unity should not be the primary storage site for data. Users are responsible for backing up their data.
9. Prior to use, a user intending to upload data to Unity must ensure that Unity complies with all applicable data security and usage requirements. Unity is not HIPAA or NIST 800-171 compliant. For further information please see our [Security Statement]({{< relref "security.md" >}}).
10. All data will be deleted one year after account expiration. Please see our [Unity Account Expiration and Deletion Policy]({{< relref "account-expiration.md" >}}).
11. At a technical file permissions level, any data stored in `/work` or `/project` is owned by the PI associated with that directory. Any data stored in a user’s home directory is owned by that user. This does not imply legal ownership of said data, which is not covered under this policy.
12. Every PI account comes with 1TB of storage in /work. Every Unity account comes with 100GB of storage in said account’s home directory. Additional storage is available and policies vary by institution. Please see the [storage documentation]({{< relref "storage.md" >}}) or [contact the appropriate person at your user's member institution]({{< relref people >}}) for details.

## USAGE
13. Users shall not intentionally disrupt another user’s work or attempt to “game the system” to gain access to additional resources.
14. Users are not permitted to run jobs on the login nodes. Disruptive processes on the login nodes may be terminated without notice.
15. Jobs submitted to the Unity cluster should only request resources necessary for the job, as closely as possible. Users that request excessive or unnecessary resources may have their jobs immediately terminated without advance notice.
16. Users shall not share their access keys with other users. Sharing of access keys may result in suspension or termination of access.
17. Users are responsible for all activities conducted under their account.
18. Sharing accounts or login credentials is strictly prohibited.
19. Users must immediately report any known or suspected security incident, loss, or misuse of Unity access keys or other credentials to {{< help-email >}}.
20. Users will comply with all applicable laws and regulations of their respective institutions, including, but not limited to, intellectual property laws.
21. Access to Unity is subject to the U.S. Department of the Treasury, Office of Foreign Assets Control’s (OFAC) regulations. These regulations prohibit citizens of countries subject to OFAC comprehensive sanctions (i.e. Iran, Cuba, North Korea, and the Crimea, Donetsk, and Luhansk regions of Ukraine) from accessing Unity unless they are physically located within the U.S. Users who are citizens of countries subject to OFAC comprehensive sanctions will not access Unity from any location outside of the U.S.
22. Data subject to restrictions under the Export Administration Regulations (15 CFR Parts 730-774) or the International Traffic in Arms Regulations (22 CFR Parts 120-130), as well as data subject to Health Insurance Portability and Accountability Act (HIPAA) or Controlled Unclassified Information (CUI) safeguarding requirements, may not be uploaded to the Unity Cluster. Users must also handle data in accordance with their own institutional data security policies.
23. Logged information, including information provided by user for registration purposes, is used for administrative, operational, accounting, monitoring and security purposes. This information may be disclosed, via secured mechanisms, only for the same purposes and only as far as necessary to other organizations cooperating with Unity, or as necessary to comply with a lawful court order or subpoena.
24. Jobs that scrape the internet extensively or will otherwise trigger detectors of malicious behavior on the internet are prohibited.

## ENFORCEMENT
25. The cluster administrators actively monitor system activity for misuse, abuse, and criminal activity.
26. The Unity team reserves the right to terminate jobs that are overly disruptive or in violation of these policies. Notification of termination and the reasons why will be provided.
27. Violations of this policy may result in warnings, suspension, account termination, or referral to institutional disciplinary processes. Severe violations shall be reported to relevant authorities and could result in legal action.

## ACKNOWLEDGMENT
By using Unity, user acknowledges that they have read, understood, and agree to comply with this Acceptable Use Policy. As stated above, failure to adhere to this policy may result in disciplinary actions, including suspension or termination of access privileges.

This system is provided without warranty or set service level. UMass Amherst or any of its partners will not be held liable in the event of any system failure or loss of data. Use of resources and services through Unity is at user’s own risk. There are no guarantees that resources and services will be available, that they will suit every purpose, or that data will never be lost or corrupted. Users are responsible for backing up their own critical data or using replicated or archive storage services not provided through Unity.

Any questions can be directed to {{< help-email >}}.
