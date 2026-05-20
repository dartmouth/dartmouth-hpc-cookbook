---
title: Managing RStor Shares
---
# Managing RStor Shares

{{< callout note >}}
RStor is currently available to UMass Amherst groups only.
{{< /callout >}}

Before requesting an RStor share, you must be a principal investigator (PI).
You should also know how much storage you need, how long you need it, whether you want that storage backed up, and the speedtype you will use for payment.

In the Allocation Portal, RStor is considered a *resource*.
An RStor share is an *allocation*.
In this document, *share* and *allocation* are used interchangably.
For more information, see the [Allocation Portal documentation]({{< relref portal >}}).

## Register in the Account Portal

If you don't already have a Unity account, register for one using the [Unity Account Portal]({{< param account-url >}}).
After registering, wait at least 30 seconds before continuing to the next step. <!-- NSCD negative TTL is 20 seconds -->

{{< figure src="account-portal-login-button.png" alt="account portal login button" >}}

{{< figure src="account-portal-register-button.png" alt="account portal register button" >}}

## Become a PI in the Allocation Portal

If you don't already have a Unity PI group, go to the [Allocation Portal]({{< param allocation-url >}}) and request PI status.
Unity staff will review your request and then you will receive confirmation email.
If your request is approved, you will see a green check mark.

{{< figure src="allocation-portal-user-profile-button.png" alt="allocation portal user profile button" >}}

{{< figure src="allocation-portal-upgrade-account-pi-status.png" alt="allocation portal upgrade account to PI status button" >}}

{{< figure src="allocation-portal-account-upgraded-successfully.png" alt="allocation portal account upgraded successfully" >}}

## Create a Project in the Allocation Portal

Next, create a new project in the [Allocation Portal]({{< param allocation-url >}}).
Enter your project's name, description, and field of science, and then save.
You may create multiple projects, but this is not necessary for most users.
To learn more about projects, see the [Allocation Portal documentation]({{< relref portal >}}).

{{< figure src="allocation-portal-projects-button.png" alt="allocation portal projects button" >}}

{{< figure src="allocation-portal-create-project-button.png" alt="allocation portal create project button" >}}

{{< figure src="allocation-portal-create-project-save-button.png" alt="allocation portal project create save button" >}}

## Create an Allocation

In the [Allocation Portal]({{< param allocation-url >}}), create an allocation and select **RStor** as the resource.
Fill in the **Justification** field with all required information.
After you submit, the allocation status will appear as `New`.
The Unity staff will review your request and notify you by email.
Once your request is approved and payment is received, the allocation status will change to `Approved`, then shortly after it will change to `Active`.

{{< figure src="allocation-portal-projects-button.png" alt="allocation portal projects button" >}}

{{< figure src="allocation-portal-project-select.png" alt="allocation portal project select" >}}

{{< figure src="allocation-portal-allocation-request-button.png" alt="allocation portal allocation request button" >}}

{{< figure src="allocation-portal-allocation-submit-button.png" alt="allocation portal allocation submit button" >}}

{{< figure src="allocation-portal-allocation-new.png" alt="allocation portal allocation new" >}}

{{< figure src="allocation-portal-allocation-active.png" alt="allocation portal allocation active" >}}

Once your allocation is `Active`, your RStor share should be ready within approximately 15 minutes. <!-- rstor_sync cron job is */5, nscd positive TTL is 10 minutes, TODO will SMB pick up change immediately? -->
See [the Usage page]({{< relref usage >}}) for instructions on how to use it.

To find your share, you will need to remember the **share name** you provided when creating the allocation.
To look it up, open your allocation and review its attributes:

{{< figure src="allocation-portal-rstor-share-name-attribute.png" alt="allocation portal rstor share name attribute" >}}

## Allow Other Users to Use Your Allocation

To grant access to other users, add them first to your project and then to your allocation in the [Allocation Portal]({{< param allocation-url >}}).

If a user does not have a Unity HPC Platform account, have them complete the instructions at the top of this document, under **Register in the Account Portal**.
Once they register, you should be able to add them immediately. <!-- ldap_user_search has no cache -->

If you need to add a large number of users in bulk, contact us in the [Unity User Community Slack]({{< relref community >}}) or in one of [our other support channels]({{< relref contact >}}).

{{< figure src="allocation-portal-projects-button.png" alt="allocation portal projects button" >}}

{{< figure src="allocation-portal-project-select.png" alt="allocation portal project select" >}}

{{< figure src="allocation-portal-project-add-users-button.png" alt="allocation portal project add users button" >}}

{{< figure src="allocation-portal-user-search-button.png" alt="allocation portal user search button" >}}

{{< figure src="allocation-portal-user-search-add-user-to-project-button.png" alt="allocation portal user search add user to project button" >}}

After adding the user to your project, add them to your allocation:

{{< figure src="allocation-portal-projects-button.png" alt="allocation portal projects button" >}}

{{< figure src="allocation-portal-project-select.png" alt="allocation portal project select" >}}

{{< figure src="allocation-portal-allocation-select.png" alt="allocation portal allocation select" >}}

{{< figure src="allocation-portal-add-users-to-allocation-button.png" alt="allocation portal add users to allocation button" >}}

{{< figure src="allocation-portal-add-selected-users-to-allocation-button.png" alt="allocation portal add selected users to allocation button" >}}

To revoke a user's access, follow this process in reverse.
After adding or removing users, allow up to 15 minutes for changes to take effect. <!-- rstor_sync cron job is */5, nscd positive TTL is 10 minutes, TODO will SMB pick up change immediately? -->
