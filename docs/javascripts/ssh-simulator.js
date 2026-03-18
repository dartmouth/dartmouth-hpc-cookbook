/**
 * SSH Simulator Widget
 * ====================
 * Auto-initialises every `.ssh-simulator` container on the page.
 *
 * Usage in Markdown:
 *   <div class="ssh-simulator" data-cluster-name="Discovery" markdown="0"></div>
 *
 * The widget lazy-loads xterm.js from CDN the first time it runs.
 */
(function () {
    "use strict";

    // ═══════════════════════════════════════════════════════
    //  INSTITUTION CONFIG — Edit this block to adapt
    // ═══════════════════════════════════════════════════════
    var CONFIG = {
        clusterName: "Discovery",
        hostname: "discovery.dartmouth.edu",
        sharedMemoryHostname: "andes.dartmouth.edu",
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
            console.error("ssh-simulator: failed to load xterm.js from CDN");
        };
        document.head.appendChild(script);
    }

    // ── Build the widget DOM inside the container ──
    function buildDOM(container, clusterName) {
        container.innerHTML = "";

        // Splash screen
        var splash = document.createElement("div");
        splash.className = "ss-splash";

        var inner = document.createElement("div");
        inner.className = "ss-splash-inner";

        var icon = document.createElement("div");
        icon.className = "ss-splash-icon";
        icon.textContent = "🔌";

        var title = document.createElement("h2");
        title.className = "ss-splash-title";
        title.id = container.id ? container.id + "-title" : "";
        title.textContent = "Practice SSH Connections";

        var sub = document.createElement("p");
        sub.className = "ss-splash-sub";
        sub.innerHTML = "A safe place to practice the ssh commands<br>you'll use to connect to " + clusterName + ".";

        var label = document.createElement("label");
        label.className = "ss-netid-label";
        label.textContent = "Enter your NetID to personalize the practice:";

        var input = document.createElement("input");
        input.type = "text";
        input.className = "ss-netid-input";
        input.placeholder = "e.g. f00abc";
        input.maxLength = 20;

        var btn = document.createElement("button");
        btn.className = "ss-start-btn";
        btn.textContent = "Start Practice →";
        btn.disabled = true;

        inner.appendChild(icon);
        inner.appendChild(title);
        inner.appendChild(sub);
        inner.appendChild(label);
        inner.appendChild(input);
        inner.appendChild(document.createElement("br"));
        inner.appendChild(btn);
        splash.appendChild(inner);

        // Terminal container
        var termContainer = document.createElement("div");
        termContainer.className = "ss-terminal-container";

        container.appendChild(splash);
        container.appendChild(termContainer);

        return { splash: splash, input: input, btn: btn, termContainer: termContainer };
    }

    // ── Missions ──
    function buildMissions(clusterName, hostname, sharedMemoryHostname, username) {
        return [
            {
                title: "Basic Connection",
                prompt: "Let's start with a standard connection to the cluster's default login node.",
                goal: "Use the " + C.bold + "ssh" + C.reset + " command to connect to " + C.bold + hostname + C.reset + " with your username (" + username + ").",
                check: function (c) { return c === "ssh " + username + "@" + hostname; },
                hint: "Type: ssh " + username + "@" + hostname,
                action: "login", targetHost: hostname, flags: []
            },
            {
                title: "Handling Graphical Apps",
                prompt: "You want to create data visualizations with matplotlib on the cluster. You'll need X11 forwarding.",
                goal: "Add the " + C.bold + "-Y" + C.reset + " flag to your ssh command to enable X11 forwarding.",
                check: function (c) { return (c === "ssh -Y " + username + "@" + hostname) || (c === "ssh " + username + "@" + hostname + " -Y"); },
                hint: "Type: ssh -Y " + username + "@" + hostname,
                action: "login", targetHost: hostname, flags: ["-Y"]
            },
            {
                title: "Targeting a Specific System",
                prompt: "Instead of the general cluster, you specifically need to connect to a large shared-memory system for a memory-intensive task.",
                goal: "Connect to " + C.bold + sharedMemoryHostname + C.reset + " using SSH.",
                check: function (c) { return c === "ssh " + username + "@" + sharedMemoryHostname; },
                hint: "Type: ssh " + username + "@" + sharedMemoryHostname,
                action: "login", targetHost: sharedMemoryHostname, flags: []
            },
            {
                title: "Troubleshooting: Typos",
                prompt: "Let's see what happens when you type the wrong password. Remember, characters don't show up when you type passwords!",
                goal: "Run " + C.bold + "ssh " + username + "@" + hostname + C.reset + ". When prompted, deliberately type " + C.bold + "wrongpassword" + C.reset + " and hit Enter.",
                check: function (c) { return c === "ssh " + username + "@" + hostname; }, // The check for 'wrongpassword' is handled in state machine
                hint: "First, type: ssh " + username + "@" + hostname,
                action: "wrong_password", targetHost: hostname, flags: []
            },
            {
                title: "Troubleshooting: Network Issues",
                prompt: "Let's simulate what happens if you're off-campus and forgot to connect to the VPN.",
                goal: "Try connecting to " + C.bold + hostname + C.reset + " again to see the error.",
                check: function (c) { return c === "ssh " + username + "@" + hostname; },
                hint: "Type: ssh " + username + "@" + hostname,
                action: "timeout", targetHost: hostname, flags: []
            }
        ];
    }

    // ── Initialize one widget instance ──
    function initTour(container) {
        var clusterName = container.getAttribute("data-cluster-name") || CONFIG.clusterName;
        var hostname = CONFIG.hostname;
        var sharedMemoryHostname = CONFIG.sharedMemoryHostname;
        var els = buildDOM(container, clusterName);

        els.input.addEventListener("input", function () { els.btn.disabled = !els.input.value.trim(); });
        els.input.addEventListener("keydown", function (e) { if (e.key === "Enter" && els.input.value.trim()) els.btn.click(); });

        els.btn.addEventListener("click", function () {
            var username = els.input.value.trim() || CONFIG.defaultUsername;

            els.splash.style.display = "none";
            els.termContainer.className = "ss-terminal-container active";
            els.termContainer.innerHTML = '<div class="ss-loading">Loading terminal…</div>';

            loadXterm(function () {
                els.termContainer.innerHTML = "";
                var TerminalClass = window.Terminal;
                if (!TerminalClass) {
                    els.termContainer.innerHTML = '<div class="ss-loading" style="color:#ef4444">Failed to load xterm.js. Check your internet connection.</div>';
                    return;
                }

                var term = new TerminalClass({
                    cursorBlink: true,
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                    theme: {
                        background: "#0D1E1C", foreground: "#e2e8f0", cursor: "#a5d75f",
                        black: "#12312b", red: "#9d162e", green: "#a5d75f", yellow: "#f5dc69",
                        blue: "#267aba", magenta: "#8a6996", cyan: "#c4dd88", white: "#e2e8f0",
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

                var MISSIONS = buildMissions(clusterName, hostname, sharedMemoryHostname, username);

                var state = {
                    term: term, username: username, MISSIONS: MISSIONS,
                    missionIdx: 0, currentLine: "", isPasswordPrompt: false, waitingForAction: false
                };

                state.writePrompt = function () {
                    term.write("\r\n" + C.blue + "user@mylaptop" + C.reset + ":" + C.cyan + "~" + C.reset + "$ ");
                };
                state.writeln = function (text) { term.write("\r\n" + text); };

                state.showMission = function (idx) {
                    var m = MISSIONS[idx];
                    if (!m) {
                        state.writeln("");
                        state.writeln(C.magenta + "══════════════════════════════════════════════" + C.reset);
                        state.writeln(C.green + "  🎉  Practice complete!" + C.reset);
                        state.writeln(C.white + "  You're ready to connect to the real cluster." + C.reset);
                        state.writeln(C.magenta + "══════════════════════════════════════════════" + C.reset);
                        return;
                    }
                    var bar = "█".repeat(idx) + "░".repeat(MISSIONS.length - idx);
                    state.writeln("");
                    state.writeln(C.magenta + "── Scenario " + (idx + 1) + "/" + MISSIONS.length + ": " + m.title + " ──" + C.reset + "  " + C.dim + bar + C.reset);
                    state.writeln(C.cyan + m.prompt + C.reset);
                    state.writeln(C.white + "  → " + m.goal + C.reset);
                    state.writePrompt();
                };

                state.handlePasswordInput = function (pwd) {
                    state.isPasswordPrompt = false;
                    var m = MISSIONS[state.missionIdx];

                    if (m.action === "wrong_password") {
                        if (pwd === "wrongpassword") {
                            setTimeout(function () {
                                state.writeln("Permission denied, please try again.");
                                setTimeout(function () {
                                    state.writeln(C.green + "✓ That's right! If you see 'Permission denied', double-check your password." + C.reset);
                                    state.missionIdx++;
                                    setTimeout(function () { state.showMission(state.missionIdx); }, 400);
                                }, 800);
                            }, 500);
                        } else {
                            setTimeout(function () {
                                state.writeln("Permission denied, please try again.");
                                state.writeln(C.red + "Oops! For this scenario, you need to literally type 'wrongpassword' to see what happens." + C.reset);
                                state.isPasswordPrompt = true;
                                term.write("\r\n" + username + "@" + m.targetHost + "'s password: ");
                            }, 500);
                        }
                    } else if (m.action === "login") {
                        setTimeout(function () {
                            state.writeln(C.dim + "Last login: Wed Mar 17 08:32:11 2024 from 129.170.x.x" + C.reset);
                            state.writeln(C.dim + "--- Welcome to " + m.targetHost + " ---" + C.reset);
                            setTimeout(function () {
                                state.writeln(C.green + "✓ Success! You logged in." + C.reset);
                                state.missionIdx++;
                                setTimeout(function () { state.showMission(state.missionIdx); }, 400);
                            }, 800);
                        }, 500);
                    }
                };

                state.handleCommand = function (cmd) {
                    var trimmed = cmd.trim();
                    if (!trimmed) { state.writePrompt(); return; }

                    if (trimmed === "hint") {
                        var hm = MISSIONS[state.missionIdx];
                        state.writeln(hm ? (C.yellow + "💡 " + hm.hint + C.reset) : (C.dim + "No active mission." + C.reset));
                        state.writePrompt(); return;
                    }
                    if (trimmed === "clear") { term.clear(); state.writePrompt(); return; }

                    var m = MISSIONS[state.missionIdx];
                    if (!m) return;

                    if (m.check(trimmed)) {
                        if (m.action === "timeout") {
                            state.waitingForAction = true;
                            setTimeout(function () {
                                state.writeln("ssh: Could not resolve hostname " + m.targetHost + ": nodename nor servname provided, or not known");
                                setTimeout(function () {
                                    state.writeln(C.green + "✓ Expected failure! If you see a resolution error, you usually need to connect to the VPN." + C.reset);
                                    state.missionIdx++;
                                    state.waitingForAction = false;
                                    setTimeout(function () { state.showMission(state.missionIdx); }, 400);
                                }, 1000);
                            }, 500);
                        } else {
                            // Valid command, simulate connecting
                            var isNewHost = (m.targetHost === sharedMemoryHostname && state.missionIdx === 2);
                            if (isNewHost) {
                                state.writeln("The authenticity of host '" + m.targetHost + " (129.170.x.x)' can't be established.");
                                state.writeln("ED25519 key fingerprint is SHA256:abc123xyz...");
                                state.writeln("Are you sure you want to continue connecting (yes/no/[fingerprint])?");
                                setTimeout(function () {
                                    state.writeln(C.dim + "(Auto-accepting for this simulation...)" + C.reset);
                                    state.writeln("Warning: Permanently added '" + m.targetHost + "' (ED25519) to the list of known hosts.");
                                    promptPassword();
                                }, 1500);
                            } else {
                                promptPassword();
                            }

                            function promptPassword() {
                                state.isPasswordPrompt = true;
                                term.write("\r\n" + username + "@" + m.targetHost + "'s password: ");
                            }
                        }
                    } else {
                        // Wrong command
                        if (trimmed.startsWith("ssh")) {
                            state.writeln(C.red + "Not quite what we're looking for here. Type 'hint' if you need help." + C.reset);
                        } else {
                            state.writeln("bash: " + trimmed.split(" ")[0] + ": command not found");
                        }
                        state.writePrompt();
                    }
                };

                term.onKey(function (ev) {
                    if (state.waitingForAction) return;

                    var key = ev.key, domEvent = ev.domEvent;

                    if (domEvent.key === "Enter") {
                        var cmd = state.currentLine; state.currentLine = "";
                        if (state.isPasswordPrompt) {
                            term.write("\r\n");
                            state.handlePasswordInput(cmd);
                        } else {
                            term.write("\r\n");
                            state.handleCommand(cmd);
                        }
                    } else if (domEvent.key === "Backspace") {
                        if (state.currentLine.length > 0) {
                            state.currentLine = state.currentLine.slice(0, -1);
                            if (!state.isPasswordPrompt) {
                                term.write("\b \b");
                            }
                        }
                    } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
                        state.currentLine += key;
                        if (!state.isPasswordPrompt) {
                            term.write(key);
                        }
                    }
                });

                // ── Intro text ──
                term.write(C.magenta + "══════════════════════════════════════════════" + C.reset + "\r\n");
                term.write(C.white + "   SSH Connection Simulator" + C.reset + "\r\n");
                term.write(C.magenta + "══════════════════════════════════════════════" + C.reset + "\r\n");
                term.write("\r\n");
                term.write(C.cyan + "This is a simulated local terminal. The commands you" + C.reset + "\r\n");
                term.write(C.cyan + "type here stay in your browser." + C.reset + "\r\n");
                term.write("\r\n");
                term.write(C.dim + "  Type 'hint' if you get stuck." + C.reset + "\r\n");

                setTimeout(function () { state.showMission(0); }, 100);
            });
        });
    }

    // ── Auto-initialise all .ssh-simulator containers ──
    function init() {
        document.querySelectorAll(".ssh-simulator").forEach(initTour);
    }

    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { init(); });
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
