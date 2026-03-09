<!-- includes/site/systems-overview.md
     Institution-specific: describes the HPC systems available at your site.
     Replace this file with your own systems when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ cluster.name }}.
-->

## {{ institution.short_name }}'s HPC Systems

{{ institution.short_name }} provides several HPC systems, each suited to different kinds of work. Andes, Polaris, and {{ cluster.name }} are available to all researchers on campus, while the Babylon servers are operated by Thayer School of Engineering and Computer Science for their users.

### Andes & Polaris (Shared Memory)

**Andes** and **Polaris** are large-scale shared memory systems available to all {{ institution.short_name }} researchers. Unlike {{ cluster.name }}, they work more like a powerful version of your personal computer: You log in and run programs interactively, with all processors sharing the same memory space.

These systems are well suited for workloads that need large amounts of memory on a single machine, or for interactive data analysis and development. The limitation of these systems is that all resources are shared at all times. Your workloads might have to compete with other users' workloads for CPU time and memory, causing unnecessary slowdowns. Since they are stand-alone machines, you may also hit their resource ceiling.

To give you a sense of scale, here's how much memory these machines have compared to a typical laptop with 16 GB:

{{ system_stats(["andes.dartmouth.edu", "polaris.dartmouth.edu"]) }}

!!! tip "Live data from the cluster"
    The table above shows real data pulled directly from {{ institution.short_name }}'s systems. Throughout this cookbook, you'll see expandable **"Show me the commands"** sections that reveal exactly what was run and where. Don't worry about running them yourself just yet — you'll learn how to get an account and connect in the next sections.

### Babylon (Thayer/CS — Shared Memory)

Thayer School of Engineering and Computer Science operate a set of shared memory compute servers named **babylon1** through **babylon12** (`babylon1.thayer.dartmouth.edu`, etc.). Like Andes and Polaris, these are standalone shared memory machines, but they are only available to Thayer and CS users. You can log in interactively via SSH.

The Babylon servers are a good stepping stone between your laptop and the full HPC cluster. They have faster processors and more memory than lab workstations, and they're convenient for engineering-specific software (MATLAB, Abaqus, Mathematica, etc.) that's pre-installed on the Thayer infrastructure. However, like Andes and Polaris, they are shared — your processes run alongside other users' work with no scheduler to guarantee dedicated resources.

{{ system_stats(["babylon1.thayer.dartmouth.edu", "babylon2.thayer.dartmouth.edu", "babylon3.thayer.dartmouth.edu", "babylon4.thayer.dartmouth.edu", "babylon5.thayer.dartmouth.edu", "babylon6.thayer.dartmouth.edu", "babylon7.thayer.dartmouth.edu", "babylon8.thayer.dartmouth.edu", "babylon9.thayer.dartmouth.edu", "babylon10.thayer.dartmouth.edu", "babylon11.thayer.dartmouth.edu", "babylon12.thayer.dartmouth.edu"]) }}

