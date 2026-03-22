/**
 * Загрузка данных из data/*.data.js (работает и с диска, и через сервер).
 * Путь вида data/site.json в коде — логическое имя; подгружается соответствующий .data.js.
 */
(function () {
  const registry = {
    "data/site.json": { global: "__DATA_SITE__", script: "data/site.data.js" },
    "data/flashcards.json": { global: "__DATA_FLASHCARDS__", script: "data/flashcards.data.js" },
    "data/test.json": { global: "__DATA_TEST__", script: "data/test.data.js" }
  };

  const scriptPromises = {};

  function normalizePath(path) {
    return String(path).replace(/\\/g, "/").replace(/^\.\//, "");
  }

  function cloneData(obj) {
    try {
      if (typeof structuredClone === "function") return structuredClone(obj);
    } catch (e) {
      /* ignore */
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function loadScriptOnce(src) {
    if (scriptPromises[src]) return scriptPromises[src];
    scriptPromises[src] = new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = src;
      s.charset = "utf-8";
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("Не удалось подключить файл " + src));
      };
      document.head.appendChild(s);
    });
    return scriptPromises[src];
  }

  window.loadJSON = async function loadJSON(path) {
    const norm = normalizePath(path);
    const reg = registry[norm];

    if (reg && window[reg.global] !== undefined) {
      return cloneData(window[reg.global]);
    }

    if (reg) {
      await loadScriptOnce(reg.script);
      if (window[reg.global] !== undefined) {
        return cloneData(window[reg.global]);
      }
    }

    throw new Error(
      "Нет данных для «" +
        norm +
        "». Проверьте, что рядом лежит " +
        (reg ? reg.script : "соответствующий .data.js")
    );
  };
})();
