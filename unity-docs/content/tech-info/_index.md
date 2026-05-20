---
title: Unity Technical Info
menu: about
blurb: >
    Learn about the Unity hardware, software, and networking configuration and 
    download the NSF grant boilerplate document
icon: dns
draft: true
---

[Download the latest Unity NSF Facilities Boilerplate here.](https://docs.google.com/document/d/1STRvP8z9Di_U0WgVu9rDjQWN4fp1aa74iuZR2NOxmYU/edit?usp=sharing)

## Unity hardware and network configuration 

Research computing at UMass Amherst currently operates a heterogeneous High Performance Computing (HPC) cluster, Unity, in cooperation with the University of Rhode Island, UMass Dartmouth, UMass Lowell, and UMass Boston. Unity is a 25,000 core cluster based on Ubuntu 24.04 LTS and Slurm with a heterogeneous network containing ethernet and IB linked compute nodes. Unity hosts a variety of compute node architectures. The majority of compute nodes are Intel or AMD x86 nodes, with a small number of ARM and Power9 nodes to supplement. Additionally, Unity contains ~1500 Nvidia GPUs, including ~100 A100 and V100 GPUs.

### Storage

Unity contains 1.5 PB high performance VAST, for home, work, and scratch directories, and 2 PB storage from the New England Storage Exchange (NESE), a regionally managed Ceph cluster located at the same data center as Unity, the Massachusetts Green High Performance Computing Center (MGHPCC).
Unity can be accessed via SSH by terminal or via a graphical Open OnDemand web portal. Open OnDemand provides access to graphical programs like JupyterLab, Rstudio, and Matlab directly on compute nodes, as well as a file browser and Slurm job composer.

## Facilitation

Research Computing at UMass Amherst also provides access to research computing facilitators to assist Unity users. Research computing facilitators are available to assist Unity users with deploying their workloads onto Unity and advising on workflow optimization, software tuning, and technical issues. In addition, the facilitation team provides HPC workshops and manages an active Slack for the Unity Community. For groups needing mid to long term project support, facilitator time is available on an hourly basis.

## MGHPCC: Unity's data center

The [Massachusetts Green High Performance Computing Center Inc.](https://www.mghpcc.org/) is a non-profit corporation whose members are the Massachusetts Institute of Technology, Boston University, Harvard University, Northeastern University and the University of Massachusetts system.

In operation since November, 2012, the 90,000-square-foot MGHPCC data center is located on an 8.6-acre former industrial site in downtown Holyoke, MA, and served by a municipal utility that derives more than 90 percent of its energy from carbon free sources, with more than more than 70% from local hydroelectric and solar resources.  The facility was the first research university data center to receive LEED Platinum Certification, the highest level awarded by the Green Building Council, in recognition of the MGHPCC’s use of energy-efficient power distribution, advanced cooling techniques, low-impact storm water management, and recycled building materials, among other measures. 
 
The MGHPCC is accessible via several high-speed network connections, including: (1) the Northern Crossroads, a regional high speed network with direct connections to more than 25 research and educational institutions, a 100Gbps path to Internet2, a 10Gbps path to ESNET, and 10Gbps connections to statewide research networks in New York, Connecticut, Rhode Island, Maine, New Hampshire, and Vermont,  (2) a 72-channel fiber loop operated by MIT with Optical Add/Drop Multiplexers at points of presence in Albany NY, New York City, Baltimore, and other locations (currently used to support 10Gbps links to the campus of each member university plus 100Gbs Northern Crossroads links to Internet 2, Cambridge, MA, and New York City),  (3) UMASSNET, which provides high bandwidth connectivity to 5 UMass campuses and 13 other educational institutions, (4) an ExoGENI rack, through NSF-sponsored participation in the GENI project by UMass Amherst, and (5) the Massachusetts Broadband Institute network, which interconnects community colleges, school systems, and municipalities throughout Western Massachusetts. 