!!! note "Thayer/CS credentials"
    The Babylon servers authenticate using your NetID and password and are only accessible to Thayer and CS users. See the [Thayer Linux documentation](https://kb.thayer.dartmouth.edu/article/361-linux-services) for full details.

### {{ cluster.name }} (Campus-Wide HPC Cluster)

**{{ cluster.name }}** is {{ institution.short_name }}'s primary HPC cluster, available to all researchers on campus. It consists of many compute nodes connected by a high-speed network, and jobs are managed by the **{{ cluster.scheduler }}** scheduler. You write a script describing what resources you need (CPUs, memory, time, GPUs), submit it, and {{ cluster.scheduler }} runs it on the appropriate hardware when resources are available.

This is the system you'll use most often, and the one this cookbook focuses on.

Here's a snapshot of the total resources available across {{ cluster.name }}:

{{ cluster_stats("discovery.dartmouth.edu", label="Discovery") }}

## Which System Should I Use?

With multiple systems available, it's natural to wonder which one is right for your work. Here's a quick guide:

**Use Andes or Polaris if** your work fits on a single large machine and you want to run it interactively. These are good for exploratory data analysis, prototyping code, or running jobs that need a lot of memory but not a lot of scheduling overhead. You log in, run your program, and see the results in real time — much like working on your own computer, just with far more resources.

**Use the Babylon servers if** you're in Thayer or CS and need quick access to a more powerful machine for interactive work, especially if your workflow depends on engineering software available on the Thayer infrastructure.

**Use {{ cluster.name }} if** your work needs dedicated resources, GPUs, long runtimes, or the ability to run many jobs at once. Because {{ cluster.name }} uses a scheduler, your jobs get exclusive access to the resources you request — no competing with other users for CPU time. This is the right choice for production runs, batch processing, GPU-accelerated workloads like deep learning, and any workflow where you want to submit a job and walk away.

**When in doubt, use {{ cluster.name }}.** It's the most versatile system, it's open to everyone at {{ institution.short_name }}, and it's the one this cookbook focuses on. The scheduler may feel like an extra step at first, but it ensures fair access for everyone and gives you predictable, reproducible performance.

| | Andes / Polaris | Babylon | {{ cluster.name }} |
|:--|:--|:--|:--|
| **Best for** | Large-memory single-machine tasks | Quick interactive work for Thayer/CS users | Batch jobs, GPU workloads, long-running or multi-job workflows |
| **How you run work** | Directly on the command line | Directly on the command line | Submit via the {{ cluster.scheduler }} scheduler |
| **Resource sharing** | Shared with other users in real time | Shared with other users in real time | Dedicated resources for your job |
| **Who can access** | All {{ institution.short_name }} users | Thayer and CS users | All {{ institution.short_name }} users |
| **GPUs** | No | No | Yes |
| **Scheduler** | No | No | Yes ({{ cluster.scheduler }}) |

### Test Yourself: Which System Would You Choose?

See if you can match each scenario to the best HPC system. Click on your answer, then advance to the next question!

<div class="slide-quiz">
  <div class="quiz-slide" data-answer="babylon" data-explain="The Babylon servers are the right call here. As a Thayer faculty member you have access, MATLAB is pre-installed on the Thayer infrastructure, and you just need a quick interactive session — no scheduler overhead needed.">
    <div class="quiz-prompt"><strong>Scenario 1 of 5:</strong> You are a professor at Thayer and want to run a quick MATLAB simulation to verify some results before a meeting tomorrow morning. You'd like to work interactively so you can tweak parameters on the fly.</div>
    <div class="quiz-options">
      <button class="quiz-btn" data-choice="andes-polaris">Andes / Polaris</button>
      <button class="quiz-btn" data-choice="babylon">Babylon</button>
      <button class="quiz-btn" data-choice="discovery">Discovery</button>
    </div>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-slide" data-answer="discovery" data-explain="Discovery is the only system with GPUs. It also gives you dedicated resources through the Slurm scheduler, so your 48-hour training run won't be interrupted by other users.">
    <div class="quiz-prompt"><strong>Scenario 2 of 5:</strong> You are a graduate student in Neuroscience who needs to train a convolutional neural network on brain imaging data. The training requires GPUs and will take roughly 48 hours.</div>
    <div class="quiz-options">
      <button class="quiz-btn" data-choice="andes-polaris">Andes / Polaris</button>
      <button class="quiz-btn" data-choice="babylon">Babylon</button>
      <button class="quiz-btn" data-choice="discovery">Discovery</button>
    </div>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-slide" data-answer="andes-polaris" data-explain="Andes and Polaris are large shared-memory machines with far more RAM than a typical compute node. They're ideal for loading a huge dataset into memory on a single machine for interactive analysis.">
    <div class="quiz-prompt"><strong>Scenario 3 of 5:</strong> You are a genomics researcher who needs to load a 400 GB reference genome index into memory for an interactive alignment analysis. You want to explore results in real time.</div>
    <div class="quiz-options">
      <button class="quiz-btn" data-choice="andes-polaris">Andes / Polaris</button>
      <button class="quiz-btn" data-choice="babylon">Babylon</button>
      <button class="quiz-btn" data-choice="discovery">Discovery</button>
    </div>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-slide" data-answer="discovery" data-explain="Discovery's Slurm scheduler is built for exactly this kind of work. You can submit all 200 jobs as a job array, walk away, and collect the results when they're done. Each job gets its own dedicated resources.">
    <div class="quiz-prompt"><strong>Scenario 4 of 5:</strong> You are a physics PhD student who needs to run 200 independent simulations, each with different parameters. You want to submit them all at once and collect results when they finish overnight.</div>
    <div class="quiz-options">
      <button class="quiz-btn" data-choice="andes-polaris">Andes / Polaris</button>
      <button class="quiz-btn" data-choice="babylon">Babylon</button>
      <button class="quiz-btn" data-choice="discovery">Discovery</button>
    </div>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-slide" data-answer="andes-polaris" data-explain="Andes and Polaris are great for interactive data work that doesn't need GPUs or a scheduler. As a Geography researcher (not Thayer/CS), you can't access Babylon — but Andes and Polaris are open to all Dartmouth users and have plenty of memory for large datasets.">
    <div class="quiz-prompt"><strong>Scenario 5 of 5:</strong> You are a researcher in Geography who wants to interactively explore a large geospatial dataset in R. The dataset is about 60 GB.</div>
    <div class="quiz-options">
      <button class="quiz-btn" data-choice="andes-polaris">Andes / Polaris</button>
      <button class="quiz-btn" data-choice="babylon">Babylon</button>
      <button class="quiz-btn" data-choice="discovery">Discovery</button>
    </div>
    <div class="quiz-feedback"></div>
  </div>
</div>
