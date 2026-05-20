---
Title: How to Ask for Help
blurb: >
    Tips for asking clear questions to get accurate and applicable help as
    quickly as possible.
---
# How to ask for help
The Unity User Community on Slack is the best place to get (non-critical) cluster announcements and chat with the Unity team and fellow Unity users. To join, review our guidelines and follow the join instructions on the [Unity User Community page]({{< relref "community" >}}).

The Unity facilitation team receives a large volume of help requests – but the easier it is to understand yours, the faster we will get to it. It can be difficult to know what to include or how to phrase questions when encountering problems on Unity. However, making sure that you’re writing well-phrased support requests is better for both the Unity facilitation team and for you to get the quality help you’re looking for.

{{< callout note >}} This page is heavily inspired by https://hpc-uit.readthedocs.io/en/latest/help/writing-support-requests.html. {{< /callout >}}

## Example
Include the following information in your help desk submission:
- **Summary of the issue:** Briefly describe the issue you are experiencing
- **Platform/environment:** Where are you experiencing the error? (e.g., OOD, shell, interactive/batch, etc.)
- **Error message:** Include the exact error message you received; if possible, copy and paste the full output
- **Specific job number(s) that exhibited the error:** Any specific job number(s) that exhibited the error should be included (oftentimes, the issue is with the request and not the program).
- **Minimal reproducible example of the error:** Provide a code snippet, script, or command that consistently and quickly reproduces the issue
- **Troubleshooting attempts and results:** What steps have you already taken to try to fix the issue, and what were the results of that attempt?

## Submit questions to Slack or our Help Email, not to team members directly
If you need help with an error or bug, please submit it in the Unity User Community [#help-desk](https://unity-user-community.slack.com/app_redirect?channel=help-desk) Slack channel, or to [{{< param "help-email" >}}](mailto:{{< param "help-email" >}}) if you prefer getting help via email. For more information about contacting us, please see the [Contact page]({{< relref "contact" >}}).

## If possible, try searching your error online and in the Slack #help-desk chat history first
There’s a good chance that the issue you’re running into has been encountered and solved by someone else, and can be found using a quick Google search or by searching in the Slack [#help-desk](https://unity-user-community.slack.com/app_redirect?channel=help-desk) chat history.

## Include commands and error messages
It's very important that you include the actual command you’re running and the actual error messages you’re receiving in your message to us. You can copy and paste them exactly as is. Screenshots (although better than nothing) make it more difficult for us to copy your commands and slow down the process of solving your problem. A simple text-based cut and paste directly into the message is best.

## New problem = new help request
Avoid replying to past message threads with a new (unrelated) problem. We may not see this right away (or at all)!

## Avoid the XY problem
Quoting from https://xyproblem.info/:
- User wants to do X.
- User doesn’t know how to do X, but thinks they can fumble their way to a solution if they can just manage to do Y.
- User doesn’t know how to do Y either.
- User asks for help with Y.
- Others try to help user with Y, but are confused because Y seems like a strange problem to want to solve.
- After much interaction and wasted time, it finally becomes clear that the user really wants help with X, and that Y wasn’t even a suitable solution for X.

Please try to avoid the XY problem. If you are having issues with Y but are actually trying to do X, please let us know about X. Try and tell us exactly what you are trying to do. Oftentimes solving Y can take a long time while solving X is much simpler.

## Include what worked
To focus on the problem and avoid going back and forth, please tell us what has worked so far – what have you tried? It’s great to know what didn’t work, but just as helpful to know what did work. If you say “I can’t get X to run on two nodes,” we might then ask whether X worked on one node, on one core, or not at all.

## Specify your environment
Did you or someone else compile the code? Which modules were loaded? Providing these details about your environment will help us save the time we might waste debugging in a different environment.

## For simple cases, be specific and include commands and errors
Provide the exact commands that you ran, environment, and output error messages. The error messages provide a lot of useful information, so be sure to copy and paste the entire output.

Avoid only saying “X didn’t work”. The better you describe the problem, the less follow up questions we need to ask and the quicker it will take to solve your problem.

## For complex cases, create an example that reproduces the problem
It is very important to create an example that we can simply copy, paste, and run ourselves in order to see the problem you are encountering. It will take much longer for us to help you if we have to write input files and run scripts solely based on a possibly incomplete description of the problem you’re encountering.

## Make the example as small and quick as possible
If you're running a calculation that crashed after running for one whole week, be sure to try to reduce the example before submitting it to us. The crash can likely be reproduced with a much smaller example, such as with a smaller system size, grid, or basis set. It's much more efficient to schedule and debug a problem that crashes after a few seconds rather than after a few hours.
