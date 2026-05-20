---
title: "Unauthorized"
aliases:
  - account_error
---

You are not authorized to access UnityHPC Platform services.
This can happen for a few different reasons:
* you have not registered an account
    * you can register an account using the using the [account portal]({{< param account-url >}})
* your account is unqualified
    * to be qualified, join a PI group or create your own PI group in the [account portal]({{< param account-url >}})
* your account is idle-locked
    * accounts are automatically idle-locked according to our [account expiration policy](/about/account-expiration)
    * if you try to log in via SSH, you will see a message confirming that your account is idle-locked
    * to remove an idle-lock, simply log in to the [account portal]({{< param account-url >}}), and you will see a message confirming the lock was removed
* your account is locked
    * we reserve the right to lock an account if we suspect that our [terms of service](/about/terms-of-service) have been violated
    * if you try to log in via SSH, you will see a message confirming that your account is locked
* your account is disabled
    * accounts are automatically disabled according to our [account expiration policy](/about/account-expiration)
    * if you log into the [account portal]({{< param account-url >}}) you will see a message confirming that your account is disabled
    * you can re-enable your account by clicking the "re-enable account" button in the "disabled account" page

If your account was previously authorized and has now become unqualified, idle-locked, locked, or disabled, you should have gotten an email from `updates@unity.rc.umass.edu` notifying you of this change.
If you are having trouble getting access, please [contact us](/contact) for more information.
