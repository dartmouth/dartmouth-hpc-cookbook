---
title: RStor Usage
---
# RStor Usage

{{< callout note >}}
RStor is currently available to UMass Amherst groups only.
{{< /callout >}}

You can use RStor the same way you use any other path on Unity, through standard methods for managing files such as the [CLI](<{{ relref cli }}>), [Globus](<{{ relref globus }}>), and [OnDemand](<{{ relref ondemand }}>).

Your RStor share can be found at the path `/rstor/your_share_name_here`.

## Mounting Your RStor Share on Your Desktop

{{< callout note >}}
Before mounting your RStor share on your desktop, you must either be on the UMass Amherst campus network or connected through the [UMass Amherst VPN](https://www.umass.edu/it/vpn).
{{< /callout >}}

You will be connecting with the same email and password you use for single-sign-on (SSO).

**For MacOS users**: Go to the [Apple documentation for connecting to shared computers and servers](https://support.apple.com/lt-lt/guide/mac-help/mchlp1140/mac) and follow the instructions under the header **Connect to a computer or server by entering its address**.
Use the address `smb://rstor.rc.umass.edu/your_share_name_here`.
When prompted for how to connect, select **Registered User**.

**For Windows users**: Go to the [Microsoft documentation for file sharing over a network](https://support.microsoft.com/en-us/windows/file-sharing-over-a-network-in-windows-b58704b2-f53a-4b82-7bc1-80f9994725bf) and follow the instructions under the dropdown **How do I map a network drive?**
In the **Folder** box, use the path `\\rstor.rc.umass.edu\your_share_name_here`.
