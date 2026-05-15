/**
 * Personalize copy-pasteable code blocks with the reader's username.
 *
 * Pages can include the widget defined in includes/username-input.md.
 * That widget renders one or more `.username-personalize-input` fields,
 * each carrying a `data-placeholder-token` attribute (e.g. "your_netid").
 *
 * On input, this script:
 *   1. Persists the value to localStorage so it survives navigation
 *      between pages and across tabs.
 *   2. Walks every <code> and <kbd> element on the page, replacing the
 *      placeholder token in text nodes with the entered username.
 *   3. Toggles a `data-personalized` attribute on <body> so CSS can
 *      hide redundant "replace your_netid with..." hint paragraphs.
 *
 * Original text is snapshotted in a WeakMap on first sight so clearing
 * the input restores the placeholder verbatim.
 */
(function () {
    "use strict";

    var STORAGE_KEY = "hpc-cookbook-username";
    var INPUT_SELECTOR = ".username-personalize-input";
    var CODE_SELECTOR = "code, kbd";

    var originalText = new WeakMap();

    function readStored() {
        try { return localStorage.getItem(STORAGE_KEY) || ""; }
        catch (e) { return ""; }
    }

    function writeStored(value) {
        try {
            if (value) localStorage.setItem(STORAGE_KEY, value);
            else localStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }
    }

    function collectPlaceholders() {
        var tokens = new Set();
        document.querySelectorAll(INPUT_SELECTOR).forEach(function (input) {
            var token = input.dataset.placeholderToken;
            if (token) tokens.add(token);
        });
        return tokens;
    }

    function applyReplacement(username, placeholders) {
        if (placeholders.size === 0) return;
        document.querySelectorAll(CODE_SELECTOR).forEach(function (codeEl) {
            if (codeEl.closest(".username-personalize")) return;
            var walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
            var node;
            while ((node = walker.nextNode())) {
                if (!originalText.has(node)) {
                    originalText.set(node, node.textContent);
                }
                var original = originalText.get(node);
                var text = original;
                if (username) {
                    placeholders.forEach(function (token) {
                        if (text.indexOf(token) !== -1) {
                            text = text.split(token).join(username);
                        }
                    });
                }
                if (node.textContent !== text) {
                    node.textContent = text;
                }
            }
        });
        document.body.toggleAttribute("data-personalized", !!username);
    }

    function syncInputs(value, source) {
        document.querySelectorAll(INPUT_SELECTOR).forEach(function (input) {
            if (input !== source && input.value !== value) {
                input.value = value;
            }
        });
    }

    function init() {
        var inputs = document.querySelectorAll(INPUT_SELECTOR);
        if (inputs.length === 0) {
            document.body.removeAttribute("data-personalized");
            return;
        }

        var placeholders = collectPlaceholders();
        var stored = readStored();

        inputs.forEach(function (input) {
            input.value = stored;
            input.addEventListener("input", function () {
                var value = this.value.trim();
                writeStored(value);
                syncInputs(value, this);
                applyReplacement(value, placeholders);
            });
        });

        applyReplacement(stored, placeholders);
    }

    window.addEventListener("storage", function (event) {
        if (event.key !== STORAGE_KEY) return;
        var value = event.newValue || "";
        syncInputs(value, null);
        applyReplacement(value, collectPlaceholders());
    });

    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { init(); });
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
