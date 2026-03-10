/**
 * Linux Terminal Tour Widget
 * ==========================
 * Auto-initialises every `.terminal-tour` container on the page.
 *
 * Usage in Markdown (basic tour):
 *   <div class="terminal-tour" data-cluster-name="Discovery" markdown="0"></div>
 *
 * Usage in Markdown (advanced tour):
 *   <div class="terminal-tour" data-tour="advanced" data-cluster-name="Discovery" markdown="0"></div>
 *
 * The widget lazy-loads xterm.js from CDN the first time it runs.
 * Config (home path function, lab volume) is in the INSTITUTION CONFIG block below.
 */
(function () {
    "use strict";

    // ═══════════════════════════════════════════════════════
    //  INSTITUTION CONFIG — Edit this block to adapt
    // ═══════════════════════════════════════════════════════
    var CONFIG = {
        clusterName: "Discovery",
        homePathFn: function (username) { return "/dartfs/rc/home/" + username.slice(-1) + "/" + username; },
        labVolume: "/dartfs/rc/lab/C/ChenLab",
        defaultUsername: "f00001",
    };
    // ═══════════════════════════════════════════════════════

    // ── ANSI color helpers ──
    var C = {
        reset: "\x1b[0m", green: "\x1b[32m", blue: "\x1b[34m", cyan: "\x1b[36m",
        red: "\x1b[31m", yellow: "\x1b[33m", magenta: "\x1b[35m", dim: "\x1b[90m",
        bold: "\x1b[1m", white: "\x1b[37m",
    };

    var XTERM_VERSION = "4.19.0";
    var _xtermLoaded = false;
    var _xtermLoading = false;
    var _xtermCallbacks = [];

    // ── Lazy-load xterm.js from CDN (once per page) ──
    function loadXterm(callback) {
        if (_xtermLoaded) { callback(); return; }
        _xtermCallbacks.push(callback);
        if (_xtermLoading) return;
        _xtermLoading = true;

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/xterm@" + XTERM_VERSION + "/css/xterm.css";
        document.head.appendChild(link);

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/xterm@" + XTERM_VERSION + "/lib/xterm.js";
        script.onload = function () {
            _xtermLoaded = true;
            _xtermLoading = false;
            _xtermCallbacks.forEach(function (cb) { cb(); });
            _xtermCallbacks = [];
        };
        script.onerror = function () {
            console.error("terminal-tour: failed to load xterm.js from CDN");
        };
        document.head.appendChild(script);
    }

    // ── Build the widget DOM inside the container ──
    function buildDOM(container, clusterName, tourType) {
        container.innerHTML = "";

        var isAdvanced = tourType === "advanced";

        // Splash screen
        var splash = document.createElement("div");
        splash.className = "tt-splash";

        var inner = document.createElement("div");
        inner.className = "tt-splash-inner";

        var icon = document.createElement("div");
        icon.className = "tt-splash-icon";
        icon.textContent = isAdvanced ? "🔐" : "🖥️";

        var title = document.createElement("h2");
        title.className = "tt-splash-title";
        title.id = container.id ? container.id + "-title" : "";
        title.textContent = isAdvanced
            ? "Permissions, Pipes & the Environment"
            : "First Day on " + clusterName;

        var sub = document.createElement("p");
        sub.className = "tt-splash-sub";
        sub.innerHTML = isAdvanced
            ? "Hands-on practice with file permissions, pipes, redirection,<br>environment variables, and software modules."
            : "An interactive introduction to the Linux command line,<br>set on a simulated HPC cluster.";

        var meta = document.createElement("div");
        meta.className = "tt-splash-meta";
        meta.textContent = isAdvanced
            ? "10 guided missions · ~12 minutes · Linux Basics recommended first"
            : "10 guided missions · ~10 minutes · No experience required";

        var label = document.createElement("label");
        label.className = "tt-netid-label";
        label.textContent = "Enter your NetID to begin:";

        var input = document.createElement("input");
        input.type = "text";
        input.className = "tt-netid-input";
        input.placeholder = "e.g. f00abc";
        input.maxLength = 20;

        var btn = document.createElement("button");
        btn.className = "tt-start-btn";
        btn.textContent = "SSH into " + clusterName + " →";
        btn.disabled = true;

        inner.appendChild(icon);
        inner.appendChild(title);
        inner.appendChild(sub);
        inner.appendChild(meta);
        inner.appendChild(label);
        inner.appendChild(input);
        inner.appendChild(document.createElement("br"));
        inner.appendChild(btn);
        splash.appendChild(inner);

        // Terminal container
        var termContainer = document.createElement("div");
        termContainer.className = "tt-terminal-container";

        container.appendChild(splash);
        container.appendChild(termContainer);

        return { splash: splash, input: input, btn: btn, termContainer: termContainer };
    }

    // ── FS helpers ──
    function resolvePath(homePath, base, target) {
        if (target === "~") return homePath;
        if (target.startsWith("~/")) return homePath + target.slice(1);
        if (target.startsWith("/")) return target.replace(/\/+$/, "") || "/";
        var parts = base === "/" ? [] : base.split("/").filter(Boolean);
        target.split("/").forEach(function (seg) {
            if (seg === "..") parts.pop();
            else if (seg !== "." && seg !== "") parts.push(seg);
        });
        return "/" + parts.join("/") || "/";
    }

    function getChildren(fsData, dirPath) {
        var prefix = dirPath === "/" ? "/" : dirPath + "/";
        var kids = {};
        Object.keys(fsData).forEach(function (p) {
            if (p === dirPath) return;
            if (p[0] === "_") return; // skip _modules, _env pseudo-keys
            if (p.indexOf(prefix) === 0) {
                var name = p.slice(prefix.length).split("/")[0];
                if (name) kids[name] = true;
            }
        });
        return Object.keys(kids).sort();
    }

    function fmtSize(s) { return s >= 1024 ? (s / 1024).toFixed(1) + "K" : String(s); }

    function ensureParents(fsData) {
        Object.keys(Object.assign({}, fsData)).forEach(function (p) {
            if (p[0] === "_") return;
            var parts = p.split("/").filter(Boolean);
            var cur = "";
            for (var i = 0; i < parts.length - 1; i++) {
                cur += "/" + parts[i];
                if (!fsData[cur]) fsData[cur] = { type: "dir" };
            }
        });
    }

    // ── Basic tour filesystem ──
    function buildFS(homePath, labVolume, clusterName, username) {
        var h = homePath;
        var lv = labVolume;
        var fsData = {
            "/": { type: "dir" },
            [h]: { type: "dir" },
            [h + "/.bashrc"]: { type: "file", size: 142, content: "# .bashrc\nexport PATH=$PATH:/opt/slurm/bin\nalias ll='ls -la'" },
            [h + "/.profile"]: { type: "file", size: 89, content: "# .profile\nif [ -f ~/.bashrc ]; then\n  . ~/.bashrc\nfi" },
            [h + "/README.txt"]: { type: "file", size: 312, content: "Welcome to the " + clusterName + " cluster!\n\nPrevious researcher: Dr. Alex Chen\nProject: Genomic variant analysis\n\nDr. Chen's data is on the lab volume:\n  " + lv + "\n\nThe final results are in results_FINAL_v2.csv.\nOlder runs are in experiment_01/ and experiment_02/.\n\nGood luck!\n\n- Research Computing" },
            [lv]: { type: "dir" },
            [lv + "/experiment_01"]: { type: "dir" },
            [lv + "/experiment_01/run.sh"]: { type: "file", size: 245, content: "#!/bin/bash\n#SBATCH --job-name=variant_call\n#SBATCH --nodes=1\n#SBATCH --ntasks=8\n#SBATCH --time=04:00:00\n\nmodule load samtools/1.15\nsamtools mpileup -uf ref.fa input.bam | bcftools call -mv > variants.vcf" },
            [lv + "/experiment_01/output.log"]: { type: "file", size: 1024, content: "Job started: 2024-03-15 09:14:22\nLoading samtools/1.15... done\nProcessing chromosome 1... done\nProcessing chromosome 2... done\n[...]\nVariants found: 1,247\nJob completed: 2024-03-15 13:22:01\nWall time: 4h 7m 39s" },
            [lv + "/experiment_02"]: { type: "dir" },
            [lv + "/experiment_02/run_v2.sh"]: { type: "file", size: 312, content: "#!/bin/bash\n#SBATCH --job-name=variant_call_v2\n#SBATCH --nodes=1\n#SBATCH --ntasks=16\n#SBATCH --time=02:00:00\n#SBATCH --mem=32G\n\nmodule load samtools/1.17\nmodule load bcftools/1.17\nsamtools mpileup -uf ref.fa input.bam | bcftools call -mv --threads 16 > variants_v2.vcf" },
            [lv + "/notes.txt"]: { type: "file", size: 178, content: "2024-03-15: First run with 8 cores, took ~4 hours\n2024-03-20: Bumped to 16 cores + 32G RAM, cut time in half\n2024-03-22: Final results look good, sent to PI\n2024-04-01: Graduating next month, wrapping up" },
            [lv + "/results_FINAL_v2.csv"]: { type: "file", size: 48200, content: "chr,pos,ref,alt,quality,filter,gene\nchr1,10234,A,G,99,PASS,AADACL3\nchr1,15774,C,T,85,PASS,WASH7P\nchr1,69511,A,G,99,PASS,OR4F5\nchr2,31245,G,A,92,PASS,FAM110C\nchr2,55821,T,C,78,LOW_QUAL,PXDN\nchr3,10042,A,T,99,PASS,LMCD1\nchr3,88123,C,G,95,PASS,EPHA3\nchr5,14001,G,T,88,PASS,AHRR\nchr7,22561,A,C,91,PASS,IL6\nchr10,5124,T,A,76,LOW_QUAL,NET1" },
            [lv + "/results_old.csv"]: { type: "file", size: 22100, content: "chr,pos,ref,alt,quality\nchr1,10234,A,G,72\nchr1,15903,C,T,45\nchr2,31245,G,A,68" },
        };
        ensureParents(fsData);
        return fsData;
    }
    // ── Basic tour missions ──
    function buildMissions(homePath, labVolume, clusterName) {
        var lv = labVolume;
        return [
            { title: "Orient Yourself", prompt: "You've just SSH'd into " + clusterName + " for the first time. Let's start simple and figure out where you are.", goal: "Run \x1b[1mpwd\x1b[0m\x1b[37m to print your current working directory.", check: function (c) { return c === "pwd"; }, hint: "Type: pwd" },
            { title: "Look Around", prompt: "Good. Now let's see what's in your home directory.", goal: "Run \x1b[1mls\x1b[0m\x1b[37m to list the contents of this directory.", check: function (c) { return c.startsWith("ls") && c.indexOf("/") === -1; }, hint: "Type: ls" },
            { title: "Peek Under the Hood", prompt: "That's the surface. But Linux hides files that start with a dot. These 'dotfiles' hold configuration and are often very important.", goal: "Run \x1b[1mls -a\x1b[0m\x1b[37m to reveal hidden files.", check: function (c) { return c === "ls -a" || c === "ls -la" || c === "ls -al"; }, hint: "Type: ls -a" },
            { title: "Read the Welcome Mat", prompt: "There's a README.txt! The previous researcher may have left instructions.", goal: "Use \x1b[1mcat README.txt\x1b[0m\x1b[37m to display the file.", check: function (c) { return c === "cat README.txt"; }, hint: "Type: cat README.txt" },
            { title: "Find the Lab Data", prompt: "The README mentions Dr. Chen's data is on the lab volume. Let's go find it.", goal: "Use \x1b[1mcd " + lv + "\x1b[0m\x1b[37m to navigate there.", check: function (c) { return c === "cd " + lv || c === "cd " + lv + "/"; }, hint: "Type: cd " + lv },
            { title: "Survey the Damage", prompt: "Now let's see what we're working with. Get the detailed view. File sizes and dates will help!", goal: "Run \x1b[1mls -l\x1b[0m\x1b[37m for a long listing.", check: function (c) { return c === "ls -l" || c === "ls -la" || c === "ls -al"; }, hint: "Type: ls -l" },
            { title: "Check the Data", prompt: "That CSV with 'FINAL' in the name looks important, but it's probably huge. Just peek at the top.", goal: "Use \x1b[1mhead results_FINAL_v2.csv\x1b[0m\x1b[37m to see the first 10 lines.", check: function (c) { return c.startsWith("head results_FINAL"); }, hint: "Type: head results_FINAL_v2.csv" },
            { title: "Back Home", prompt: "Good find. Now let's head back to your home directory and set up your own workspace.", goal: "Use \x1b[1mcd ~\x1b[0m\x1b[37m to return home.", check: function (c) { return c === "cd ~" || c === "cd" || c === "cd " + homePath; }, hint: "Type: cd ~" },
            { title: "Organize: Create a Workspace", prompt: "Let's create a directory for your own project work.", goal: "Run \x1b[1mmkdir my_project\x1b[0m\x1b[37m to create it.", check: function (c) { return c === "mkdir my_project"; }, hint: "Type: mkdir my_project" },
            { title: "Copy the Good Stuff", prompt: "Now copy Dr. Chen's final results into your new workspace so you have your own copy to work with.", goal: "Use \x1b[1mcp " + lv + "/results_FINAL_v2.csv my_project/\x1b[0m\x1b[37m.", check: function (c) { return c === "cp " + lv + "/results_FINAL_v2.csv my_project/" || c === "cp " + lv + "/results_FINAL_v2.csv my_project"; }, hint: "Type: cp " + lv + "/results_FINAL_v2.csv my_project/" },
            { title: "Verify Your Work", prompt: "Trust but verify. Make sure the file actually landed where you put it.", goal: "Run \x1b[1mls my_project\x1b[0m\x1b[37m to check.", check: function (c) { return c === "ls my_project" || c === "ls my_project/"; }, hint: "Type: ls my_project" },
        ];
    }
    // ── Advanced tour filesystem ──
    function buildAdvancedFS(homePath, labVolume, clusterName, username) {
        var h = homePath;
        var lv = labVolume;
        var fsData = {
            "/": { type: "dir" },
            [h]: { type: "dir" },
            [h + "/.bashrc"]: { type: "file", size: 142, content: "# .bashrc\nexport PATH=$PATH:/opt/slurm/bin\nalias ll='ls -la'" },
            [h + "/.bash_profile"]: { type: "file", size: 57, content: "# .bash_profile\nif [ -f ~/.bashrc ]; then\n  . ~/.bashrc\nfi" },
            [h + "/my_project"]: { type: "dir" },
            [h + "/my_project/results_FINAL_v2.csv"]: { type: "file", size: 48200, perm: "rw-r--r--", content: "chr,pos,ref,alt,quality,filter,gene\nchr1,10234,A,G,99,PASS,AADACL3\nchr1,15774,C,T,85,PASS,WASH7P\nchr1,69511,A,G,99,PASS,OR4F5\nchr2,31245,G,A,92,PASS,FAM110C\nchr2,55821,T,C,78,LOW_QUAL,PXDN\nchr3,10042,A,T,99,PASS,LMCD1\nchr3,88123,C,G,95,PASS,EPHA3\nchr5,14001,G,T,88,PASS,AHRR\nchr7,22561,A,C,91,PASS,IL6\nchr10,5124,T,A,76,LOW_QUAL,NET1" },
            [h + "/my_project/run_analysis.sh"]: { type: "file", size: 198, perm: "rw-r--r--", content: "#!/bin/bash\n#SBATCH --job-name=my_analysis\n#SBATCH --nodes=1\n#SBATCH --ntasks=4\n#SBATCH --time=02:00:00\n\nmodule load matlab/r2025a\nmatlab -batch \"analyze('results_FINAL_v2.csv')\" > output.txt" },
            [lv]: { type: "dir" },
            [lv + "/results_FINAL_v2.csv"]: { type: "file", size: 48200, perm: "r--r--r--", content: "chr,pos,ref,alt,quality,filter,gene\nchr1,10234,A,G,99,PASS,AADACL3\nchr1,15774,C,T,85,PASS,WASH7P\nchr1,69511,A,G,99,PASS,OR4F5\nchr2,31245,G,A,92,PASS,FAM110C\nchr2,55821,T,C,78,LOW_QUAL,PXDN\nchr3,10042,A,T,99,PASS,LMCD1\nchr3,88123,C,G,95,PASS,EPHA3\nchr5,14001,G,T,88,PASS,AHRR\nchr7,22561,A,C,91,PASS,IL6\nchr10,5124,T,A,76,LOW_QUAL,NET1" },
        };
        ensureParents(fsData);
        fsData._modules = { loaded: [], available: ["matlab/r2025a", "samtools/1.17", "bcftools/1.17", "R/4.3", "gcc/12.2"] };
        fsData._env = { PATH: "/usr/local/sbin:/usr/local/bin:/usr/bin:/opt/slurm/bin", HOME: h, USER: username, SHELL: "/bin/bash" };
        return fsData;
    }
    // ── Advanced tour missions ──
    function buildAdvancedMissions(homePath, labVolume, clusterName) {
        return [
            { title: "Read the Permissions", prompt: "You've got a copy of Dr. Chen's data in ~/my_project. Before you do anything with it, let's look at who can access what.", goal: "Run \x1b[1mls -l my_project\x1b[0m\x1b[37m to see file permissions.", check: function (c) { return /^ls\s+-l/.test(c) && /my_project/.test(c); }, hint: "Type: ls -l my_project" },
            { title: "Try to Run the Script", prompt: "Notice that run_analysis.sh shows '-rw-r--r--'. There is no execute bit! What happens if you try to run it anyway?", goal: "Try running \x1b[1m./my_project/run_analysis.sh\x1b[0m\x1b[37m and observe the error.", check: function (c) { return /^\.\/(my_project\/)?run_analysis\.sh/.test(c) || /^my_project\/run_analysis\.sh/.test(c); }, hint: "Type: ./my_project/run_analysis.sh" },
            { title: "Make the Script Executable", prompt: "As expected: 'Permission denied'. The shell won't execute a file without the execute bit. Fix that with chmod.", goal: "Run \x1b[1mchmod +x my_project/run_analysis.sh\x1b[0m\x1b[37m to set the execute bit.", check: function (c) { return /^chmod\s+\+x\s+.*run_analysis\.sh/.test(c); }, hint: "Type: chmod +x my_project/run_analysis.sh" },
            { title: "Verify the Change", prompt: "Good. Now confirm the permissions actually changed. Look for the 'x' bits in the permission string.", goal: "Run \x1b[1mls -l my_project\x1b[0m\x1b[37m again to check.", check: function (c) { return /^ls\s+-l/.test(c); }, hint: "Type: ls -l my_project" },
            { title: "Filter with grep", prompt: "The results file has both PASS and LOW_QUAL variants. Let's use grep to see just the passing ones.", goal: "Run \x1b[1mgrep PASS my_project/results_FINAL_v2.csv\x1b[0m\x1b[37m to print the matching lines.", check: function (c) { return /^grep\s+PASS\s+\S*results_FINAL/.test(c) && !/\|/.test(c); }, hint: "Type: grep PASS my_project/results_FINAL_v2.csv" },
            { title: "Count with a Pipe", prompt: "You can see the matching lines, but counting by eye is error-prone. The wc -l command counts lines of input. Chain it to grep with the pipe operator | to count the PASS variants automatically.", goal: "Run \x1b[1mgrep PASS my_project/results_FINAL_v2.csv | wc -l\x1b[0m\x1b[37m.", check: function (c) { return /grep.*PASS.*\|.*wc/.test(c); }, hint: "Type: grep PASS my_project/results_FINAL_v2.csv | wc -l" },
            { title: "Redirect to a File", prompt: "Great, you can count them. Now save just the passing variants to a new file using > to redirect grep's output.", goal: "Run \x1b[1mgrep PASS my_project/results_FINAL_v2.csv > my_project/passing.csv\x1b[0m\x1b[37m.", check: function (c) { return /grep.*PASS.*>\s*\S*passing\.csv/.test(c); }, hint: "Type: grep PASS my_project/results_FINAL_v2.csv > my_project/passing.csv" },
            { title: "Check Your Environment", prompt: "Before loading any software, let's see what's currently in your PATH.", goal: "Run \x1b[1mecho $PATH\x1b[0m\x1b[37m to print the PATH variable.", check: function (c) { return c === "echo $PATH"; }, hint: "Type: echo $PATH" },
            { title: "Load a Module", prompt: "On this cluster, software is managed with the modules system. Let's load MATLAB.", goal: "Run \x1b[1mmodule load matlab/r2025a\x1b[0m\x1b[37m to make it available.", check: function (c) { return c === "module load matlab/r2025a"; }, hint: "Type: module load matlab/r2025a" },
            { title: "Confirm What's Loaded", prompt: "Good. Now verify that matlab/r2025a is actually loaded.", goal: "Run \x1b[1mmodule list\x1b[0m\x1b[37m to see all currently loaded modules.", check: function (c) { return c === "module list"; }, hint: "Type: module list" },
        ];
    }
    // ── Tab completion ──
    function tabComplete(homePath, fsData, cwd, line) {
        var parts = line.split(/\s+/);
        if (parts.length <= 1) {
            var partial = parts[0] || "";
            var cmds = ["pwd", "ls", "cd", "cat", "head", "tail", "mkdir", "mv", "cp", "rm", "grep", "wc", "chmod", "echo", "export", "source", "module", "clear", "help", "hint", "mission"];
            var matches = cmds.filter(function (c) { return c.indexOf(partial) === 0; });
            if (matches.length === 1) return matches[0] + " ";
            return null;
        }
        var partial = parts[parts.length - 1];
        var expandedPartial = partial;
        if (expandedPartial.startsWith("~/")) expandedPartial = homePath + expandedPartial.slice(1);
        else if (expandedPartial === "~") expandedPartial = homePath;
        var lastSlash = expandedPartial.lastIndexOf("/");
        var dirToSearch, pfx;
        if (lastSlash >= 0) {
            var dirPart = expandedPartial.slice(0, lastSlash) || "/";
            dirToSearch = expandedPartial.startsWith("/") ? dirPart : resolvePath(homePath, cwd, dirPart);
            pfx = expandedPartial.slice(lastSlash + 1);
        } else {
            dirToSearch = cwd;
            pfx = expandedPartial;
        }
        if (!fsData[dirToSearch] || fsData[dirToSearch].type !== "dir") return null;
        var children = getChildren(fsData, dirToSearch);
        var mArr = children.filter(function (c) { return c.indexOf(pfx) === 0; });
        if (mArr.length === 0) return null;
        if (mArr.length === 1) {
            var match = mArr[0];
            var fullPath = (dirToSearch === "/" ? "/" : dirToSearch + "/") + match;
            var isDir = fsData[fullPath] && fsData[fullPath].type === "dir";
            var completedArg = (lastSlash >= 0 ? partial.slice(0, partial.lastIndexOf("/") + 1) : "") + match + (isDir ? "/" : " ");
            parts[parts.length - 1] = completedArg;
            return parts.join(" ");
        }
        var common = mArr[0];
        for (var i = 1; i < mArr.length; i++) {
            while (mArr[i].indexOf(common) !== 0) common = common.slice(0, -1);
        }
        if (common.length > pfx.length) {
            var completedArg2 = (lastSlash >= 0 ? partial.slice(0, partial.lastIndexOf("/") + 1) : "") + common;
            parts[parts.length - 1] = completedArg2;
            return parts.join(" ");
        }
        return null;
    }

    // ── Pipe / redirect parser ──
    // Returns an array of pipeline segments and an optional redirect target.
    // e.g. "grep X foo | wc -l" => { segments: [["grep","X","foo"],["wc","-l"]], redirect: null, append: false }
    // e.g. "grep X foo > out.txt"  => { segments: [["grep","X","foo"]], redirect: "out.txt", append: false }
    function parsePipeline(raw) {
        var redirect = null, append = false;
        // strip redirect before splitting on pipe
        var s = raw;
        var appendMatch = s.match(/^(.*?)>>(.*?)$/);
        var overwriteMatch = s.match(/^(.*?)>(.*?)$/);
        if (appendMatch) { s = appendMatch[1].trim(); redirect = appendMatch[2].trim(); append = true; }
        else if (overwriteMatch) { s = overwriteMatch[1].trim(); redirect = overwriteMatch[2].trim(); append = false; }
        var segments = s.split("|").map(function (seg) {
            return seg.trim().split(/\s+/).filter(Boolean);
        });
        return { segments: segments, redirect: redirect, append: append };
    }
    // ── Single-command executor (returns output lines array, mutates state) ──
    function execOneCmd(state, tParts, inputLines) {
        var cmd = tParts[0], args = tParts.slice(1);
        var out = [];
        function pushln(s) { out.push(s); }

        switch (cmd) {
            case "pwd": pushln(state.cwd); break;

            case "ls": {
                var showHidden = args.indexOf("-a") >= 0 || args.indexOf("-la") >= 0 || args.indexOf("-al") >= 0;
                var showLong = args.indexOf("-l") >= 0 || args.indexOf("-la") >= 0 || args.indexOf("-al") >= 0;
                var tgt = args.find(function (a) { return a[0] !== "-"; });
                var resolved = tgt ? resolvePath(state.homePath, state.cwd, tgt) : state.cwd;
                if (!state.fsData[resolved] || state.fsData[resolved].type !== "dir") {
                    pushln(C.red + "ls: cannot access '" + (tgt || resolved) + "': No such file or directory" + C.reset); break;
                }
                var children = getChildren(state.fsData, resolved);
                if (showHidden) children = [".", ".."].concat(children);
                else children = children.filter(function (c) { return c[0] !== "."; });
                if (showLong) {
                    pushln(C.dim + "total " + children.length + C.reset);
                    children.forEach(function (c) {
                        if (c === "." || c === "..") { pushln(C.blue + "drwxr-xr-x  2 " + state.username + " " + state.username + "  4096 Mar 10 14:22 " + c + C.reset); return; }
                        var full = (resolved === "/" ? "/" : resolved + "/") + c;
                        var node = state.fsData[full]; if (!node) return;
                        if (node.type === "dir") { pushln(C.blue + "drwxr-xr-x  2 " + state.username + " " + state.username + "  4096 Mar 10 14:22 " + c + "/" + C.reset); }
                        else {
                            var perm = node.perm || "rw-r--r--";
                            pushln("-" + perm + "  1 " + state.username + " " + state.username + " " + fmtSize(node.size || 0).padStart(6) + " Mar 10 14:22 " + c);
                        }
                    });
                } else {
                    var items = children.map(function (c) {
                        var full = (resolved === "/" ? "/" : resolved + "/") + c;
                        var node = state.fsData[full];
                        var isDir = (node && node.type === "dir") || c === "." || c === "..";
                        return isDir ? (C.blue + C.bold + c + "/" + C.reset) : c;
                    });
                    pushln(items.join("  "));
                }
                break;
            }

            case "cat": {
                if (!args[0]) { pushln(C.red + "cat: missing operand" + C.reset); break; }
                var catPath = resolvePath(state.homePath, state.cwd, args[0]), catNode = state.fsData[catPath];
                if (!catNode) pushln(C.red + "cat: " + args[0] + ": No such file or directory" + C.reset);
                else if (catNode.type === "dir") pushln(C.red + "cat: " + args[0] + ": Is a directory" + C.reset);
                else catNode.content.split("\n").forEach(function (l) { pushln(l); });
                break;
            }

            case "head": {
                if (!args[0]) { pushln(C.red + "head: missing operand" + C.reset); break; }
                var nIdx = args.indexOf("-n");
                var n = nIdx >= 0 ? (parseInt(args[nIdx + 1]) || 10) : 10;
                var headFile = args.find(function (a) { return a[0] !== "-" && a !== String(n); }) || args[args.length - 1];
                var headPath = resolvePath(state.homePath, state.cwd, headFile), headNode = state.fsData[headPath];
                if (!headNode) pushln(C.red + "head: cannot open '" + headFile + "': No such file or directory" + C.reset);
                else if (headNode.type === "dir") pushln(C.red + "head: " + headFile + ": Is a directory" + C.reset);
                else headNode.content.split("\n").slice(0, n).forEach(function (l) { pushln(l); });
                break;
            }

            case "tail": {
                if (!args[0]) { pushln(C.red + "tail: missing operand" + C.reset); break; }
                var tailPath = resolvePath(state.homePath, state.cwd, args[0]), tailNode = state.fsData[tailPath];
                if (!tailNode) pushln(C.red + "tail: cannot open '" + args[0] + "': No such file or directory" + C.reset);
                else if (tailNode.type === "dir") pushln(C.red + "tail: " + args[0] + ": Is a directory" + C.reset);
                else tailNode.content.split("\n").slice(-10).forEach(function (l) { pushln(l); });
                break;
            }
            case "mkdir": {
                if (!args[0]) { pushln(C.red + "mkdir: missing operand" + C.reset); break; }
                var mkdirPath = resolvePath(state.homePath, state.cwd, args[0]);
                if (state.fsData[mkdirPath]) pushln(C.red + "mkdir: cannot create directory '" + args[0] + "': File exists" + C.reset);
                else state.fsData[mkdirPath] = { type: "dir" };
                break;
            }

            case "mv": {
                if (args.length < 2) { pushln(C.red + "mv: missing operand" + C.reset); break; }
                var mvSrc = resolvePath(state.homePath, state.cwd, args[0]), mvNode = state.fsData[mvSrc];
                if (!mvNode) { pushln(C.red + "mv: cannot stat '" + args[0] + "': No such file or directory" + C.reset); break; }
                var mvDest = resolvePath(state.homePath, state.cwd, args[1]);
                if (state.fsData[mvDest] && state.fsData[mvDest].type === "dir") mvDest += "/" + args[0].split("/").pop();
                state.fsData[mvDest] = mvNode; delete state.fsData[mvSrc];
                break;
            }

            case "cp": {
                if (args.length < 2) { pushln(C.red + "cp: missing operand" + C.reset); break; }
                var cpSrc = resolvePath(state.homePath, state.cwd, args[0]), cpNode = state.fsData[cpSrc];
                if (!cpNode) { pushln(C.red + "cp: cannot stat '" + args[0] + "': No such file or directory" + C.reset); break; }
                var cpDest = resolvePath(state.homePath, state.cwd, args[1]);
                if (state.fsData[cpDest] && state.fsData[cpDest].type === "dir") cpDest += "/" + args[0].split("/").pop();
                state.fsData[cpDest] = Object.assign({}, cpNode);
                break;
            }

            case "rm": {
                if (!args[0]) { pushln(C.red + "rm: missing operand" + C.reset); break; }
                var rmPath = resolvePath(state.homePath, state.cwd, args[0]);
                if (!state.fsData[rmPath]) pushln(C.red + "rm: cannot remove '" + args[0] + "': No such file or directory" + C.reset);
                else if (state.fsData[rmPath].type === "dir") pushln(C.red + "rm: cannot remove '" + args[0] + "': Is a directory (use rm -r)" + C.reset);
                else delete state.fsData[rmPath];
                break;
            }

            case "grep": {
                var grepArgs = args.filter(function (a) { return a[0] !== "-"; });
                var grepFlags = args.filter(function (a) { return a[0] === "-"; });
                var caseInsensitive = grepFlags.indexOf("-i") >= 0;
                var showLineNums = grepFlags.indexOf("-n") >= 0;
                if (inputLines) {
                    // piped input
                    var pattern = grepArgs[0] || "";
                    var grepMatches = inputLines.filter(function (l) {
                        return caseInsensitive ? l.toLowerCase().indexOf(pattern.toLowerCase()) >= 0 : l.indexOf(pattern) >= 0;
                    });
                    grepMatches.forEach(function (l, i) { pushln(showLineNums ? (i + 1) + ":" + l : l); });
                } else {
                    if (grepArgs.length < 2) { pushln(C.red + "grep: missing operand" + C.reset); break; }
                    var grepPattern = grepArgs[0], grepPath = resolvePath(state.homePath, state.cwd, grepArgs[1]);
                    var grepNode = state.fsData[grepPath];
                    if (!grepNode) { pushln(C.red + "grep: " + grepArgs[1] + ": No such file or directory" + C.reset); break; }
                    var matches = grepNode.content.split("\n").filter(function (l) {
                        return caseInsensitive ? l.toLowerCase().indexOf(grepPattern.toLowerCase()) >= 0 : l.indexOf(grepPattern) >= 0;
                    });
                    if (!matches.length) pushln(C.dim + "(no matches)" + C.reset);
                    else matches.forEach(function (l, i) { pushln(showLineNums ? (i + 1) + ":" + l : l); });
                }
                break;
            }

            case "wc": {
                var lines = inputLines || [];
                if (!inputLines && args[0]) {
                    var wcPath = resolvePath(state.homePath, state.cwd, args[args.length - 1]);
                    var wcNode = state.fsData[wcPath];
                    if (!wcNode) { pushln(C.red + "wc: " + args[args.length - 1] + ": No such file or directory" + C.reset); break; }
                    lines = wcNode.content.split("\n");
                }
                var showL = args.indexOf("-l") >= 0 || args.length === 0 || !!inputLines;
                if (showL) pushln("" + lines.length);
                else pushln(lines.length + " " + lines.join(" ").split(/\s+/).filter(Boolean).length + " " + lines.join("\n").length);
                break;
            }

            case "chmod": {
                if (args.length < 2) { pushln(C.red + "chmod: missing operand" + C.reset); break; }
                var chmodMode = args[0];
                var chmodPath = resolvePath(state.homePath, state.cwd, args[1]);
                var chmodNode = state.fsData[chmodPath];
                if (!chmodNode) { pushln(C.red + "chmod: cannot access '" + args[1] + "': No such file or directory" + C.reset); break; }
                if (chmodMode === "+x") {
                    var p = chmodNode.perm || "rw-r--r--";
                    var bits = p.split("");
                    if (bits[2] !== "x") bits[2] = "x";
                    if (bits[5] !== "x") bits[5] = "x";
                    if (bits[8] !== "x") bits[8] = "x";
                    chmodNode.perm = bits.join("");
                } else if (chmodMode === "-x") {
                    var p2 = chmodNode.perm || "rwxr-xr-x";
                    var bits2 = p2.split("");
                    bits2[2] = "-"; bits2[5] = "-"; bits2[8] = "-";
                    chmodNode.perm = bits2.join("");
                } else {
                    // numeric mode — just store as annotation
                    chmodNode.perm = chmodMode;
                }
                break;
            }

            case "echo": {
                var val = args.join(" ");
                // expand $VAR references using _env if available
                if (state.fsData._env) {
                    val = val.replace(/\$(\w+)/g, function (_, v) {
                        return state.fsData._env[v] !== undefined ? state.fsData._env[v] : "$" + v;
                    });
                }
                pushln(val);
                break;
            }

            case "export": {
                if (!args[0]) { pushln(C.red + "export: missing operand" + C.reset); break; }
                var eqIdx = args[0].indexOf("=");
                if (eqIdx >= 0) {
                    var eKey = args[0].slice(0, eqIdx), eVal = args[0].slice(eqIdx + 1);
                    if (state.fsData._env) state.fsData._env[eKey] = eVal;
                }
                break;
            }

            case "source": {
                if (!args[0]) { pushln(C.red + "source: missing filename" + C.reset); break; }
                var srcPath = resolvePath(state.homePath, state.cwd, args[0]);
                if (!state.fsData[srcPath]) { pushln(C.red + "source: " + args[0] + ": No such file or directory" + C.reset); break; }
                pushln(C.dim + "# sourcing " + args[0] + " …" + C.reset);
                break;
            }

            case "module": {
                var mods = state.fsData._modules;
                if (!mods) { pushln(C.red + "module: modules system not available" + C.reset); break; }
                var subCmd = args[0];
                if (subCmd === "avail") {
                    var filter = args[1] || "";
                    pushln(C.dim + "──────────── Available modules ────────────" + C.reset);
                    mods.available.filter(function (m) { return m.indexOf(filter) >= 0; })
                        .forEach(function (m) { pushln("  " + m); });
                } else if (subCmd === "load") {
                    if (!args[1]) { pushln(C.red + "module load: missing module name" + C.reset); break; }
                    if (mods.available.indexOf(args[1]) < 0) { pushln(C.red + "module: '" + args[1] + "': No such module" + C.reset); break; }
                    if (mods.loaded.indexOf(args[1]) < 0) mods.loaded.push(args[1]);
                    pushln(C.green + "Loading " + args[1] + "... done" + C.reset);
                } else if (subCmd === "unload") {
                    var idx = mods.loaded.indexOf(args[1]);
                    if (idx >= 0) mods.loaded.splice(idx, 1);
                } else if (subCmd === "list") {
                    if (!mods.loaded.length) { pushln(C.dim + "No modules currently loaded." + C.reset); break; }
                    pushln(C.dim + "Currently loaded modules:" + C.reset);
                    mods.loaded.forEach(function (m, i) { pushln("  " + (i + 1) + ") " + m); });
                } else if (subCmd === "purge") {
                    mods.loaded = [];
                    pushln(C.dim + "All modules unloaded." + C.reset);
                } else {
                    pushln(C.red + "module: unknown subcommand '" + subCmd + "'" + C.reset);
                }
                break;
            }

            case "cd": {
                var cdTgt = args[0] || "~";
                var cdResolved = resolvePath(state.homePath, state.cwd, cdTgt);
                if (state.fsData[cdResolved] && state.fsData[cdResolved].type === "dir") state.cwd = cdResolved;
                else if (state.fsData[cdResolved]) pushln(C.red + "cd: not a directory: " + cdTgt + C.reset);
                else pushln(C.red + "cd: no such file or directory: " + cdTgt + C.reset);
                break;
            }

            case "help":
                pushln(C.dim + "Available commands: pwd, ls, cd, cat, head, tail, mkdir, mv, cp, rm, grep, wc," + C.reset);
                pushln(C.dim + "                    chmod, echo, export, source, module, clear" + C.reset);
                pushln(C.dim + "Pipe:  cmd1 | cmd2    Redirect:  cmd > file  or  cmd >> file" + C.reset);
                pushln(C.dim + "Special: hint (get help), mission (re-read objective)" + C.reset);
                break;

            default: {
                // If it looks like a path (contains / or starts with .), treat as script execution attempt
                if (cmd.indexOf("/") >= 0 || cmd[0] === ".") {
                    var tryPath = resolvePath(state.homePath, state.cwd, cmd);
                    var tryNode = state.fsData[tryPath];
                    if (tryNode && tryNode.type === "file") {
                        var perm = tryNode.perm || "rw-r--r--";
                        var isExec = perm.length >= 3 && perm[2] === "x";
                        if (!isExec) {
                            pushln(C.red + "bash: " + cmd + ": Permission denied" + C.reset);
                        } else {
                            pushln(C.dim + "[Simulated] Executing " + cmd + " …" + C.reset);
                            pushln(C.dim + "(In a real cluster this would submit or run your script.)" + C.reset);
                        }
                    } else {
                        pushln(C.red + "bash: " + cmd + ": No such file or directory" + C.reset);
                    }
                } else {
                    pushln(C.red + cmd + ": command not found" + C.reset);
                    pushln(C.dim + "Type 'help' for available commands." + C.reset);
                }
            }
        }
        return out;
    }
    // ── Top-level command dispatcher (handles pipes & redirects) ──
    function makeExecCmd(state) {
        return function execCmd(raw) {
            var trimmed = raw.trim();
            if (!trimmed) { state.writePrompt(); return; }
            state.cmdHistory.unshift(trimmed);
            state.histIdx = -1;

            if (trimmed === "hint") {
                var hm = state.MISSIONS[state.missionIdx];
                state.writeln(hm ? (C.yellow + "💡 " + hm.hint + C.reset) : (C.dim + "No active mission." + C.reset));
                state.writePrompt(); return;
            }
            if (trimmed === "mission") {
                var mm = state.MISSIONS[state.missionIdx];
                if (mm) {
                    state.writeln(C.magenta + "── Mission " + (state.missionIdx + 1) + "/" + state.MISSIONS.length + ": " + mm.title + " ──" + C.reset);
                    state.writeln(C.cyan + mm.prompt + C.reset);
                    state.writeln(C.white + "  → " + mm.goal + C.reset);
                } else {
                    state.writeln(C.dim + "All missions complete! Explore freely." + C.reset);
                }
                state.writePrompt(); return;
            }
            if (trimmed === "clear") { state.term.clear(); state.writePrompt(); return; }

            var parsed = parsePipeline(trimmed);
            var currentInput = null;
            var finalOutput = [];

            for (var si = 0; si < parsed.segments.length; si++) {
                var seg = parsed.segments[si];
                if (!seg.length) continue;
                var segOut = execOneCmd(state, seg, currentInput);
                currentInput = segOut;
                finalOutput = segOut;
            }

            // Handle redirect
            if (parsed.redirect) {
                var redirPath = resolvePath(state.homePath, state.cwd, parsed.redirect);
                var existing = state.fsData[redirPath];
                var existingContent = (parsed.append && existing && existing.type === "file") ? existing.content + "\n" : "";
                state.fsData[redirPath] = { type: "file", size: existingContent.length + finalOutput.join("\n").length, content: existingContent + finalOutput.join("\n") };
            } else {
                finalOutput.forEach(function (line) { state.writeln(line); });
            }

            // Mission check
            var m = state.MISSIONS[state.missionIdx];
            if (m && m.check(trimmed)) {
                setTimeout(function () {
                    state.writeln(C.green + "✓ Mission complete!" + C.reset);
                    state.missionIdx++;
                    setTimeout(function () { state.showMission(state.missionIdx); }, 400);
                }, 200);
            } else {
                state.writePrompt();
            }
        };
    }
    // ── Initialize one widget instance ──
    function initTour(container) {
        var clusterName = container.getAttribute("data-cluster-name") || CONFIG.clusterName;
        var tourType = container.getAttribute("data-tour") || "basic";
        var els = buildDOM(container, clusterName, tourType);

        els.input.addEventListener("input", function () { els.btn.disabled = !els.input.value.trim(); });
        els.input.addEventListener("keydown", function (e) { if (e.key === "Enter" && els.input.value.trim()) els.btn.click(); });

        els.btn.addEventListener("click", function () {
            var username = els.input.value.trim() || CONFIG.defaultUsername;
            var homePath = CONFIG.homePathFn(username);
            var labVolume = CONFIG.labVolume;

            els.splash.style.display = "none";
            els.termContainer.className = "tt-terminal-container active";
            els.termContainer.innerHTML = '<div class="tt-loading">Loading terminal…</div>';

            loadXterm(function () {
                els.termContainer.innerHTML = "";
                var TerminalClass = window.Terminal;
                if (!TerminalClass) {
                    els.termContainer.innerHTML = '<div class="tt-loading" style="color:#ef4444">Failed to load xterm.js. Check your internet connection.</div>';
                    return;
                }

                var term = new TerminalClass({
                    cursorBlink: true,
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                    theme: {
                        background: "#0D1E1C",
                        foreground: "#e2e8f0",
                        cursor: "#a5d75f",
                        selectionBackground: "#a5d75f44",
                        black: "#12312b", red: "#9d162e", green: "#a5d75f",
                        yellow: "#f5dc69", blue: "#267aba", magenta: "#8a6996",
                        cyan: "#c4dd88", white: "#e2e8f0",
                        brightBlack: "#475569", brightRed: "#d94415", brightGreen: "#a5d75f",
                        brightYellow: "#ffa00f", brightBlue: "#267aba", brightMagenta: "#8a6996",
                        brightCyan: "#c4dd88", brightWhite: "#ffffff",
                    },
                    convertEol: true,
                });

                term.open(els.termContainer);
                setTimeout(function () { term.focus(); }, 60);

                function fitTerminal() {
                    try {
                        var core = term._core;
                        var cellW = core._renderService.dimensions.actualCellWidth;
                        var cellH = core._renderService.dimensions.actualCellHeight;
                        if (!cellW || !cellH) return;
                        var cols = Math.max(2, Math.floor(els.termContainer.clientWidth / cellW));
                        var rows = Math.max(2, Math.floor(els.termContainer.clientHeight / cellH));
                        term.resize(cols, rows);
                    } catch (e) { /* ignore */ }
                }
                setTimeout(fitTerminal, 50);
                window.addEventListener("resize", fitTerminal);

                var fsData = tourType === "advanced" ? buildAdvancedFS(homePath, labVolume, clusterName, username) : buildFS(homePath, labVolume, clusterName, username);
                var MISSIONS = tourType === "advanced" ? buildAdvancedMissions(homePath, labVolume, clusterName) : buildMissions(homePath, labVolume, clusterName);

                var state = {
                    term: term, username: username, homePath: homePath,
                    fsData: fsData, MISSIONS: MISSIONS,
                    cwd: homePath, missionIdx: 0, cmdHistory: [], histIdx: -1, currentLine: "",
                };

                state.promptDir = function () {
                    if (state.cwd === state.homePath) return "~";
                    if (state.cwd.indexOf(state.homePath + "/") === 0) return "~/" + state.cwd.slice(state.homePath.length + 1);
                    return state.cwd;
                };
                state.writePrompt = function () {
                    term.write("\r\n" + C.green + state.username + "@" + clusterName.toLowerCase() + C.reset + ":" + C.blue + state.promptDir() + C.reset + "$ ");
                };
                state.writeln = function (text) { term.write("\r\n" + text); };
                state.showMission = function (idx) {
                    var m = MISSIONS[idx];
                    if (!m) {
                        state.writeln("");
                        state.writeln(C.magenta + "══════════════════════════════════════════════" + C.reset);
                        state.writeln(C.green + "  🎉  Congratulations! You've completed all missions!" + C.reset);
                        state.writeln("");
                        if (tourType === "advanced") {
                            state.writeln(C.white + "  You can now control file permissions, chain commands" + C.reset);
                            state.writeln(C.white + "  with pipes, redirect output, and manage software" + C.reset);
                            state.writeln(C.white + "  modules. You have a full toolkit for HPC work!" + C.reset);
                        } else {
                            state.writeln(C.white + "  You can navigate a Linux filesystem, read files," + C.reset);
                            state.writeln(C.white + "  and organize your workspace. These are the foundations" + C.reset);
                            state.writeln(C.white + "  for everything you'll do on an HPC cluster." + C.reset);
                        }
                        state.writeln(C.magenta + "══════════════════════════════════════════════" + C.reset);
                        state.writeln("");
                        state.writeln(C.dim + "  The terminal is still active. Feel free to explore!" + C.reset);
                        state.writePrompt();
                        return;
                    }
                    var bar = "█".repeat(idx) + "░".repeat(MISSIONS.length - idx);
                    state.writeln("");
                    state.writeln(C.magenta + "── Mission " + (idx + 1) + "/" + MISSIONS.length + ": " + m.title + " ──" + C.reset + "  " + C.dim + bar + C.reset);
                    state.writeln(C.cyan + m.prompt + C.reset);
                    state.writeln(C.white + "  → " + m.goal + C.reset);
                    state.writeln("");
                    state.writePrompt();
                };

                var execCmd = makeExecCmd(state);

                state.currentLine = "";
                term.onKey(function (ev) {
                    var key = ev.key, domEvent = ev.domEvent;
                    if (domEvent.key === "Enter") {
                        var cmd = state.currentLine; state.currentLine = ""; state.histIdx = -1;
                        term.write("\r\n"); execCmd(cmd);
                    } else if (domEvent.key === "Tab") {
                        domEvent.preventDefault();
                        var completed = tabComplete(state.homePath, state.fsData, state.cwd, state.currentLine);
                        if (completed !== null) {
                            while (state.currentLine.length > 0) { term.write("\b \b"); state.currentLine = state.currentLine.slice(0, -1); }
                            state.currentLine = completed; term.write(state.currentLine);
                        }
                    } else if (domEvent.key === "Backspace") {
                        if (state.currentLine.length > 0) { state.currentLine = state.currentLine.slice(0, -1); term.write("\b \b"); }
                    } else if (domEvent.key === "ArrowUp") {
                        if (state.cmdHistory.length > 0) {
                            while (state.currentLine.length > 0) { term.write("\b \b"); state.currentLine = state.currentLine.slice(0, -1); }
                            state.histIdx = Math.min(state.histIdx + 1, state.cmdHistory.length - 1);
                            state.currentLine = state.cmdHistory[state.histIdx]; term.write(state.currentLine);
                        }
                    } else if (domEvent.key === "ArrowDown") {
                        while (state.currentLine.length > 0) { term.write("\b \b"); state.currentLine = state.currentLine.slice(0, -1); }
                        if (state.histIdx > 0) { state.histIdx--; state.currentLine = state.cmdHistory[state.histIdx]; term.write(state.currentLine); }
                        else { state.histIdx = -1; state.currentLine = ""; }
                    } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
                        state.currentLine += key; term.write(key);
                    }
                });

                // ── Intro text ──
                if (tourType === "advanced") {
                    term.write(C.magenta + "══════════════════════════════════════════════" + C.reset + "\r\n");
                    term.write(C.white + "   Permissions, Pipes & the Environment" + C.reset + "\r\n");
                    term.write(C.magenta + "══════════════════════════════════════════════" + C.reset + "\r\n");
                    term.write("\r\n");
                    term.write(C.cyan + "You've already set up your workspace from the basic tour." + C.reset + "\r\n");
                    term.write(C.cyan + "Now it's time to go deeper: control who can access your" + C.reset + "\r\n");
                    term.write(C.cyan + "files, chain commands together, and manage software." + C.reset + "\r\n");
                } else {
                    term.write(C.magenta + "══════════════════════════════════════════════" + C.reset + "\r\n");
                    term.write(C.white + "   First Day on " + clusterName + C.reset + "\r\n");
                    term.write(C.magenta + "══════════════════════════════════════════════" + C.reset + "\r\n");
                    term.write("\r\n");
                    term.write(C.cyan + "It's your first day in the lab. Your PI has given you" + C.reset + "\r\n");
                    term.write(C.cyan + "access to the " + clusterName + " cluster. The previous grad student," + C.reset + "\r\n");
                    term.write(C.cyan + "Dr. Chen, left behind data from her genomics project" + C.reset + "\r\n");
                    term.write(C.cyan + "on the lab volume." + C.reset + "\r\n");
                    term.write("\r\n");
                    term.write(C.cyan + "Your job: find the data, make sense of the mess," + C.reset + "\r\n");
                    term.write(C.cyan + "and set up your own workspace." + C.reset + "\r\n");
                }
                term.write("\r\n");
                term.write(C.dim + "  Type 'hint' if you get stuck. Type 'mission' to re-read your objective." + C.reset + "\r\n");
                term.write(C.dim + "  Tab completion works for commands and file paths." + C.reset);

                setTimeout(function () { state.showMission(0); }, 100);
            });
        });
    }

    // ── Auto-initialise all .terminal-tour containers ──
    function init() {
        document.querySelectorAll(".terminal-tour").forEach(initTour);
    }

    // MkDocs Material instant navigation: document$ emits after every page
    // transition (including the initial load), so this covers both cases.
    // Falls back to DOMContentLoaded for non-Material or non-instant builds.
    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { init(); });
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
