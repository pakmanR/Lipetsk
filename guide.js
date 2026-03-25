/**
 * Собирает главную страницу из data/site.data.js
 */
function buildPhotoBlock(item) {
  if (item.placeholder) {
    const ph = document.createElement("div");
    ph.className = "card-placeholder";
    ph.setAttribute("aria-hidden", "true");
    return ph;
  }
  const imgs = item.images || [];
  if (item.layout === "grid3") {
    const wrap = document.createElement("div");
    wrap.className = "card-photo-grid photo-gallery";
    if (item.rowsLayout) wrap.classList.add("card-photo-grid--rows");
    imgs.forEach((im) => {
      const img = document.createElement("img");
      img.src = im.src;
      img.alt = im.alt || "";
      img.loading = "lazy";
      wrap.appendChild(img);
    });
    return wrap;
  }
  if (item.layout === "duo") {
    const wrap = document.createElement("div");
    wrap.className = "card-photo-duo photo-gallery";
    imgs.forEach((im) => {
      const img = document.createElement("img");
      img.src = im.src;
      img.alt = im.alt || "";
      img.loading = "lazy";
      wrap.appendChild(img);
    });
    return wrap;
  }
  if (item.layout === "single" && imgs[0]) {
    const wrap = document.createElement("div");
    wrap.className = "photo-gallery photo-gallery--single";
    const img = document.createElement("img");
    img.className = "card-photo-single";
    img.src = imgs[0].src;
    img.alt = imgs[0].alt || "";
    img.loading = "lazy";
    wrap.appendChild(img);
    return wrap;
  }
  const ph = document.createElement("div");
  ph.className = "card-placeholder";
  ph.setAttribute("aria-hidden", "true");
  return ph;
}

function buildCardBody(item) {
  const body = document.createElement("div");
  body.className = "card-body";
  const h3 = document.createElement("h3");
  h3.textContent = item.title;
  body.appendChild(h3);
  (item.paragraphs || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    body.appendChild(p);
  });
  if (item.address) {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Адрес: ";
    p.appendChild(strong);
    p.appendChild(document.createTextNode(item.address));
    body.appendChild(p);
  }
  return body;
}

function buildMapBlock(map) {
  if (!map || !map.scriptSrc) return null;
  const wrap = document.createElement("div");
  wrap.className = "museum-map";
  const h4 = document.createElement("h4");
  h4.className = "museum-map__title";
  h4.textContent = map.title || "Карта";
  const embed = document.createElement("div");
  embed.className = "museum-map__embed";
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.charset = "utf-8";
  script.async = true;
  script.src = map.scriptSrc;
  embed.appendChild(script);
  wrap.appendChild(h4);
  wrap.appendChild(embed);
  return wrap;
}

function buildPlaceArticle(item) {
  const art = document.createElement("article");
  art.className = "card card-with-photo";
  art.appendChild(buildPhotoBlock(item));
  art.appendChild(buildCardBody(item));
  const mapEl = buildMapBlock(item.map);
  if (mapEl) art.appendChild(mapEl);
  return art;
}

function renderPlacesSection(config, accent) {
  const section = document.createElement("section");
  section.className = accent ? "section section-accent" : "section container";
  if (config.sectionId) section.id = config.sectionId;

  const inner = document.createElement("div");
  if (accent) inner.className = "container";

  const h2 = document.createElement("h2");
  h2.textContent = config.title;

  const grid = document.createElement("div");
  grid.className = `grid ${config.gridClass || "cards-2"}`;

  (config.items || []).forEach((item) => {
    grid.appendChild(buildPlaceArticle(item));
  });

  if (accent) {
    inner.appendChild(h2);
    inner.appendChild(grid);
    section.appendChild(inner);
  } else {
    section.appendChild(h2);
    section.appendChild(grid);
  }
  return section;
}

