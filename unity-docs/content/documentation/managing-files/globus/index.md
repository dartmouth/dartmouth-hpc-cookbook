---
title: Globus
---

# Globus

Globus Connect allows for transfers between Globus collections, which is useful when migrating from one 
High Performance Computing (HPC) cluster to another.

## Join the UMass Globus subscription
UMass has its own Globus subscription! Anyone with an `@umass.edu` Globus ID can join. Joining a subscription allows you to use advanced data management and remote computation capabilities on the Globus platform. The following steps will guide you through how to join UMass's Globus subscription.

1. Go to [app.globus.org/settings/subscriptions](https://app.globus.org/settings/subscriptions).

2. If prompted, log in to Globus with your UMass credentials.

3. In the top right of the page, click **Find a Subscription** and enter *UMass Amherst* into the search bar.

{{<figure src="globus-find-a-subscription.png" title="Find a Subscription search bar" alt="Globus Find a Subscription search bar">}}

4. Click on *University of Massachusetts Amherst* as it appears in the search bar. You will be taken to a landing page with information about UMass’s Globus subscription.

5. Click **Join this Subscription** on the right side of the page.

{{< callout note "Membership Pending" >}}
You may see a Membership Pending message pop up when you attempt to join. If this happens, please reach out in the `#help-desk` channel of the Unity User Community Slack to get your membership approved.
{{< /callout >}}

## Use Globus Connect to transfer files
The following steps will guide you through how to use Globus Connect to transfer files from one Globus collection to another. 

**Know which two Globus collections you want to transfer between.** One Globus collection is presumably Unity, and the other could be your local machine if you install Globus 
Connect Personal.

1. Go to [app.globus.org](https://app.globus.org).
2. If prompted, select your university in the field provided to login with your university's identity provider. Click **Continue** to log in.

    {{< figure src="globus-login.png" title="Globus login" alt="Globus login">}}

3. Go to the **File Manager** page. 
    The File Mananger page opens, which shows a **Collection** field and a **Path** field for you to fill in.

4. In the **Collection** field, select one of the two collections in your transfer.
At the time of this writing, there is more than one collection named Unity. 

    To select **Unity's Globus endpoint**, paste the following string into the search box:
    `acda5457-9c06-4564-8375-260ba428f22a`

    {{< figure src="globus-collection-search.png" title="Globus collection search" alt="Globus collection search" >}}

    {{< callout note >}}
If after selecting the collection you get an "Identity Required" page, you should click on the email address associated with your Unity account. 
Only if that is not listed should you search for it.
    {{</ callout >}}


5. After selecting a collection, there are two mirrored panels. If not, 
select the **split panel layout** icon in the top right.

    {{< figure src="globus-select-split-panels.png" title="Globus split panels" alt="Globus split panels" >}}

6. Select the second collection involved in your transfer. The collection search page reopens. 

    {{<callout note >}}
Do not transfer files from Unity to itself! This will be slow and cause lots of unnecessary load on our network.
    {{</ callout >}}

   The following image shows an example of one of the two split panels:

    {{< figure src="globus-configure-transfer.png" title="Globus transfer" alt="Globus transfer" >}}
    
    For each selected collection, the panels show **a number of selected files**, and a **Start** button to copy the selected files to the other side.

7. Select the files you want to copy to the other collection. 
8. To copy the files to the other collection, press **Start**.
