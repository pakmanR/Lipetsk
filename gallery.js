/**
 * Галерея: клик по фото в .photo-gallery — модальное окно.
 * Работает и для блоков, добавленных динамически (делегирование событий).
 */
(function () {
  const lightbox = document.getElementById("photoLightbox");
  if (!lightbox) return;

  const backdrop = lightbox.querySelector(".photo-lightbox__backdrop");
  const imgEl = lightbox.querySelector(".photo-lightbox__img");
  const btnClose = lightbox.querySelector(".photo-lightbox__close");
  const btnPrev = lightbox.querySelector(".photo-lightbox__prev");
  const btnNext = lightbox.querySelector(".photo-lightbox__next");
  const counterEl = lightbox.querySelector(".photo-lightbox__counter");
  const titleEl = lightbox.querySelector(".photo-lightbox__title");

  let items = [];
  let index = 0;
  let lastFocus = null;

  function getTitleFromGallery(gallery) {
    const card = gallery.closest(".card-with-photo");
    if (!card) return "";
    const h = card.querySelector(".card-body h3");
    return h ? h.textContent.trim() : "";
  }

  function updateView() {
    if (!items.length) return;
    const cur = items[index];
    imgEl.src = cur.src;
    imgEl.alt = cur.alt || "";
    const n = items.length;
    counterEl.textContent = n > 1 ? `${index + 1} / ${n}` : "";
    counterEl.hidden = n <= 1;
    btnPrev.hidden = n <= 1;
    btnNext.hidden = n <= 1;
  }

  function open(gallery, startIdx) {
    const imgs = Array.from(gallery.querySelectorAll("img"));
    if (!imgs.length) return;
    items = imgs.map((im) => ({ src: im.getAttribute("src"), alt: im.getAttribute("alt") || "" }));
    index = Math.min(Math.max(0, startIdx), items.length - 1);
    lastFocus = document.activeElement;
    const t = getTitleFromGallery(gallery);
    titleEl.textContent = t;
    titleEl.hidden = !t;
    lightbox.hidden = false;
    lightbox.setAttribute("tabindex", "-1");
    document.body.classList.add("photo-lightbox-open");
    updateView();
    lightbox.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove("photo-lightbox-open");
    imgEl.removeAttribute("src");
    items = [];
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function step(delta) {
    const n = items.length;
    if (n <= 1) return;
    index = (index + delta + n) % n;
    updateView();
  }

  function preparePhotoGalleries() {
    document.querySelectorAll(".photo-gallery").forEach((gallery) => {
      const imgs = gallery.querySelectorAll("img");
      const count = imgs.length;
      gallery.classList.toggle("photo-gallery--multi", count > 1);
      if (count > 1) {
        gallery.setAttribute("title", "Нажмите на фото, чтобы открыть галерею");
      } else {
        gallery.removeAttribute("title");
      }
      imgs.forEach((im) => {
        im.setAttribute("tabindex", "0");
        im.setAttribute("role", "button");
      });
    });
  }

  document.body.addEventListener("click", (e) => {
    const img = e.target.closest && e.target.closest(".photo-gallery img");
    if (!img || !lightbox) return;
    e.preventDefault();
    const gallery = img.closest(".photo-gallery");
    const imgs = Array.from(gallery.querySelectorAll("img"));
    const i = imgs.indexOf(img);
    if (i >= 0) open(gallery, i);
  });

  document.body.addEventListener("keydown", (e) => {
    const img = e.target;
    if (!img || !img.matches || !img.matches(".photo-gallery img")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const gallery = img.closest(".photo-gallery");
      const imgs = Array.from(gallery.querySelectorAll("img"));
      const i = imgs.indexOf(img);
      if (i >= 0) open(gallery, i);
    }
  });

  btnClose.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  btnPrev.addEventListener("click", () => step(-1));
  btnNext.addEventListener("click", () => step(1));

  lightbox.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  });

  window.preparePhotoGalleries = preparePhotoGalleries;
  preparePhotoGalleries();
})();
