(() => {
  "use strict";

  const SAVE_KEY = "lyublyu-tebya-save-v1";
  const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
  const OFFLINE_LIMIT_MS = 10 * 60 * 1000;
  const MAX_PARTICLES = 40;

  const bears = [
    { id: "classic", name: "Мягкий мишка", cost: 0, image: "assets/teddy-hd.svg", icon: "♥", tagline: "Тёплые объятия и сердечки только для тебя.", description: "Добрый друг для уютных зимних вечеров.", base: 1, particles: ["♥"] },
    { id: "christmas", name: "Новогодний мишка", cost: 100, image: "assets/bears/christmas.webp", icon: "❄️", tagline: "Каждый тап — маленький снегопад!", description: "Встречает праздник и рассыпает снежинки.", base: 1, particles: ["❄️"] },
    { id: "builder", name: "Строительный мишка", cost: 200, image: "assets/bears/builder.webp", icon: "🔨", tagline: "Строит башню из твоих сердечек.", description: "Касается молоточком — звенят объятия.", base: 1, particles: ["🔨"] },
    { id: "football", name: "Футбольный мишка", cost: 500, image: "assets/bears/football.webp", icon: "⚽", tagline: "Забивает гол прямо в сердечко!", description: "У каждого нажатия свой победный мяч.", base: 1, particles: ["⚽"] },
    { id: "halloween", name: "Хэллоуинский мишка", cost: 600, image: "assets/bears/halloween.webp", icon: "🦇", tagline: "Летучие мышки и в полтора раза больше любви.", description: "Праздничная магия складывается со всеми усилениями.", base: 1, multiplier: 1.5, particles: ["🦇"] },
    { id: "love", name: "Love U Mode", cost: 1000, image: "assets/bears/love-u.webp", icon: "💘", tagline: "Любовный режим включён на полную!", description: "Тройная любовь поверх остальных усилений.", base: 1, multiplier: 3, particles: ["💘"] },
    { id: "luck", name: "Luck ground мишка", cost: 1500, image: "assets/bears/luck-ground.webp", icon: "🍀", tagline: "Какой подарок выпадет в этот раз?", description: "5% — 100, 30% — 10, 65% — 2 сердечка.", randomReward: true, multiplier: 1, particles: ["🍀", "✨"] },
    { id: "polar", name: "Polar мишка", cost: 2000, image: "assets/bears/polar.webp", icon: "❄️", tagline: "Самый уютный холод севера.", description: "Дарит 30 сердечек за тап, плюс твои усиления.", base: 30, particles: ["❄️", "🩵"] },
    { id: "flowers", name: "Мишка с цветами", cost: 3000, image: "assets/bears/flowers.webp", icon: "💐", tagline: "Цветы, сердечки и немного волшебства.", description: "100 сердечек и цветы. Раз в 10 минут — шанс 10% получить x3 на 10 секунд.", base: 100, flowers: true, particles: ["🌸", "💐"] },
  ];

  const upgrades = [
    { id: "touch", icon: "💗", name: "Нежное касание", description: "Мишка учится дарить больше любви одним прикосновением.", effect: level => `+${level} к сердечкам за нажатие`, baseCost: 25, growth: 1.72, tint: "rgba(243, 119, 153, .15)" },
    { id: "hugs", icon: "🧸", name: "Обнимашки 24/7", description: "Даже когда ты занята, мишка продолжает посылать объятия.", effect: level => `+${level} сердечко${level === 1 ? "" : "а"} каждую секунду`, baseCost: 60, growth: 1.82, tint: "rgba(239, 181, 110, .13)" },
    { id: "power", icon: "✨", name: "Сила любви", description: "Умножает нажатия. Потому что твоей любви очень много.", effect: level => `x${Math.pow(2, level)} сердечек за нажатие`, baseCost: 160, growth: 2.65, tint: "rgba(129, 169, 240, .15)" },
  ];

  const quotes = [
    "Каждая снежинка от мишки — моё «люблю» ♥",
    "Ты делаешь даже обычный день особенным ✨",
    "Мишка шепчет: ты — его любимый человек 🧸",
    "С тобой уютнее, чем под самым тёплым пледом.",
    "Посылаю тебе целую охапку медвежьих объятий!",
    "Твоя улыбка — мой любимый праздник 🎄",
    "Пусть это сердечко напомнит, как ты мне дорога.",
    "Снег, мишки и ты — мой идеальный зимний вечер ❄️",
    "Ты — самое тёплое чудо этой зимы 💗",
    "На всякий случай: я очень-очень тебя люблю!",
  ];
  const welcomeMessages = [
    "Ты у меня самая лучшая. Я очень тебя люблю — эту зимнюю игру я сделал для тебя ❤️",
    "Пусть каждый зимний день будет чуточку теплее. Эта игра — маленький подарок для тебя ❤️",
    "Здесь мишки, снег и много сердечек. Но ни одно сердечко не любит тебя так сильно, как я ❤️",
    "Ты — моё любимое новогоднее чудо. Нажимай на мишку и собирай его объятия ❤️",
    "Пусть эта игра напоминает, как сильно ты меня радуешь. Люблю тебя! ❤️",
  ];

  const emptySave = () => ({
    hearts: 0, earned: 0, spent: 0, taps: 0,
    upgrades: { touch: 0, hugs: 0, power: 0 },
    unlockedBears: { classic: true }, activeBear: "classic",
    flowerNextTryAt: 0, flowerBoostUntil: 0, lastSavedAt: Date.now(),
  });

  function loadSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || typeof saved !== "object") return emptySave();
      const base = emptySave();
      const merged = { ...base, ...saved, upgrades: { ...base.upgrades, ...(saved.upgrades || {}) }, unlockedBears: { ...base.unlockedBears, ...(saved.unlockedBears || {}) } };
      for (const key of ["hearts", "earned", "spent", "taps"]) merged[key] = Math.max(0, Number(merged[key]) || 0);
      for (const key of Object.keys(merged.upgrades)) merged.upgrades[key] = Math.max(0, Math.floor(Number(merged.upgrades[key]) || 0));
      for (const key of Object.keys(merged.unlockedBears)) merged.unlockedBears[key] = Boolean(merged.unlockedBears[key]);
      if (!bears.some(bear => bear.id === merged.activeBear && merged.unlockedBears[bear.id])) merged.activeBear = "classic";
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

  const state = loadSave();
  let activeView = "game";
  let shopCategory = "bears";
  let saveTimer = 0;
  let toastTimer = 0;
  let hudFrame = 0;
  let activeParticles = 0;
  let renderedBearId = "";
  let lastQuoteIndex = -1;

  const $ = id => document.getElementById(id);
  const balanceEl = $("balance");
  const tapButton = $("tapButton");
  const teddy = $("teddy");
  const particlesLayer = $("heartParticles");
  const welcome = $("welcome");
  const halloweenWelcome = $("halloweenWelcome");
  const resetConfirm = $("resetConfirm");

  const punchAnimation = teddy.animate([
    { transform: "scale(1, 1) rotate(0deg)" },
    { transform: "scale(1.055, .9) rotate(-1.5deg)", offset: .34 },
    { transform: "scale(.98, 1.035) rotate(1deg)", offset: .68 },
    { transform: "scale(1, 1) rotate(0deg)" },
  ], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "none" });
  punchAnimation.pause();
  punchAnimation.currentTime = 260;

  function currentBear() {
    return bears.find(bear => bear.id === state.activeBear) || bears[0];
  }

  function formatNumber(value) {
    const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
    return rounded.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  }

  function setText(id, value) {
    const element = $(id);
    if (element.textContent !== value) element.textContent = value;
  }

  function clickBoost() {
    return (1 + state.upgrades.touch) * Math.pow(2, state.upgrades.power);
  }

  function heartsPerSecond() {
    return state.upgrades.hugs;
  }

  function costFor(item) {
    return Math.floor(item.baseCost * Math.pow(item.growth, state.upgrades[item.id]));
  }

  function expectedBearPayout(bear) {
    return bear.randomReward ? 9.8 : bear.base;
  }

  function currentTapMultiplier(now = Date.now()) {
    const bear = currentBear();
    return (bear.multiplier || 1) * clickBoost() * (state.flowerBoostUntil > now ? 3 : 1);
  }

  function levelFor(earned) {
    const levels = [
      { name: "Маленькое чудо", at: 0, next: 25 },
      { name: "Сладкая парочка", at: 25, next: 100 },
      { name: "Зайки навсегда", at: 100, next: 300 },
      { name: "Самая крепкая любовь", at: 300, next: 800 },
      { name: "Любовь без границ", at: 800, next: Infinity },
    ];
    for (let i = levels.length - 1; i >= 0; i--) if (earned >= levels[i].at) return levels[i];
    return levels[0];
  }

  function updateShopBadge() {
    const canBuyBoost = upgrades.some(item => state.hearts >= costFor(item));
    const canBuyBear = bears.some(item => item.cost > 0 && !state.unlockedBears[item.id] && state.hearts >= item.cost);
    $("shopDot").hidden = !((canBuyBoost || canBuyBear) && activeView !== "shop");
  }

  function refreshShopAffordability() {
    for (const button of $("boostList").querySelectorAll("[data-upgrade]")) {
      const item = upgrades.find(upgrade => upgrade.id === button.dataset.upgrade);
      if (!item) continue;
      const canBuy = state.hearts >= costFor(item);
      button.disabled = !canBuy;
      button.closest(".upgrade-card")?.classList.toggle("can-buy", canBuy);
    }
    for (const button of $("bearList").querySelectorAll("[data-bear]")) {
      const item = bears.find(bear => bear.id === button.dataset.bear);
      if (!item) continue;
      const owned = Boolean(state.unlockedBears[item.id]);
      const equipped = state.activeBear === item.id;
      const canBuy = state.hearts >= item.cost;
      const card = button.closest(".bear-upgrade-card");
      card?.classList.toggle("can-buy", !owned && canBuy);
      card?.classList.toggle("equipped", owned && equipped);
      button.classList.toggle("not-affordable", !owned && !canBuy);
      button.disabled = owned ? equipped : !canBuy;
      button.textContent = owned ? (equipped ? "Выбран" : "Надеть") : `♥ ${formatNumber(item.cost)}`;
      button.setAttribute("aria-label", owned ? `${equipped ? "Выбран" : "Надеть"}: ${item.name}` : `Купить ${item.name} за ${formatNumber(item.cost)} сердечек`);
    }
  }

  function updateHUD() {
    const bear = currentBear();
    const now = Date.now();
    setText("balance", formatNumber(state.hearts));
    setText("tapValue", `${bear.randomReward ? "~" : "+"}${formatNumber(expectedBearPayout(bear) * currentTapMultiplier(now))}`);
    setText("perSecond", formatNumber(heartsPerSecond()));
    setText("tapCount", formatNumber(state.taps));
    if (renderedBearId !== bear.id) {
      teddy.src = bear.image;
      teddy.alt = bear.name;
      setText("bearName", bear.name);
      $("tapHint").innerHTML = `нажми на мишку <span>${bear.icon}</span>`;
      renderedBearId = bear.id;
    }
    const tagline = state.flowerBoostUntil > now ? `${bear.tagline} ✨ x3 ещё ${Math.ceil((state.flowerBoostUntil - now) / 1000)} сек.` : bear.tagline;
    setText("bearTagline", tagline);
    const quoteIndex = Math.floor(state.taps / 6) % quotes.length;
    if (lastQuoteIndex !== quoteIndex) {
      setText("loveQuote", quotes[quoteIndex]);
      lastQuoteIndex = quoteIndex;
    }
    const level = levelFor(state.earned);
    const progress = level.next === Infinity ? 100 : Math.min(100, ((state.earned - level.at) / (level.next - level.at)) * 100);
    $("levelName").textContent = level.name;
    $("levelProgress").style.width = `${progress}%`;
    $("levelProgressText").textContent = level.next === Infinity ? "максимум любви" : `${formatNumber(state.earned - level.at)} / ${formatNumber(level.next - level.at)}`;
    if (activeView === "shop") refreshShopAffordability();
    updateShopBadge();
  }

  function queueHUDUpdate() {
    if (hudFrame) return;
    hudFrame = requestAnimationFrame(() => {
      hudFrame = 0;
      updateHUD();
    });
  }

  function renderShop() {
    $("boostList").innerHTML = upgrades.map(item => {
      const level = state.upgrades[item.id];
      const cost = costFor(item);
      const canBuy = state.hearts >= cost;
      return `<article class="upgrade-card${canBuy ? " can-buy" : ""}" style="--upgrade-tint:${item.tint}">
        <div class="upgrade-art" aria-hidden="true">${item.icon}</div>
        <div class="upgrade-info"><div class="upgrade-name">${item.name}<span class="upgrade-level">ур. ${level}</span></div>
          <div class="upgrade-description">${item.description}</div><div class="upgrade-effect">${item.effect(level)}</div></div>
        <button class="buy-button" type="button" data-upgrade="${item.id}" ${canBuy ? "" : "disabled"} aria-label="Купить ${item.name} за ${formatNumber(cost)} сердечек"><span>♥</span>${formatNumber(cost)}</button>
      </article>`;
    }).join("");

    $("bearList").innerHTML = bears.map(bear => {
      const owned = Boolean(state.unlockedBears[bear.id]);
      const equipped = state.activeBear === bear.id;
      const canBuy = state.hearts >= bear.cost;
      const action = owned ? (equipped ? "Выбран" : "Надеть") : `♥ ${formatNumber(bear.cost)}`;
      const tint = bear.id === "halloween" ? "rgba(164, 132, 213, .18)" : bear.id === "christmas" ? "rgba(97, 174, 224, .16)" : "rgba(240,120,151,.12)";
      return `<article class="bear-upgrade-card${canBuy && !owned ? " can-buy" : ""}${equipped ? " equipped" : ""}" style="--upgrade-tint:${tint}">
        <div class="bear-card-art"><img src="${bear.image}" alt="" loading="lazy" draggable="false"></div>
        <div class="bear-card-info"><div class="bear-card-name">${bear.name}${equipped ? '<span class="bear-card-level">на мишке</span>' : ""}</div>
          <div class="bear-card-description">${bear.description}</div><div class="bear-card-effect">${bear.cost === 0 ? "твой первый друг" : owned ? "уже в твоей коллекции" : `стоимость: ${formatNumber(bear.cost)} ♥`}</div></div>
        <button class="bear-buy-button${!canBuy && !owned ? " not-affordable" : ""}" type="button" data-bear="${bear.id}" ${owned ? (equipped ? "disabled" : "") : (canBuy ? "" : "disabled")} aria-label="${owned ? action : `Купить ${bear.name} за ${formatNumber(bear.cost)} сердечек`}">${action}</button>
      </article>`;
    }).join("");
    $("bearSection").hidden = shopCategory !== "bears";
    $("boostSection").hidden = shopCategory !== "boosts";
    $("bearsCategory").classList.toggle("active", shopCategory === "bears");
    $("boostsCategory").classList.toggle("active", shopCategory === "boosts");
    $("bearsCategory").setAttribute("aria-selected", String(shopCategory === "bears"));
    $("boostsCategory").setAttribute("aria-selected", String(shopCategory === "boosts"));
  }

  function render() {
    $("gameView").hidden = activeView !== "game";
    $("shopView").hidden = activeView !== "shop";
    $("gameTab").classList.toggle("active", activeView === "game");
    $("shopTab").classList.toggle("active", activeView === "shop");
    if (activeView === "game") $("gameTab").setAttribute("aria-current", "page");
    else $("gameTab").removeAttribute("aria-current");
    if (activeView === "shop") $("shopTab").setAttribute("aria-current", "page");
    else $("shopTab").removeAttribute("aria-current");
    if (activeView === "shop") renderShop();
    updateHUD();
  }

  function persist() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = 0;
    state.lastSavedAt = Date.now();
    try {
      const { offlineHearts, ...saveData } = state;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch {
      showToast("Не удалось сохранить прогресс на этом устройстве");
    }
  }

  function scheduleSave(delay = 850) {
    if (saveTimer) return;
    saveTimer = window.setTimeout(persist, delay);
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  function spawnParticles(bear) {
    if (activeParticles >= MAX_PARTICLES) return;
    const glyphs = [...(bear.particles || ["♥"])];
    if (!glyphs.includes("♥")) glyphs.push("♥");
    for (let i = 0; i < glyphs.length && activeParticles < MAX_PARTICLES; i++) {
      const particle = document.createElement("span");
      particle.className = `particle${glyphs[i] === "❄️" || glyphs[i] === "🩵" ? " sparkle" : ""}`;
      particle.textContent = glyphs[i];
      particle.style.setProperty("--x", `calc(50% + ${(Math.random() - .5) * 42}px)`);
      particle.style.setProperty("--y", `calc(57% + ${(Math.random() - .5) * 22}px)`);
      particle.style.setProperty("--drift", `${(Math.random() - .5) * 74}px`);
      particle.style.setProperty("--tilt", `${Math.round((Math.random() - .5) * 54)}deg`);
      particle.style.setProperty("--size", `${16 + Math.random() * 14}px`);
      particle.style.setProperty("--duration", `${.85 + Math.random() * .28}s`);
      particle.style.setProperty("--heart-color", ["#ff6f89", "#ff9caa", "#ffd093"][Math.floor(Math.random() * 3)]);
      particlesLayer.appendChild(particle);
      activeParticles++;
      window.setTimeout(() => { particle.remove(); activeParticles = Math.max(0, activeParticles - 1); }, 1200);
    }
  }

  function punchBear() {
    punchAnimation.currentTime = 0;
    punchAnimation.play();
  }

  function rollLuckyReward() {
    const chance = Math.random();
    if (chance < .05) return 100;
    if (chance < .35) return 10;
    return 2;
  }

  function tryFlowerBoost(now) {
    if (currentBear().id !== "flowers" || now < state.flowerNextTryAt) return;
    state.flowerNextTryAt = now + OFFLINE_LIMIT_MS;
    if (Math.random() < .10) {
      state.flowerBoostUntil = now + 10000;
      showToast("Волшебный букет! x3 сердечек на 10 секунд ✨");
    }
  }

  function tap() {
    const bear = currentBear();
    const now = Date.now();
    tryFlowerBoost(now);
    const base = bear.randomReward ? rollLuckyReward() : bear.base;
    const multiplier = (bear.multiplier || 1) * clickBoost() * (state.flowerBoostUntil > now ? 3 : 1);
    const amount = base * multiplier;
    state.hearts += amount;
    state.earned += amount;
    state.taps += 1;
    punchBear();
    spawnParticles(bear);
    queueHUDUpdate();
    scheduleSave();
  }

  function buyUpgrade(id) {
    const item = upgrades.find(upgrade => upgrade.id === id);
    if (!item) return;
    const cost = costFor(item);
    if (state.hearts < cost) return;
    state.hearts -= cost;
    state.spent += cost;
    state.upgrades[item.id] += 1;
    renderShop();
    updateHUD();
    persist();
    showToast(`Улучшение «${item.name}» куплено ♥`);
  }

  function chooseOrBuyBear(id) {
    const bear = bears.find(item => item.id === id);
    if (!bear) return;
    if (state.unlockedBears[id]) {
      if (state.activeBear === id) return;
      state.activeBear = id;
      renderedBearId = "";
      renderShop();
      updateHUD();
      persist();
      showToast(`Теперь с тобой ${bear.name} ♥`);
      return;
    }
    if (state.hearts < bear.cost) return;
    state.hearts -= bear.cost;
    state.spent += bear.cost;
    state.unlockedBears[id] = true;
    state.activeBear = id;
    renderedBearId = "";
    renderShop();
    updateHUD();
    persist();
    if (id === "halloween") halloweenWelcome.hidden = false;
    else showToast(`${bear.name} теперь с тобой! ♥`);
  }

  function continueFromWelcome() {
    welcome.hidden = true;
    activeView = "game";
    render();
  }

  function resetProgress() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = 0;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      resetConfirm.hidden = true;
      showToast("Не удалось удалить сохранение на этом устройстве");
      return;
    }
    Object.assign(state, emptySave());
    delete state.offlineHearts;
    activeView = "game";
    shopCategory = "bears";
    renderedBearId = "";
    lastQuoteIndex = -1;
    particlesLayer.replaceChildren();
    activeParticles = 0;
    resetConfirm.hidden = true;
    halloweenWelcome.hidden = true;
    render();
    welcome.hidden = false;
  }

  function setShopCategory(category) {
    shopCategory = category;
    renderShop();
  }

  $("gameTab").addEventListener("click", () => { activeView = "game"; render(); });
  $("shopTab").addEventListener("click", () => { activeView = "shop"; render(); });
  $("bearsCategory").addEventListener("click", () => setShopCategory("bears"));
  $("boostsCategory").addEventListener("click", () => setShopCategory("boosts"));
  tapButton.addEventListener("click", tap);
  $("boostList").addEventListener("click", event => {
    const button = event.target.closest("[data-upgrade]");
    if (button) buyUpgrade(button.dataset.upgrade);
  });
  $("bearList").addEventListener("click", event => {
    const button = event.target.closest("[data-bear]");
    if (button) chooseOrBuyBear(button.dataset.bear);
  });
  $("okButton").addEventListener("click", continueFromWelcome);
  $("loveButton").addEventListener("click", () => {
    continueFromWelcome();
    showToast("Я тоже тебя очень люблю ♥");
    spawnParticles(currentBear());
  });
  $("halloweenOkButton").addEventListener("click", () => { halloweenWelcome.hidden = true; });
  $("resetProgressButton").addEventListener("click", () => {
    resetConfirm.hidden = false;
    $("cancelResetButton").focus();
  });
  $("cancelResetButton").addEventListener("click", () => {
    resetConfirm.hidden = true;
    $("resetProgressButton").focus();
  });
  $("confirmResetButton").addEventListener("click", resetProgress);
  resetConfirm.addEventListener("click", event => {
    if (event.target === resetConfirm) resetConfirm.hidden = true;
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !resetConfirm.hidden) resetConfirm.hidden = true;
  });

  $("welcomeMessage").textContent = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  render();
  welcome.hidden = false;
  if (state.offlineHearts > 0) showToast(`Пока тебя не было, мишка собрал ${formatNumber(state.offlineHearts)} ♥`);

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  window.setInterval(() => {
    const now = Date.now();
    let changed = false;
    if (heartsPerSecond() > 0) {
      state.hearts += heartsPerSecond();
      state.earned += heartsPerSecond();
      changed = true;
    }
    if (state.flowerBoostUntil > 0 && state.flowerBoostUntil <= now) {
      state.flowerBoostUntil = 0;
      changed = true;
    }
    if (changed) {
      queueHUDUpdate();
      scheduleSave();
    }
  }, 1000);
  window.setInterval(persist, 5000);
  window.addEventListener("pagehide", () => persist());
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") persist(); });
})();
