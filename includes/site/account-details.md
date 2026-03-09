<!-- includes/site/account-details.md
     Institution-specific: describes how to request an account and what comes with it.
     Replace this file with your own account details when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ institution.name }}.
-->

## Requesting an Account at {{ institution.short_name }}

To request a {{ institution.support_team }} account, go to the [HPC Account Request page](https://dashboard.dartmouth.edu/research/hpc_account) and log in with your NetID. Once your account is created, you'll receive a confirmation email with further details.

!!! note "Non-{{ institution.short_name }} collaborators"
    If you're working with someone outside of {{ institution.short_name }} who needs access, faculty sponsors can request accounts for external collaborators. Contact [{{ institution.support_team }}](mailto:research.computing@dartmouth.edu) for details.

## Your Home Directory

When your account is created, you get a **50 GB home directory** on {{ storage.shared_name }}. This directory is shared across all {{ institution.support_team }} Linux systems — {{ cluster.name }}, Andes, and Polaris — so your files are available no matter which system you log into.

Home directory paths follow a specific pattern based on the last character of your NetID. For example, if your NetID is `f1234x5`, your home directory would be:

```
/dartfs/rc/home/5/f1234x5
```

!!! note "Legacy locations"
    There used to be two DartFS systems: One regular one and one intended for use with the HPC systems. For that reason, there are still some users and labs that are under `/dartfs-hpc/...`. Going forward, this location will be phased out, however, and we recommend putting everything under `/dartfs/...`.


### Mounting Your Home Directory on a Personal Computer

You can access your {{ storage.shared_name }} home directory directly from your laptop or desktop, as long as you're on the {{ institution.short_name }} network (or connected through the VPN).

=== "macOS"

    Open **Finder**, press ++cmd+k++, and enter your mount path:

    ```
    smb://netid@dartfs.dartmouth.edu/rc/home/<last-char>/<netid>
    ```

    Replace `<last-char>` with the last character of your NetID and `<netid>` with your full NetID. For example, NetID `f1234x5` would use:

    ```
    smb://f1234x5@dartfs.dartmouth.edu/rc/home/5/f1234x5
    ```

=== "Windows"

    Open **File Explorer**, click the address bar, and enter your UNC path:

    ```
    \\dartfs.dartmouth.edu\rc\home\<last-char>\<netid>
    ```

    For example, NetID `f1234x5` would use:

    ```
    \\dartfs.dartmouth.edu\rc\home\5\f1234x5
    ```

!!! tip "You must be on the {{ institution.short_name }} network"
    Home directory mounting only works when you're connected to the campus network or running the {{ institution.short_name }} VPN. If you're off campus and can't connect, start the VPN first.

## Additional Storage

Your 50 GB home directory is great for scripts, configuration files, and small datasets, but research often requires more space. All faculty are entitled to a free **1 TB lab volume** on {{ storage.shared_name }} to support their research — additional storage beyond that can be purchased through the [Storage Request page](https://rcweb.dartmouth.edu/storagerequests/).

!!! note "Lab volumes are faculty-only"
    Lab volumes are provisioned for faculty principal investigators, not for individual students or staff. If you're a student or postdoc, your advisor's lab volume is where shared research data typically lives. Ask your PI for the path.

Lab volumes live under `/dartfs/rc/lab/` and default to the PI's last name and first initial, grouped by the first letter. For example, Professor Charles Xavier's lab share would be at:

```
/dartfs/rc/lab/X/XavierC
```

Like home directories, lab volumes can be mounted from a personal computer using the same pattern — just replace `/rc/home/<last-char>/<netid>` with `/rc/lab/<first-letter>/<labname>` in the mount paths described above.

For a full overview of the available storage tiers, see the [Storage Fundamentals](../fundamentals/storage.md) article.


## Check Your Understanding

Enter your name and NetID below to see your actual paths — or leave the defaults to practice with a fictional researcher. The lab share path is included too, though note that lab volumes are only available to faculty.

<div id="path-quiz" markdown="0">
<style>
  #path-quiz {
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: .4rem;
    padding: 1.2rem 1.4rem;
    margin: 1rem 0 1.6rem;
    background: var(--md-code-bg-color);
  }
  #path-quiz .quiz-section-label {
    font-size: .8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--md-default-fg-color--light);
    margin-bottom: .6rem;
    padding-bottom: .3rem;
    border-bottom: 1px solid var(--md-default-fg-color--lightest);
  }
  #path-quiz .quiz-identity {
    display: flex;
    gap: .8rem;
    margin-bottom: 1.2rem;
    flex-wrap: wrap;
  }
  #path-quiz .quiz-identity .quiz-field {
    flex: 1;
    min-width: 180px;
  }
  #path-quiz .quiz-prompt {
    font-size: .95rem;
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  #path-quiz .quiz-prompt code {
    font-family: "JetBrains Mono", monospace;
    background: var(--md-default-fg-color--lightest);
    padding: .15rem .4rem;
    border-radius: .2rem;
    font-size: .9em;
  }
  #path-quiz .quiz-field {
    margin-bottom: .8rem;
  }
  #path-quiz label {
    display: block;
    font-size: .85rem;
    font-weight: 600;
    margin-bottom: .3rem;
    color: var(--md-default-fg-color--light);
  }
  #path-quiz label .faculty-badge {
    font-size: .75rem;
    font-weight: 500;
    color: var(--md-accent-fg-color, #526f34);
    margin-left: .3rem;
  }
  #path-quiz input[type="text"] {
    width: 100%;
    box-sizing: border-box;
    font-family: "JetBrains Mono", monospace;
    font-size: .85rem;
    padding: .5rem .7rem;
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: .3rem;
    background: var(--md-default-bg-color);
    color: var(--md-default-fg-color);
    transition: border-color .2s;
  }
  #path-quiz input[type="text"]:focus {
    outline: none;
    border-color: var(--md-accent-fg-color, #526f34);
  }
  #path-quiz input.identity-input {
    font-family: inherit;
  }
  #path-quiz .quiz-buttons {
    display: flex;
    gap: .6rem;
    margin-top: 1rem;
  }
  #path-quiz button {
    font-size: .85rem;
    padding: .45rem 1.1rem;
    border: none;
    border-radius: .3rem;
    cursor: pointer;
    font-weight: 500;
    transition: opacity .2s;
  }
  #path-quiz button:hover { opacity: .85; }
  #path-quiz .btn-check {
    background: var(--md-accent-fg-color, #526f34);
    color: #fff;
  }
  #path-quiz .btn-new {
    background: var(--md-default-fg-color--lightest);
    color: var(--md-default-fg-color);
  }
  #path-quiz .btn-reset {
    background: none;
    color: var(--md-default-fg-color--light);
    text-decoration: underline;
    padding: .45rem .5rem;
  }
  #path-quiz .quiz-feedback {
    margin-top: .8rem;
    padding: .6rem .8rem;
    border-radius: .3rem;
    font-size: .85rem;
    display: none;
    line-height: 1.7;
  }
  #path-quiz .quiz-feedback code {
    font-family: "JetBrains Mono", monospace;
    font-size: .85em;
  }
  #path-quiz .quiz-feedback.correct {
    background: #d4edda;
    color: #155724;
    display: block;
  }
  #path-quiz .quiz-feedback.incorrect {
    background: #f8d7da;
    color: #721c24;
    display: block;
  }
  #path-quiz .quiz-feedback .fb-row {
    display: flex;
    align-items: baseline;
    gap: .4rem;
  }
  #path-quiz .quiz-feedback .fb-icon {
    flex-shrink: 0;
  }
  [data-md-color-scheme="dartmouth-dark"] #path-quiz .quiz-feedback.correct {
    background: #1a3a1a;
    color: #a3d9a5;
  }
  [data-md-color-scheme="dartmouth-dark"] #path-quiz .quiz-feedback.incorrect {
    background: #3a1a1a;
    color: #d9a3a3;
  }
  [data-md-color-scheme="dartmouth-dark"] #path-quiz .quiz-feedback.partial {
    background: #3a3a1a;
    color: #d9d9a3;
  }
  #path-quiz .quiz-feedback.partial {
    background: #fff3cd;
    color: #856404;
    display: block;
  }
  #path-quiz .quiz-divider {
    border: none;
    border-top: 1px solid var(--md-default-fg-color--lightest);
    margin: 1rem 0;
  }
  #path-quiz .tabbed-set {
    margin: 0 0 .5rem;
  }
