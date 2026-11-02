(() => {
  "use strict";

  const SAVE_KEY = "lyublyu-tebya-save-v1";
  const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
  const upgrades = [
    {
      id: "touch",
      icon: "💗",
      name: "Нежное касание",
      description: "Мишка учится дарить больше любви одним прикосновением.",
      effect: level => `+${level} к сердечкам за нажатие`,
      baseCost: 25,
      growth: 1.72,
      tint: "rgba(243, 119, 153, .15)",
    },
    {
      id: "hugs",
      icon: "🧸",
      name: "Обнимашки 24/7",
      description: "Даже когда ты занята, мишка продолжает посылать объятия.",
      effect: level => `+${level} сердечко${level === 1 ? "" : "а"} каждую секунду`,
      baseCost: 60,
      growth: 1.82,
      tint: "rgba(239, 181, 110, .13)",
    },
    {
      id: "power",
      icon: "✨",
      name: "Сила любви",
      description: "Умножает нажатия. Потому что твоей любви очень много.",
      effect: level => `x${Math.pow(2, level)} сердечек за нажатие`,
      baseCost: 160,
      growth: 2.65,
      tint: "rgba(129, 169, 240, .15)",
    },
  ];

  const emptySave = () => ({ hearts: 0, earned: 0, spent: 0, taps: 0, upgrades: { touch: 0, hugs: 0, power: 0 }, lastSavedAt: Date.now() });
  let state = loadSave();
  let activeView = "game";
  let saveTimer = 0;
  let toastTimer = 0;

  const $ = id => document.getElementById(id);
  const balanceEl = $("balance");
  const tapButton = $("tapButton");
  const welcome = $("welcome");
  const heartParticles = $("heartParticles");

  function loadSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || typeof saved !== "object") return emptySave();
      const base = emptySave();
      const merged = { ...base, ...saved, upgrades: { ...base.upgrades, ...(saved.upgrades || {}) } };
      for (const key of ["hearts", "earned", "spent", "taps"]) merged[key] = Math.max(0, Number(merged[key]) || 0);
      for (const key of Object.keys(merged.upgrades)) merged.upgrades[key] = Math.max(0, Math.floor(Number(merged.upgrades[key]) || 0));
      const now = Date.now();
      const last = Number(merged.lastSavedAt) || now;
      const offlineSeconds = Math.max(0, Math.min(MAX_OFFLINE_SECONDS, (now - last) / 1000));
      const awayHearts = Math.floor(offlineSeconds * merged.upgrades.hugs);
      if (awayHearts > 0) {
        merged.hearts += awayHearts;
        merged.earned += awayHearts;
        merged.offlineHearts = awayHearts;
      }
      merged.lastSavedAt = now;
      return merged;
    } catch {
      return emptySave();
    }
  }

  function persist() {
    state.lastSavedAt = Date.now();
    try {
      const { offlineHearts, ...saveData } = state;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch {
      showToast("Не удалось сохранить прогресс на этом устройстве");
    }
  }

  function formatNumber(value) {
    return Math.floor(value).toLocaleString("ru-RU");
  }

  function heartsPerTap() {
    return (1 + state.upgrades.touch) * Math.pow(2, state.upgrades.power);
  }

  function heartsPerSecond() {
    return state.upgrades.hugs;
  }

  function costFor(item) {
    return Math.floor(item.baseCost * Math.pow(item.growth, state.upgrades[item.id]));
  }

  function levelFor(earned) {
    const levels = [
      { name: "Маленькое чудо", at: 0, next: 25 },
      { name: "Сладкая парочка", at: 25, next: 100 },
      { name: "Зайки навсегда", at: 100, next: 300 },
      { name: "Самая крепкая любовь", at: 300, next: 800 },
      { name: "Любовь без границ", at: 800, next: Infinity },
    ];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (earned >= levels[i].at) return levels[i];
    }
    return levels[0];
  }

  function render() {
    balanceEl.textContent = formatNumber(state.hearts);
    $("tapValue").textContent = `+${formatNumber(heartsPerTap())}`;
    $("perSecond").textContent = formatNumber(heartsPerSecond());
    $("tapCount").textContent = formatNumber(state.taps);
    const level = levelFor(state.earned);
    const progress = level.next === Infinity ? 100 : Math.min(100, ((state.earned - level.at) / (level.next - level.at)) * 100);
    $("levelName").textContent = level.name;
    $("levelProgress").style.width = `${progress}%`;
    $("levelProgressText").textContent = level.next === Infinity ? "максимум любви" : `${formatNumber(state.earned - level.at)} / ${formatNumber(level.next - level.at)}`;

    const canAffordAnything = upgrades.some(item => state.hearts >= costFor(item));
    $("shopDot").hidden = !(canAffordAnything && activeView !== "shop");
    $("gameView").hidden = activeView !== "game";
    $("shopView").hidden = activeView !== "shop";
    $("gameTab").classList.toggle("active", activeView === "game");
    $("shopTab").classList.toggle("active", activeView === "shop");
    if (activeView === "game") $("gameTab").setAttribute("aria-current", "page");
    else $("gameTab").removeAttribute("aria-current");
    if (activeView === "shop") $("shopTab").setAttribute("aria-current", "page");
    else $("shopTab").removeAttribute("aria-current");
    renderShop();
  }

  function renderShop() {
    $("shopList").innerHTML = upgrades.map(item => {
      const level = state.upgrades[item.id];
      const cost = costFor(item);
      const canBuy = state.hearts >= cost;
      return `<article class="upgrade-card${canBuy ? " can-buy" : ""}" style="--upgrade-tint:${item.tint}">
        <div class="upgrade-art" aria-hidden="true">${item.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${item.name}<span class="upgrade-level">ур. ${level}</span></div>
          <div class="upgrade-description">${item.description}</div>
          <div class="upgrade-effect">${item.effect(level)}</div>
        </div>
        <button class="buy-button" type="button" data-upgrade="${item.id}" ${canBuy ? "" : "disabled"} aria-label="Купить ${item.name} за ${formatNumber(cost)} сердечек"><span>♥</span>${formatNumber(cost)}</button>
      </article>`;
    }).join("");
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
  }

  function spawnHearts(event) {
    const bounds = heartParticles.getBoundingClientRect();
    const x = event && typeof event.clientX === "number" ? event.clientX - bounds.left : bounds.width * .5;
    const y = event && typeof event.clientY === "number" ? event.clientY - bounds.top : bounds.height * .55;
    const count = Math.min(5, Math.max(2, Math.ceil(Math.log2(heartsPerTap() + 1))));
    const glyphs = ["♥", "❤", "♡", "✦"];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = `particle${i === count - 1 ? " sparkle" : ""}`;
      particle.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      particle.style.setProperty("--x", `${Math.max(10, Math.min(bounds.width - 10, x + (Math.random() - .5) * 34))}px`);
      particle.style.setProperty("--y", `${Math.max(26, y + (Math.random() - .5) * 18)}px`);
      particle.style.setProperty("--drift", `${(Math.random() - .5) * 70}px`);
      particle.style.setProperty("--tilt", `${Math.round((Math.random() - .5) * 50)}deg`);
      particle.style.setProperty("--size", `${15 + Math.random() * 13}px`);
      particle.style.setProperty("--duration", `${.82 + Math.random() * .3}s`);
      particle.style.setProperty("--heart-color", ["#ff6f89", "#ff9caa", "#ffd093"][Math.floor(Math.random() * 3)]);
      heartParticles.appendChild(particle);
      window.setTimeout(() => particle.remove(), 1250);
    }
  }

  function tap(event) {
    const amount = heartsPerTap();
    state.hearts += amount;
    state.earned += amount;
    state.taps += 1;
    tapButton.classList.remove("punch");
    void tapButton.offsetWidth;
    tapButton.classList.add("punch");
    window.setTimeout(() => tapButton.classList.remove("punch"), 360);
    spawnHearts(event);
    render();
    persist();
  }

  function buyUpgrade(id) {
    const item = upgrades.find(upgrade => upgrade.id === id);
    if (!item) return;
    const cost = costFor(item);
    if (state.hearts < cost) return;
    state.hearts -= cost;
    state.spent += cost;
    state.upgrades[item.id] += 1;
    render();
    persist();
    showToast(`Улучшение «${item.name}» куплено ♥`);
  }

  function continueFromWelcome() {
    welcome.hidden = true;
    activeView = "game";
    render();
  }

  $("gameTab").addEventListener("click", () => { activeView = "game"; render(); });
  $("shopTab").addEventListener("click", () => { activeView = "shop"; render(); });
  tapButton.addEventListener("click", tap);
  $("shopList").addEventListener("click", event => {
    const button = event.target.closest("[data-upgrade]");
    if (button) buyUpgrade(button.dataset.upgrade);
  });
  $("okButton").addEventListener("click", continueFromWelcome);
  $("loveButton").addEventListener("click", () => {
    continueFromWelcome();
    showToast("Я тоже тебя очень люблю ♥");
    spawnHearts();
  });

  render();
  welcome.hidden = false;
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  if (state.offlineHearts > 0) showToast(`Пока тебя не было, мишка собрал ${formatNumber(state.offlineHearts)} ♥`);
  window.setInterval(() => {
    if (heartsPerSecond() > 0) {
      state.hearts += heartsPerSecond();
      state.earned += heartsPerSecond();
      render();
    }
  }, 1000);
  window.setInterval(persist, 5000);
  window.addEventListener("pagehide", persist);
})();
