/**
 * Тест A–D. Данные — data/test.data.js
 */
let MC_QUESTIONS = [];
const resultMessages = {
  perfect: "Блестяще! Вы отлично знаете Липецк.",
  good: "Хороший результат! Загляните в путеводитель, чтобы закрепить материал.",
  low: "Есть над чем поработать — пройдите карточки или перечитайте разделы сайта."
};

const quizScreen = document.getElementById("mcQuizScreen");
const resultsScreen = document.getElementById("mcResultsScreen");
const progressEl = document.getElementById("mcProgress");
const questionEl = document.getElementById("mcQuestion");
const optionsEl = document.getElementById("mcOptions");
const explainPanel = document.getElementById("mcExplainPanel");
const explainBtn = document.getElementById("mcExplainBtn");
const nextBtn = document.getElementById("mcNextBtn");
const scoreLine = document.getElementById("mcScoreLine");
const percentLine = document.getElementById("mcPercentLine");
const resultMsg = document.getElementById("mcResultMsg");
const retryBtn = document.getElementById("mcRetryBtn");

let qIndex = 0;
let revealed = false;
let score = 0;
let explainOpen = false;

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderQuestion() {
  if (!MC_QUESTIONS.length) {
    if (questionEl) questionEl.textContent = "В данных теста нет вопросов (data/test.data.js).";
    if (progressEl) progressEl.textContent = "—";
    if (optionsEl) optionsEl.innerHTML = "";
    return;
  }
  revealed = false;
  explainOpen = false;
  explainPanel.hidden = true;
  explainPanel.textContent = "";
  explainBtn.disabled = true;
  explainBtn.title = "Сначала выберите вариант ответа";
  nextBtn.disabled = true;
  nextBtn.textContent = qIndex < MC_QUESTIONS.length - 1 ? "Далее" : "Итоги";

  const q = MC_QUESTIONS[qIndex];
  progressEl.textContent = `${qIndex + 1} / ${MC_QUESTIONS.length}`;
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mc-option";
    btn.dataset.correct = opt.correct ? "1" : "0";
    btn.dataset.index = String(i);
    btn.innerHTML = `
      <span class="mc-option-row">
        <span class="mc-option-letter">${escapeHtml(opt.letter)}.</span>
        <span class="mc-option-text">${escapeHtml(opt.text)}</span>
      </span>
      <span class="mc-option-feedback" hidden></span>
      <span class="mc-option-status" hidden></span>
    `;
    const feedbackEl = btn.querySelector(".mc-option-feedback");
    const statusEl = btn.querySelector(".mc-option-status");
    feedbackEl.textContent = opt.hint;

    btn.addEventListener("click", () => onOptionClick(btn, opt));
    optionsEl.appendChild(btn);
  });
}

function onOptionClick(btn, opt) {
  if (revealed) return;
  revealed = true;
  const q = MC_QUESTIONS[qIndex];
  const correct = opt.correct;
  if (correct) score += 1;

  q.options.forEach((o, i) => {
    const b = optionsEl.querySelector(`[data-index="${i}"]`);
    const feedback = b.querySelector(".mc-option-feedback");
    const status = b.querySelector(".mc-option-status");
    feedback.hidden = false;

    if (o.correct) {
      b.classList.add("mc-option--correct");
      status.hidden = false;
      status.className = "mc-option-status mc-option-status--ok";
      status.textContent = "✓ Правильный ответ";
    } else if (b === btn) {
      b.classList.add("mc-option--wrong");
      status.hidden = false;
      status.className = "mc-option-status mc-option-status--bad";
      status.textContent = "✕ Не совсем";
    } else {
      b.classList.add("mc-option--neutral");
    }
    b.disabled = true;
  });

  nextBtn.disabled = false;
  explainBtn.disabled = false;
  explainBtn.removeAttribute("title");
}

function toggleExplain() {
  if (!revealed) return;
  const q = MC_QUESTIONS[qIndex];
  explainOpen = !explainOpen;
  if (explainOpen) {
    explainPanel.textContent = q.explain;
    explainPanel.hidden = false;
  } else {
    explainPanel.hidden = true;
  }
}

function goNext() {
  if (!revealed) return;
  if (qIndex < MC_QUESTIONS.length - 1) {
    qIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizScreen.hidden = true;
  resultsScreen.hidden = false;
  const total = MC_QUESTIONS.length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  scoreLine.textContent = `Правильных ответов: ${score} из ${total}`;
  percentLine.textContent = `Результат: ${pct}%`;
  if (pct === 100) {
    resultMsg.textContent = resultMessages.perfect;
  } else if (pct >= 60) {
    resultMsg.textContent = resultMessages.good;
  } else {
    resultMsg.textContent = resultMessages.low;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restart() {
  qIndex = 0;
  score = 0;
  resultsScreen.hidden = true;
  quizScreen.hidden = false;
  renderQuestion();
}

explainBtn.addEventListener("click", toggleExplain);
nextBtn.addEventListener("click", goNext);
retryBtn.addEventListener("click", restart);

async function initTest() {
  try {
    const data = await loadJSON("data/test.json");
    MC_QUESTIONS = data.questions || [];
    if (data.resultMessages) {
      if (data.resultMessages.perfect) resultMessages.perfect = data.resultMessages.perfect;
      if (data.resultMessages.good) resultMessages.good = data.resultMessages.good;
      if (data.resultMessages.low) resultMessages.low = data.resultMessages.low;
    }
  } catch (err) {
    console.error(err);
    MC_QUESTIONS = [
      {
        question: "Не загружен файл data/test.data.js.",
        explain: String(err.message || err),
        options: [
          { letter: "A", text: "Понятно", correct: true, hint: "См. файл data/README.txt" },
          { letter: "B", text: "—", correct: false, hint: "" },
          { letter: "C", text: "—", correct: false, hint: "" },
          { letter: "D", text: "—", correct: false, hint: "" }
        ]
      }
    ];
  }
  renderQuestion();
}

initTest();