</style>

<div class="quiz-section-label">About you (optional)</div>

<div class="quiz-identity">
  <div class="quiz-field">
    <label for="quiz-name">Full name:</label>
    <input type="text" id="quiz-name" class="identity-input" placeholder="Charles Xavier" autocomplete="off" spellcheck="false">
  </div>
  <div class="quiz-field">
    <label for="quiz-netid">NetID:</label>
    <input type="text" id="quiz-netid" class="identity-input" placeholder="f1234x5" autocomplete="off" spellcheck="false">
  </div>
</div>

<hr class="quiz-divider">

<div class="quiz-prompt" id="quiz-question"></div>

<div class="quiz-field">
  <label for="answer-path">Home directory path (Linux):</label>
  <input type="text" id="answer-path" placeholder="/dartfs/rc/home/…" autocomplete="off" spellcheck="false">
</div>

<div class="tabbed-set tabbed-alternate" data-tabs="quiz-mount:2">
  <input checked="checked" id="__quiz_mount_1" name="__quiz_mount" type="radio">
  <input id="__quiz_mount_2" name="__quiz_mount" type="radio">
  <div class="tabbed-labels tabbed-labels--linked">
    <label for="__quiz_mount_1">macOS</label>
    <label for="__quiz_mount_2">Windows</label>
  </div>
  <div class="tabbed-content">
    <div class="tabbed-block">
      <div class="quiz-field">
        <label for="answer-mount-mac">Home directory mount path (macOS Finder):</label>
        <input type="text" id="answer-mount-mac" placeholder="smb://…" autocomplete="off" spellcheck="false">
      </div>
    </div>
    <div class="tabbed-block">
      <div class="quiz-field">
        <label for="answer-mount-win">Home directory mount path (Windows Explorer):</label>
        <input type="text" id="answer-mount-win" placeholder="\\…" autocomplete="off" spellcheck="false">
      </div>
    </div>
  </div>
