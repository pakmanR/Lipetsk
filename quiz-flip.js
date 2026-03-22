/**
 * Карточки: вопрос ↔ ответ. Данные — data/flashcards.data.js
 */
let flashcards = [];

const inner = document.getElementById("flashcardInner");
const progressEl = document.getElementById("flashProgress");
const questionEl = document.getElementById("flashQuestion");
const answerEl = document.getElementById("flashAnswer");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const countWrongEl = document.getElementById("countWrong");
const countRightEl = document.getElementById("countRight");
const btnWrong = document.getElementById("btnWrong");
const btnRight = document.getElementById("btnRight");
const menuDots = document.getElementById("menuDots");
const menuPanel = document.getElementById("cardMenuPanel");
const cardsResultRight = document.getElementById("cardsResultRight");
const cardsResultWrong = document.getElementById("cardsResultWrong");
const cardsResultTotal = document.getElementById("cardsResultTotal");
const cardsResultMsg = document.getElementById("cardsResultMsg");

let index = 0;
let flipped = false;
let wrong = 0;
let right = 0;
/** По одной отметке на карточку: null | "wrong" | "right" */
let cardMarks = [];

function initCardMarks() {
  cardMarks = new Array(flashcards.length).fill(null);
  wrong = 0;
  right = 0;
}

function updateCountDisplay() {
  if (countWrongEl) countWrongEl.textContent = String(wrong);
  if (countRightEl) countRightEl.textContent = String(right);
}

function updatePillHighlight() {
  const m = cardMarks[index];
  if (btnWrong) {
    btnWrong.classList.toggle("ctrl-pill--active", m === "wrong");
    btnWrong.setAttribute("aria-pressed", m === "wrong" ? "true" : "false");
  }
  if (btnRight) {
    btnRight.classList.toggle("ctrl-pill--active", m === "right");
    btnRight.setAttribute("aria-pressed", m === "right" ? "true" : "false");
  }
}

/**
 * Одна отметка на карточку: повторный клик по той же кнопке не увеличивает счёт;
 * с другой кнопки — меняется оценка по этой карточке. Сумма ✕+✓ ≤ числу карточек.
 */
function setMarkForCurrentCard(kind) {
  if (!flashcards.length) return;
  const prev = cardMarks[index];
  if (prev === kind) return;

  if (prev === "wrong") wrong -= 1;
  if (prev === "right") right -= 1;

  if (kind === "wrong") wrong += 1;
  if (kind === "right") right += 1;

  cardMarks[index] = kind;
  updateCountDisplay();
  updatePillHighlight();
  syncCardsResultsSummary();
}

function syncCardsResultsSummary() {
  if (!cardsResultRight || !cardsResultWrong) return;
  cardsResultRight.textContent = String(right);
  cardsResultWrong.textContent = String(wrong);
  const n = flashcards.length;
  const sum = right + wrong;
  if (cardsResultTotal) {
    cardsResultTotal.textContent = `Оценено карточек: ${sum} из ${n} (максимум ${n} отметок)`;
  }
  if (cardsResultMsg) {
    if (sum === 0) {
      cardsResultMsg.textContent =
        "После просмотра ответа нажмите ✕ или ✓ — не больше одной отметки на каждую карточку.";
    } else if (right >= wrong) {
      cardsResultMsg.textContent = `Доля «знал»: ${Math.round((right / sum) * 100)}%.` + (sum < n ? ` Осталось отметить: ${n - sum}.` : " Все карточки оценены.");
    } else {
      cardsResultMsg.textContent = `Доля «знал»: ${Math.round((right / sum) * 100)}%.` + (sum < n ? ` Осталось отметить: ${n - sum}.` : " Все карточки оценены.");
    }
  }
}

function setFlipped(next) {
  if (!inner) return;
  flipped = next;
  inner.classList.toggle("is-flipped", flipped);
  inner.setAttribute("aria-pressed", flipped ? "true" : "false");
}

function renderCard() {
  if (!inner || !flashcards.length) return;
  const item = flashcards[index];
  progressEl.textContent = `${index + 1} / ${flashcards.length}`;
  questionEl.textContent = item.question;
  answerEl.textContent = item.answer;
  setFlipped(false);
  updatePillHighlight();
}

function go(delta) {
  const next = index + delta;
  if (next < 0 || next >= flashcards.length) return;
  index = next;
  renderCard();
}

function toggleFlip() {
  setFlipped(!flipped);
}

function wireEvents() {
  if (!inner) return;

  inner.addEventListener("click", (e) => {
    if (e.target.closest("#cardMenuPanel") || e.target.closest("#menuDots")) return;
    toggleFlip();
  });

  document.querySelectorAll(".js-flip").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFlip();
    });
  });

  if (btnPrev) btnPrev.addEventListener("click", () => go(-1));
  if (btnNext) btnNext.addEventListener("click", () => go(1));

  if (btnWrong) {
    btnWrong.addEventListener("click", () => setMarkForCurrentCard("wrong"));
  }
  if (btnRight) {
    btnRight.addEventListener("click", () => setMarkForCurrentCard("right"));
  }

  if (menuDots && menuPanel) {
    menuDots.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPanel.hidden = !menuPanel.hidden;
      menuDots.setAttribute("aria-expanded", menuPanel.hidden ? "false" : "true");
    });

    menuPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      menuPanel.hidden = true;
      menuDots.setAttribute("aria-expanded", "false");
    });

    menuPanel.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menuPanel.hidden = true;
        menuDots.setAttribute("aria-expanded", "false");
        if (btn.dataset.action === "reset") {
          initCardMarks();
          updateCountDisplay();
          updatePillHighlight();
          index = 0;
          renderCard();
          syncCardsResultsSummary();
        }
      });
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
    if (e.key === " " || e.key === "Enter") {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      toggleFlip();
    }
  });
}

async function initFlashcards() {
  try {
    const data = await loadJSON("data/flashcards.json");
    flashcards = Array.isArray(data) ? data : data.flashcards || [];
  } catch (err) {
    console.error(err);
    flashcards = [
      {
        question: "Не загружены данные карточек",
        answer: "Проверьте файл data/flashcards.data.js (см. data/README.txt)."
      }
    ];
  }
  initCardMarks();
  updateCountDisplay();
  wireEvents();
  renderCard();
  syncCardsResultsSummary();
}

initFlashcards();
