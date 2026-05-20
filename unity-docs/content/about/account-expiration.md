---
title: Unity Account Lifecycle Policy
---
## Account Expiration
### If a Unity user doesn’t log into [the account portal]({{< param account-url >}}) for 180 days, said user’s account will be idle-locked.
* Lock warning emails and notices upon login will happen for 5 weeks
* Idle-Locked accounts cannot log into any part of Unity except the account portal

### If a Unity account is idle-locked for a year, said user’s account will be disabled.
* If said user is the owner of a PI group, their home directory is archived. Otherwise, their home directory is deleted within 24 hours.
* If said user is the owner of a PI group, that group will also be disabled
    * The home institution’s [point of contact](/people/#point-of-contact) will be given a chance to retrieve the relevant data or have a conversation about extenuating circumstances.
    * With the agreement of the home institution, all data in the PI’s `/work` and `/home` and `/project` directories will be deleted. This data cannot be recovered.
    * All accounts will be removed from the PI group
    * The PI’s slurm account will be deleted
* The account will be removed from all PI groups
* The PI will receive a notification that the account has been disabled

**Disable warning emails will be sent for 9 weeks.**

## Expiration FAQ
### If I am a PI and you deleted my `/work` or `/project` data because I left my account idle-locked for a year, can that data be recovered for any period of time?
Your home institution's [point of contact](/people/#point-of-contact) may have elected to transfer some or all of your data.
Any data they did not elect to transfer cannot be recovered.
Unity is not intended for long-term storage and doesn’t have backups.

### If my PI account was disabled, can I apply for a PI account in the future?
Yes, absolutely. Just log into the portal and request one like you did the first time.

### If my PI let their account get disabled and I had data in their `/work` or `/project` directories, can I get that data back?
It depends:
* If the data is still intact, we can work with you to get it back.
* If the data was transferred to another institution, we can put you in touch with their [point of contact](/people/#point-of-contact).
* If the data was deleted, no.

## Manual Action
* If a user would like all their information removed from our system, they can email us at [hpc@umass.edu](mailto:hpc@umass.edu) and we will take all the above steps, and then remove all non-essential data associated with them from our system within 10 business days.
    * This does not include their username. Usernames cannot be removed from our system.
* A user may disable their account at any time as long as they are not the owner of an enabled PI group.
* A PI group owner may disable their group at any time as long as the group has no other members.

<!--
In addition to this file, there is derivative language hard coded in a number of places.
If changes are going to be made to this file, changes may also be needed in the following places:
* [the "unauthorized" page](content/unauthorized/_index.md)
* [terms of service](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website/-/blob/f1424f018231b39de59178c667142a52ccab0ced/content/about/terms-of-service.md?plain=1#L18)
* account portal mail templates:
    * https://github.com/UnityHPC/account-portal/tree/main/resources/mail
    * `user_expiry_disable_warning_member.php`
    * `user_expiry_disable_warning_non_pi.php`
    * `user_expiry_disable_warning_pi.php`
    * `user_expiry_idlelock_warning.php`
    * `group_user_disabled_owner.php`
    * `group_user_idlelocked_owner.php`
    * `user_flag_added.php`
    * `user_flag_removed.php`
* account portal pages:
    * [idle unlock message](https://github.com/UnityHPC/account-portal/blob/f5822208617a2817367e99ea12802813daadad72/resources/init.php#L96-L97)
* [login warning script](https://gitlab.rc.umass.edu/unity/user-resources/misc/-/blob/53b4477ee8b1dfe9d12848a38a7ec0dbda1394eb/unity_user_resources_misc/unity_account_expiry_warning.py)
* [expiry status script](https://gitlab.rc.umass.edu/unity/user-resources/misc/-/blob/53b4477ee8b1dfe9d12848a38a7ec0dbda1394eb/unity_user_resources_misc/unity_account_expiry_status.py)
-->
