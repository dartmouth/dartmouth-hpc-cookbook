/**
 * Slide-deck Quiz Widget
 * ======================
 * Auto-initialises every `.slide-quiz` container on the page.
 *
 * Expected HTML structure inside each `.slide-quiz`:
 *
 *   <div class="slide-quiz">
 *     <div class="quiz-slide" data-answer="choice-key"
 *          data-explain="Explanation shown after answering.">
 *       <div class="quiz-prompt">Question text…</div>
 *       <div class="quiz-options">
 *         <button class="quiz-btn" data-choice="choice-key">Label</button>
 *         …
 *       </div>
 *       <div class="quiz-feedback"></div>
 *     </div>
 *     <!-- more .quiz-slide elements … -->
 *   </div>
 *
 * The script injects the card wrapper, progress bar, navigation,
 * and result slide automatically so the Markdown file only needs
 * the question data.
 */
(function () {
    "use strict";

    /* ── Icons & symbols (edit here to restyle globally) ────────── */
    var ICON_PERFECT = "\uD83C\uDF89"; /* 🎉 — perfect score       */
    var ICON_GOOD = "\uD83D\uDC4D"; /* 👍 — above 60 %          */
    var ICON_STUDY = "\uD83D\uDCD6"; /* 📖 — keep studying        */
    var SYM_CORRECT = "\u2713";       /* ✓  — correct feedback     */
    var SYM_WRONG = "\u2717";       /* ✗  — wrong feedback       */
    var SYM_RESTART = "\u21BB";       /* ↻  — restart button       */
    var SYM_ARROW = "\u2192";       /* →  — next button          */

    /**
     * Wrap raw quiz-slide elements with the card chrome
     * (progress bar, navigation, result slide) so authors
     * only need to provide the question data in Markdown.
     */
    function buildCard(quiz) {
        var slides = Array.prototype.slice.call(
            quiz.querySelectorAll(".quiz-slide")
        );
        var total = slides.length;

        /* --- Create card wrapper --- */
        var card = document.createElement("div");
        card.className = "quiz-card";

        /* --- Header (progress bar + counter) --- */
        var header = document.createElement("div");
        header.className = "quiz-header";

        var progressBar = document.createElement("div");
        progressBar.className = "quiz-progress-bar";
        var progressFill = document.createElement("div");
        progressFill.className = "quiz-progress-fill";
        progressBar.appendChild(progressFill);

        var counter = document.createElement("span");
        counter.className = "quiz-counter";
        counter.textContent = "Question 1 of " + total;

        header.appendChild(progressBar);
        header.appendChild(counter);

        /* --- Viewport (holds slides) --- */
        var viewport = document.createElement("div");
        viewport.className = "quiz-viewport";

        slides.forEach(function (s) {
            viewport.appendChild(s);
        });

        /* --- Result slide --- */
        var resultSlide = document.createElement("div");
        resultSlide.className = "quiz-slide quiz-result";

        var scoreIcon = document.createElement("span");
        scoreIcon.className = "score-icon";
        var scoreText = document.createElement("div");
        scoreText.className = "score-text";
        var scoreDetail = document.createElement("div");
        scoreDetail.className = "score-detail";
        var restartBtn = document.createElement("button");
        restartBtn.className = "quiz-restart";
        restartBtn.textContent = SYM_RESTART + " Try Again";

        resultSlide.appendChild(scoreIcon);
        resultSlide.appendChild(scoreText);
        resultSlide.appendChild(scoreDetail);
        resultSlide.appendChild(restartBtn);
        viewport.appendChild(resultSlide);

        /* --- Navigation footer --- */
        var nav = document.createElement("div");
        nav.className = "quiz-nav";
        var nextBtn = document.createElement("button");
        nextBtn.className = "quiz-next";
        nextBtn.textContent = "Next " + SYM_ARROW;
        nav.appendChild(nextBtn);

        /* --- Assemble card --- */
        card.appendChild(header);
        card.appendChild(viewport);
        card.appendChild(nav);
        quiz.innerHTML = "";
        quiz.appendChild(card);

        return {
            card: card,
            slides: slides,
            resultSlide: resultSlide,
            progressFill: progressFill,
            counter: counter,
            nextBtn: nextBtn,
            restartBtn: restartBtn,
            scoreIcon: scoreIcon,
            scoreText: scoreText,
            scoreDetail: scoreDetail,
            total: total,
        };
    }

    /**
     * Wire up interactivity for one quiz instance.
     */
    function initQuiz(quiz) {
        var q = buildCard(quiz);
        var current = 0;
        var correct = 0;
        var slideAnswered = [];

        function reset() {
            current = 0;
            correct = 0;
            slideAnswered = [];
            for (var i = 0; i < q.total; i++) slideAnswered.push(false);

            q.slides.forEach(function (s) {
                s.classList.remove("active");
                var btns = s.querySelectorAll(".quiz-btn");
                btns.forEach(function (b) {
                    b.disabled = false;
                    b.classList.remove("correct", "wrong");
                });
                var fb = s.querySelector(".quiz-feedback");
                fb.className = "quiz-feedback";
                fb.innerHTML = "";
            });

            q.card.classList.remove("answered-correct", "answered-wrong");
            q.resultSlide.classList.remove("active");
            q.nextBtn.classList.remove("visible");
            q.slides[0].classList.add("active");
            updateProgress();
        }

        function updateProgress() {
            var pct = (current / q.total) * 100;
            q.progressFill.style.width = pct + "%";
            q.counter.textContent =
                "Question " + (current + 1) + " of " + q.total;
        }

        function showSlide(idx) {
            q.slides.forEach(function (s) {
                s.classList.remove("active");
            });
            q.resultSlide.classList.remove("active");
            q.card.classList.remove("answered-correct", "answered-wrong");

            if (idx < q.total) {
                q.slides[idx].classList.add("active");
                q.nextBtn.classList.remove("visible");
                if (slideAnswered[idx]) {
                    q.nextBtn.classList.add("visible");
                    q.nextBtn.textContent =
                        idx === q.total - 1 ? "See Results " + SYM_ARROW : "Next " + SYM_ARROW;
                }
            }
            updateProgress();
        }

        function showResult() {
            q.slides.forEach(function (s) {
                s.classList.remove("active");
            });
            q.card.classList.remove("answered-correct", "answered-wrong");
            q.nextBtn.classList.remove("visible");
            q.progressFill.style.width = "100%";
            q.counter.textContent = "Results";

            if (correct === q.total) {
                q.scoreIcon.textContent = ICON_PERFECT;
                q.scoreText.textContent =
                    "Perfect score! " + correct + "/" + q.total;
                q.scoreDetail.textContent =
                    "You really know your stuff!";
            } else if (correct >= Math.ceil(q.total * 0.6)) {
                q.scoreIcon.textContent = ICON_GOOD;
                q.scoreText.textContent =
                    "Nice work! " + correct + "/" + q.total + " correct.";
                q.scoreDetail.textContent =
                    "Review the material above to brush up on the ones you missed.";
            } else {
                q.scoreIcon.textContent = ICON_STUDY;
                q.scoreText.textContent =
                    correct + "/" + q.total + " correct.";
                q.scoreDetail.textContent =
                    "Give the material above another read \u2014 you\u2019ll get there!";
            }

            q.resultSlide.classList.add("active");
        }

        /* --- Answer buttons --- */
        q.slides.forEach(function (slide, slideIdx) {
            var buttons = slide.querySelectorAll(".quiz-btn");
            var feedback = slide.querySelector(".quiz-feedback");
            var answer = slide.getAttribute("data-answer");
            var explain = slide.getAttribute("data-explain");

            buttons.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    if (slideAnswered[slideIdx]) return;
                    slideAnswered[slideIdx] = true;

                    var choice = btn.getAttribute("data-choice");
                    var isCorrect = choice === answer;

                    buttons.forEach(function (b) {
                        b.disabled = true;
                    });

                    if (isCorrect) {
                        btn.classList.add("correct");
                        q.card.classList.add("answered-correct");
                        feedback.classList.add("is-correct");
                        feedback.innerHTML = SYM_CORRECT + " Correct! " + explain;
                        correct++;
                    } else {
                        btn.classList.add("wrong");
                        q.card.classList.add("answered-wrong");
                        feedback.classList.add("is-wrong");
                        buttons.forEach(function (b) {
                            if (b.getAttribute("data-choice") === answer)
                                b.classList.add("correct");
                        });
                        feedback.innerHTML = SYM_WRONG + " Not quite. " + explain;
                    }

                    q.nextBtn.textContent =
                        slideIdx === q.total - 1
                            ? "See Results " + SYM_ARROW
                            : "Next " + SYM_ARROW;
                    q.nextBtn.classList.add("visible");
                });
            });
        });

        /* --- Next button --- */
        q.nextBtn.addEventListener("click", function () {
            if (current < q.total - 1) {
                current++;
                showSlide(current);
            } else {
                showResult();
            }
        });

        /* --- Restart button --- */
        q.restartBtn.addEventListener("click", function () {
            reset();
        });

        reset();
    }

    /* --- Auto-discover and initialise all quizzes on the page --- */
    function boot() {
        var quizzes = document.querySelectorAll(".slide-quiz");
        for (var i = 0; i < quizzes.length; i++) {
            initQuiz(quizzes[i]);
        }
    }

    /* Support MkDocs Material instant-loading (SPA navigation) */
    if (typeof document$ !== "undefined") {
        document$.subscribe(function () {
            boot();
        });
    } else {
        /* Fallback: standard DOMContentLoaded */
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", boot);
        } else {
            boot();
        }
    }
})();