</div>

<div class="quiz-field">
  <label for="answer-lab">Lab share path (Linux): <span class="faculty-badge">faculty only</span></label>
  <input type="text" id="answer-lab" placeholder="/dartfs/rc/lab/…" autocomplete="off" spellcheck="false">
</div>

<div class="quiz-buttons">
  <button class="btn-check" onclick="pathQuiz.check()">Check</button>
  <button class="btn-new" onclick="pathQuiz.next()">New question</button>
  <button class="btn-reset" onclick="pathQuiz.reset()">Reset score</button>
</div>

<div class="quiz-feedback" id="quiz-feedback"></div>

<script>
(function() {
  var currentNetID = '';
  var currentLabName = '';
  /* Stored random values so they survive keystrokes in identity fields */
  var storedRandomName = '';
  var storedRandomNetID = '';

  /* ---------- helpers ---------- */

  function randomNetID() {
    var L = 'abcdefghijklmnopqrstuvwxyz', D = '0123456789';
    var p = function(s) { return s[Math.floor(Math.random() * s.length)]; };
    return p(L) + p(D) + p(D) + p(D) + p(D) + p(L) + p(D);
  }

  var sampleNames = [
    'Charles Xavier', 'Jean Grey', 'Ororo Munroe', 'Hank McCoy',
    'Marie Curie', 'Ada Lovelace', 'Alan Turing', 'Grace Hopper',
    'Rosalind Franklin', 'Nikola Tesla', 'Emmy Noether', 'Lise Meitner'
  ];

  function randomName() {
    return sampleNames[Math.floor(Math.random() * sampleNames.length)];
  }

  /* Build the lab volume name: LastNameFirstInitial in title case.
     E.g. "Charles Xavier" → "XavierC", grouped under "X". */
  function labName(fullName) {
    var parts = fullName.trim().split(/\s+/);
    var first = parts[0] || '';
    var last  = parts[parts.length - 1] || '';
    var cap   = function(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); };
    return cap(last) + first.charAt(0).toUpperCase();
  }

  function expected(netid, labname) {
    var last = netid[netid.length - 1];
    var groupLetter = labname.charAt(0).toUpperCase();
    return {
      path:     '/dartfs/rc/home/' + last + '/' + netid,
      mountMac: 'smb://' + netid +
                '@dartfs.dartmouth.edu/rc/home/' + last + '/' + netid,
      mountWin: '\\\\dartfs.dartmouth.edu\\rc\\home\\' + last + '\\' + netid,
      lab:      '/dartfs/rc/lab/' + groupLetter + '/' + labname
    };
  }

  function activeTab() {
    var winRadio = document.getElementById('__quiz_mount_2');
    return winRadio && winRadio.checked ? 'win' : 'mac';
  }

  /* ---------- quiz logic ---------- */

  /* Refresh the prompt text using the current identity fields.
     Falls back to the stored random name/NetID (generated once per
     question) so typing in the identity fields doesn't cause new
     random values to appear on every keystroke. */
  function refreshPrompt() {
    var userName  = document.getElementById('quiz-name').value.trim();
    var userNetID = document.getElementById('quiz-netid').value.trim();

    var name     = userName  || storedRandomName;
    currentNetID    = userNetID || storedRandomNetID;
    currentLabName  = labName(name);

    var display  = userName ? 'Your' : name + '\u2019s';
    var question = userName ? 'What are your paths?' : 'What are their paths?';
    document.getElementById('quiz-question').innerHTML =
      display + ' NetID is <code>' + currentNetID + '</code>. ' + question;
  }

  /* Pick fresh random values (when identity fields are empty),
     clear answer fields, dismiss feedback, and focus the first input. */
  function generate() {
    storedRandomName  = randomName();
    storedRandomNetID = randomNetID();
    refreshPrompt();

    ['answer-path', 'answer-mount-mac', 'answer-mount-win', 'answer-lab'].forEach(function(id) {
      document.getElementById(id).value = '';
    });
    var fb = document.getElementById('quiz-feedback');
    fb.className = 'quiz-feedback';
    fb.style.display = 'none';
    document.getElementById('answer-path').focus();
  }

  function check() {
    var tab = activeTab();
    var mountId = tab === 'win' ? 'answer-mount-win' : 'answer-mount-mac';
    var mountVal = document.getElementById(mountId).value.trim().replace(/[\\/]+$/, '');

    var ans = {
      path:  document.getElementById('answer-path').value.trim().replace(/\/+$/, ''),
      mount: mountVal,
      lab:   document.getElementById('answer-lab').value.trim().replace(/\/+$/, '')
    };
    var exp = expected(currentNetID, currentLabName);
    var fb  = document.getElementById('quiz-feedback');

    var mountLabel = tab === 'win' ? 'Windows mount' : 'Mac mount';
    var expMount   = tab === 'win' ? exp.mountWin : exp.mountMac;

    var results = [
      { label: 'Home path',  ok: ans.path  === exp.path, exp: exp.path  },
      { label: mountLabel,   ok: ans.mount === expMount,  exp: expMount  },
      { label: 'Lab share',  ok: ans.lab   === exp.lab,   exp: exp.lab   }
    ];

    var nCorrect = results.filter(function(r) { return r.ok; }).length;

    if (nCorrect === 3) {
      fb.className = 'quiz-feedback correct';
      fb.innerHTML = 'All three correct \u2014 nice work!';
    } else {
      var rows = results.map(function(r) {
        var icon = r.ok ? '&#10003;' : '&#10007;';
        var text = r.ok
          ? r.label + ': correct'
          : r.label + ': expected <code>' + r.exp + '</code>';
        return '<div class="fb-row"><span class="fb-icon">' + icon + '</span> ' + text + '</div>';
      });
      fb.className = 'quiz-feedback ' + (nCorrect > 0 ? 'partial' : 'incorrect');
      fb.innerHTML = rows.join('');
    }
    fb.style.display = 'block';
  }

  function reset() {
    generate();
  }

  /* ---------- keyboard support ---------- */

  var answerInputs = ['answer-path', 'answer-mount-mac', 'answer-mount-win', 'answer-lab'];
  answerInputs.forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { check(); }
    });
  });

  /* Re-render prompt when identity fields change — uses stored random
     values so the question stays stable while the user is typing. */
  document.getElementById('quiz-name').addEventListener('input', refreshPrompt);
  document.getElementById('quiz-netid').addEventListener('input', refreshPrompt);

  /* ---------- public API ---------- */

  window.pathQuiz = { check: check, next: generate, reset: reset };

  /* initialise */
  generate();
})();
</script>
</div>


## Optional Features

{{ institution.support_team }} offers a few optional features you can enable by emailing [research.computing@dartmouth.edu](mailto:research.computing@dartmouth.edu):

**Personal website hosting** — Your home directory can serve a website at `https://rcweb.dartmouth.edu/homes/<netid>/`. Custom URL aliases are available on a first-come, first-served basis.

**Login nicknames** — By default you log in with your NetID, but you can request a friendlier username (e.g., `cxavier` instead of `f1234x5`) for use on the Linux systems. Nicknames make it easier to identify your processes and are approved on a first-come, first-served basis.

!!! note
    Nicknames only apply to the Linux command line. They can't be used for mounting home directories or for website aliases (though it's nice when they match).