async function renderGuide() {
  const heroEl = document.getElementById("guideHero");
  const mainEl = document.getElementById("guideMain");

  try {
    const data = await loadJSON("data/site.json");

    if (data.meta) {
      document.title = data.meta.title || document.title;
      const m = document.querySelector('meta[name="description"]');
      if (m && data.meta.description) m.setAttribute("content", data.meta.description);
    }

    /* Hero */
    heroEl.innerHTML = "";
    const h = data.hero || {};
    if (h.eyebrow) {
      const p = document.createElement("p");
      p.className = "eyebrow";
      p.textContent = h.eyebrow;
      heroEl.appendChild(p);
    }
    if (h.title) {
      const t = document.createElement("h1");
      t.textContent = h.title;
      heroEl.appendChild(t);
    }
    if (h.lead) {
      const lead = document.createElement("p");
      lead.className = "lead";
      lead.textContent = h.lead;
      heroEl.appendChild(lead);
    }
    if (h.actions && h.actions.length) {
      const actions = document.createElement("div");
      actions.className = "hero-actions";
      h.actions.forEach((a) => {
        const link = document.createElement("a");
        link.href = a.href;
        link.className = a.class || "btn";
        link.textContent = a.text;
        actions.appendChild(link);
      });
      heroEl.appendChild(actions);
    }

    /* Main */
    mainEl.innerHTML = "";
    mainEl.className = "";

    const wv = data.whyVisit;
    if (wv) {
      const sec = document.createElement("section");
      sec.className = "section container";
      const h2 = document.createElement("h2");
      h2.textContent = wv.title;
      sec.appendChild(h2);
      const grid = document.createElement("div");
      grid.className = "grid cards-2";
      (wv.cards || []).forEach((c) => {
        const art = document.createElement("article");
        art.className = "card";
        art.innerHTML = `<h3></h3><p></p>`;
        art.querySelector("h3").textContent = c.title;
        art.querySelector("p").textContent = c.text;
        grid.appendChild(art);
      });
      sec.appendChild(grid);
      mainEl.appendChild(sec);
    }

    const sv = data.souvenirs;
    if (sv) {
      const sec = document.createElement("section");
      sec.className = "section container souvenirs";
      const h2 = document.createElement("h2");
      h2.textContent = sv.title;
      sec.appendChild(h2);
      const ul = document.createElement("ul");
      (sv.items || []).forEach((it) => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = it.label;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" " + it.text));
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      mainEl.appendChild(sec);
    }

    const hist = data.history;
    if (hist) {
      const sec = document.createElement("section");
      sec.className = "section section-accent";
      sec.id = "history";
      const inner = document.createElement("div");
      inner.className = "container";
      const h2 = document.createElement("h2");
      h2.textContent = hist.title;
      inner.appendChild(h2);
      const timeline = document.createElement("div");
      timeline.className = "timeline";
      (hist.timeline || []).forEach((t) => {
        const art = document.createElement("article");
        art.className = "timeline-item";
        art.innerHTML = `<h3></h3><p></p>`;
        art.querySelector("h3").textContent = t.title;
        art.querySelector("p").textContent = t.text;
        timeline.appendChild(art);
      });
      inner.appendChild(timeline);

      const ht = document.createElement("h3");
      ht.className = "table-title";
      ht.textContent = hist.tableTitle || "";
      inner.appendChild(ht);

      const tw = document.createElement("div");
      tw.className = "table-wrap";
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      const headers = hist.tableHeaders || ["Год", "Событие", "Значение"];
      headers.forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      (hist.tableRows || []).forEach((row) => {
        const tr = document.createElement("tr");
        ["year", "event", "meaning"].forEach((key) => {
          const td = document.createElement("td");
          td.textContent = row[key] || "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tw.appendChild(table);
      inner.appendChild(tw);
      sec.appendChild(inner);
      mainEl.appendChild(sec);
    }

    if (data.sights) mainEl.appendChild(renderPlacesSection(data.sights, false));
    if (data.parks) mainEl.appendChild(renderPlacesSection(data.parks, true));
    if (data.culture) mainEl.appendChild(renderPlacesSection(data.culture, false));
    if (data.pravoslav) mainEl.appendChild(renderPlacesSection(data.pravoslav, false));

    const cta = data.cta;
    if (cta) {
      const sec = document.createElement("section");
      sec.className = "section section-cta container";
      const h2 = document.createElement("h2");
      h2.textContent = cta.title;
      sec.appendChild(h2);
      const p = document.createElement("p");
      p.className = "cta-text";
      p.textContent = cta.text;
      sec.appendChild(p);
      const actions = document.createElement("div");
      actions.className = "hero-actions hero-actions--center";
      (cta.links || []).forEach((l) => {
        const a = document.createElement("a");
        a.href = l.href;
        a.className = l.class || "btn";
        a.textContent = l.text;
        actions.appendChild(a);
      });
      sec.appendChild(actions);
      mainEl.appendChild(sec);
    }

    const foot = data.footer;
    if (foot && foot.text) {
      const footerP = document.querySelector("footer.footer .container p");
      if (footerP) footerP.textContent = foot.text;
    }

    if (typeof window.preparePhotoGalleries === "function") {
      window.preparePhotoGalleries();
    }

    document.querySelectorAll(".guide-loading").forEach((el) => el.remove());
  } catch (err) {
    console.error(err);
    mainEl.innerHTML = "";
    const box = document.createElement("div");
    box.className = "guide-error container";
    box.innerHTML =
      "<h2>Не удалось загрузить контент</h2>" +
      "<p>Проверьте, что в папке <code>data</code> есть файл <code>site.data.js</code> и в нём нет ошибок синтаксиса.</p>" +
      "<p class=\"guide-error-detail\"></p>";
    box.querySelector(".guide-error-detail").textContent = String(err.message || err);
    mainEl.appendChild(box);
    heroEl.innerHTML =
      '<p class="eyebrow">Ошибка</p><h1>Липецк</h1><p class="lead">Загрузите страницу через локальный сервер, чтобы подтянуть тексты из папки <code>data</code>.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderGuide);
