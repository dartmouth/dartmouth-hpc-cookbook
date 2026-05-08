---
title: "Unity Digest 7/31/25"
published: "2025-07-31T10:00:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! In this week’s digest, we’re sharing exciting Unity updates, including a new tool now available on the platform, helpful tips for setting up email reminders, and a chance to test out a chatbot prototype. You’ll also find an opportunity to share your work and be featured in our upcoming Unity 5-Year Anniversary Series!
<!--more-->

## 📰 Unity in the News! Real-Time Storm Forecasting Powered by Unity
Read about Rhode Island’s investment in RI-CHAMP, a forecasting system that relies on the Unity Research Computing Platform! Unity’s partners at the University of Rhode Island’s IT Research Computing team have collaborated closely with RI-CHAMP scientists to deliver real-time storm predictions, showcasing how collaborative HPC infrastructure can fuel high-impact research. **[Read the article here.](https://www.uri.edu/news/2025/07/rhode-island-legislators-approve-crucial-appropriation-for-unique-weather-related-tools-at-uri/)**

## 🧬 AlphaFold3 Convenience Tool Now Available
We're pleased to announce the availability of a new command-line interface tool for AlphaFold3 on Unity. This tool simplifies common AlphaFold3 workflows and provides enhanced batch processing capabilities. It is designed to improve productivity when working with AlphaFold3 on our HPC infrastructure

To get started, run `module load alphafold3/latest`.

The tool is accessible via the `af3` command and includes three main subcommands:
- `af3 convert` - Streamlines input preparation by converting FASTA files containing protein, RNA, or DNA sequences directly to the JSON format required by AlphaFold3.
- `af3 run` - Provides a straightforward wrapper for run_alphafold.py with identical usage patterns, making it easier to execute single predictions.
- `af3 batch` - Enables efficient processing of multiple predictions through a robust batch execution pipeline. Key features include:
    - Parallel execution across multiple JSON input files
    - Optimized separation of CPU and GPU processes
    - Built-in checkpointing support for long-running jobs

Execution examples can be found with `module help alphafold3/latest`.

## 📨 Default email reminders for new workspaces will now be sent 3 days in advance
On all newly created workspaces, email reminders will automatically be sent out 3 days in advance. You can change the default settings for reminder timing or the email address by creating a configuration file at `~/.ws_user.conf`. By default, email reminders are sent to your account’s email address.

Sample `~/.ws_user.conf`:
```yaml
reminder: 3
mail: preferred@example.org
```

## 🤖 Be the first to test out a Unity prototype bot!
We’re exploring the potential for AI-enhanced user facilitation to improve the Unity user experience and support our help team more efficiently. An analysis of aggregated responses from this study will help project leaders understand what's working, and how we can improve the AI-enhanced search functionality or limitations prior to deployment.

**We're seeking current Unity users to participate in this study** involving a prototype chatbot developed by the UMass Amherst Center for Data Science and Artificial Intelligence.
Participation includes:
- **A short pre- and post-survey**
- **A 30-minute guided task session** where you will work with the prototype bot to accomplish a series of tasks on Unity under observation by study personnel
- **A brief interview** to discuss your experience

The task session and interview will be conducted in-person at UMass Amherst or online via Zoom. If you’re interested, **[please fill out the study interest form here.](https://umassamherst.co1.qualtrics.com/jfe/form/SV_1AKSG1Qn9R8dxbw)**

## 🎂 Happy 5 year anniversary to Unity: Share your work with us!
In celebration of Unity’s recent 5-year anniversary, we’re launching the Unity 5-Year Anniversary Series! This series will showcase your work as users, feature a logo design contest, and highlight the many ways Unity supports impactful research and discovery. More details are coming soon. In the meantime, we’d love to hear from you!

**If you’re interested in having your work featured as part of the series, [please fill out the interest form here.](https://forms.gle/ft8edBXRGiLhsWpa7)** We’re excited to share the incredible work happening across the Unity community.

Sincerely,
<br>The Unity Team
