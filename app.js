(() => {
  "use strict";

  const SAVE_KEY = "lyublyu-tebya-save-v1";
  const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
  const OFFLINE_LIMIT_MS = 10 * 60 * 1000;
  const GOLDEN_DURATION_MS = 10 * 60 * 1000;
  const PRETTY_DURATION_MS = 5 * 60 * 1000;
  const MAX_PARTICLES = 40;
  const MAX_GOLD_BARS = 22;
  const MAX_FLOWER_PETALS = 22;

  const bears = [
    { id: "classic", name: "Мягкий мишка", cost: 0, image: "assets/teddy-hd.svg", icon: "♥", tagline: "Тёплые объятия и сердечки только для тебя.", description: "Добрый друг для уютных предзимних вечеров.", base: 1, particles: ["♥"] },
    { id: "christmas", name: "Новогодний мишка", cost: 100, image: "assets/bears/christmas.webp", icon: "❄️", tagline: "Каждый тап — маленький снегопад!", description: "Встречает праздник и рассыпает снежинки.", base: 1, particles: ["❄️"] },
    { id: "builder", name: "Строительный мишка", cost: 200, image: "assets/bears/builder.webp", icon: "🔨", tagline: "Строит башню из твоих сердечек.", description: "Касается молоточком — звенят объятия.", base: 1, particles: ["🔨"] },
    { id: "football", name: "Футбольный мишка", cost: 500, image: "assets/bears/football.webp", icon: "⚽", tagline: "Забивает гол прямо в сердечко!", description: "У каждого нажатия свой победный мяч.", base: 1, particles: ["⚽"] },
    { id: "halloween", name: "Хэллоуинский мишка", cost: 600, image: "assets/bears/halloween.webp", icon: "🦇", tagline: "Летучие мышки и в полтора раза больше любви.", description: "Праздничная магия складывается со всеми усилениями.", base: 1, multiplier: 1.5, particles: ["🦇"] },
    { id: "love", name: "Love U Mode", cost: 1000, image: "assets/bears/love-u.webp", icon: "💘", tagline: "Любовный режим включён на полную!", description: "Тройная любовь поверх остальных усилений.", base: 1, multiplier: 3, particles: ["💘"] },
    { id: "luck", name: "Luck ground мишка", cost: 12000, image: "assets/bears/luck-ground.webp", icon: "🍀", tagline: "Какой подарок выпадет в этот раз?", description: "5% — 100, 30% — 10, 65% — 2 сердечка.", randomReward: true, multiplier: 1, particles: ["🍀", "✨"] },
    { id: "polar", name: "Polar мишка", cost: 50000, image: "assets/bears/polar.webp", icon: "❄️", tagline: "Самый уютный холод севера.", description: "Дарит 30 сердечек за тап, плюс твои усиления.", base: 30, particles: ["❄️", "🩵"] },
    { id: "flowers", name: "Мишка с цветами", cost: 300000, image: "assets/bears/flowers.webp", icon: "💐", tagline: "Цветы, сердечки и немного волшебства.", description: "100 сердечек и цветы. Раз в 10 минут — шанс 10% получить x3 на 10 секунд.", base: 100, flowers: true, particles: ["🌸", "💐"] },
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
    "Мишки, огоньки и ты — мой идеальный предзимний вечер ✨",
    "Ты — самое тёплое чудо этой предзимней поры 💗",
    "На всякий случай: я очень-очень тебя люблю!",
  ];
  const welcomeMessages = [
    "Ты у меня самая лучшая. Я очень тебя люблю — эту предзимнюю игру я сделал для тебя ❤️",
    "Пусть каждый предзимний день будет чуточку теплее. Эта игра — маленький подарок для тебя ❤️",
    "Здесь мишки, снег и много сердечек. Но ни одно сердечко не любит тебя так сильно, как я ❤️",
    "Ты — моё любимое новогоднее чудо. Нажимай на мишку и собирай его объятия ❤️",
    "Пусть эта игра напоминает, как сильно ты меня радуешь. Люблю тебя! ❤️",
  ];
  const quizQuestions = [
    { prompt: "Когда мы познакомились?", options: ["хзшкее", "26 октября", "28 октября"], correct: 1 },
    { prompt: "Что мы чаще всего говорим друг другу?", hint: "Подсказка: я .... ....", type: "text-or-choice", placeholder: "я .... ....", fallback: "хзшке", isCorrect: value => normalizeAnswer(value) === "я люблю тебя" },
    { prompt: "Что ты мне чаще всего говоришь на казахском?", type: "text-or-choice", placeholder: "Напиши слово", fallback: "не помню", isCorrect: value => ["душа", "моя душа", "жаным", "жан"].includes(normalizeAnswer(value)) },
    { prompt: "Сколько мы вместе?", options: ["1 год", "3 месяца", "не особо долго"], correct: 2 },
    { prompt: "О чём мы мечтаем больше всего?", options: ["стать богатыми", "побыстрее увидеться и навсегда остаться вместе", "хзшке"], correct: 1 },
    { prompt: "Что я тебе подарил самым первым?", options: ["робуксы хахахах", "мишку", "премиум"], correct: 0 },
    { prompt: "Когда у меня день рождения?", options: ["01.11", "11.01", "03.11"], correct: 0 },
  ];

  const emptySave = () => ({
    hearts: 0, earned: 0, spent: 0, taps: 0,
    upgrades: { touch: 0, hugs: 0, power: 0 },
    unlockedBears: { classic: true }, activeBear: "classic",
    flowerNextTryAt: 0, flowerBoostUntil: 0, goldRemainingMs: 0, prettyRemainingMs: 0, activeEvent: "",
    flowersEndingSeen: false, surveyCompleted: false, prettyRewardPending: false, lastSavedAt: Date.now(),
  });

  function loadSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || typeof saved !== "object") return emptySave();
      const base = emptySave();
      const merged = { ...base, ...saved, upgrades: { ...base.upgrades, ...(saved.upgrades || {}) }, unlockedBears: { ...base.unlockedBears, ...(saved.unlockedBears || {}) } };
      merged.flowersEndingSeen = Boolean(merged.flowersEndingSeen);
      merged.surveyCompleted = Boolean(merged.surveyCompleted);
      merged.prettyRewardPending = Boolean(merged.prettyRewardPending);
      for (const key of ["hearts", "earned", "spent", "taps"]) merged[key] = Math.max(0, Number(merged[key]) || 0);
      for (const key of Object.keys(merged.upgrades)) merged.upgrades[key] = Math.max(0, Math.floor(Number(merged.upgrades[key]) || 0));
      for (const key of Object.keys(merged.unlockedBears)) merged.unlockedBears[key] = Boolean(merged.unlockedBears[key]);
      if (!bears.some(bear => bear.id === merged.activeBear && merged.unlockedBears[bear.id])) merged.activeBear = "classic";
      const now = Date.now();
      const legacyGoldenUntil = Math.max(0, Number(merged.goldenUntil) || 0);
      merged.goldRemainingMs = Math.max(0, Number(merged.goldRemainingMs) || Math.max(0, legacyGoldenUntil - now));
      merged.prettyRemainingMs = Math.max(0, Number(merged.prettyRemainingMs) || 0);
      if (!["gold", "pretty"].includes(merged.activeEvent)) merged.activeEvent = legacyGoldenUntil > now ? "gold" : "";
      if ((merged.activeEvent === "gold" && merged.goldRemainingMs <= 0) || (merged.activeEvent === "pretty" && merged.prettyRemainingMs <= 0)) merged.activeEvent = "";
      delete merged.goldenUntil;
      const last = Number(merged.lastSavedAt) || now;
      const elapsedMs = Math.max(0, now - last);
      const offlineSeconds = Math.min(MAX_OFFLINE_SECONDS, elapsedMs / 1000);
      const activeEventMs = merged.activeEvent === "gold" ? merged.goldRemainingMs : merged.activeEvent === "pretty" ? merged.prettyRemainingMs : 0;
      const eventOfflineSeconds = Math.min(elapsedMs, activeEventMs) / 1000;
      const eventMultiplier = merged.activeEvent === "gold" ? 10 : merged.activeEvent === "pretty" ? 100 : 1;
      const awayHearts = Math.floor(merged.upgrades.hugs * (offlineSeconds + eventOfflineSeconds * (eventMultiplier - 1)));
      if (awayHearts > 0) {
        merged.hearts += awayHearts;
        merged.earned += awayHearts;
        merged.offlineHearts = awayHearts;
      }
      if (merged.activeEvent === "gold") merged.goldRemainingMs = Math.max(0, merged.goldRemainingMs - elapsedMs);
      if (merged.activeEvent === "pretty") merged.prettyRemainingMs = Math.max(0, merged.prettyRemainingMs - elapsedMs);
      if ((merged.activeEvent === "gold" && merged.goldRemainingMs <= 0) || (merged.activeEvent === "pretty" && merged.prettyRemainingMs <= 0)) merged.activeEvent = "";
      merged.lastSavedAt = now;
      return merged;
    } catch {
      return emptySave();
    }
  }

  const state = loadSave();
  let pendingFlowersWelcome = Boolean(state.unlockedBears.flowers && !state.flowersEndingSeen);
  let quizIndex = 0;
  let quizScore = 0;
  let lastEventTickAt = Date.now();
  let activeView = "game";
  let shopCategory = "bears";
  let saveTimer = 0;
  let toastTimer = 0;
  let hudFrame = 0;
  let activeParticles = 0;
  let goldRainTimer = 0;
  const goldBars = new Set();
  let flowerRainTimer = 0;
  const flowerPetals = new Set();
  let renderedBearId = "";
  let lastQuoteIndex = -1;

  const $ = id => document.getElementById(id);
  const balanceEl = $("balance");
  const tapButton = $("tapButton");
  const teddy = $("teddy");
  const particlesLayer = $("heartParticles");
  const welcome = $("welcome");
  const halloweenWelcome = $("halloweenWelcome");
  const flowersWelcome = $("flowersWelcome");
  const pinkWelcome = $("pinkWelcome");
  const resetConfirm = $("resetConfirm");
  const goldRain = $("goldRain");
  const flowerRain = $("flowerRain");
  const goldTitle = $("goldTitle");
  const pinkTitle = $("pinkTitle");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const surveyIntro = $("surveyIntro");
  const quizModal = $("quizModal");
  const quizHint = $("quizHint");
  const quizAnswers = $("quizAnswers");
  const quizResultModal = $("quizResultModal");
  const quizSuccessActions = $("quizSuccessActions");
  const quizRetryActions = $("quizRetryActions");

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

  function normalizeAnswer(value) {
    return String(value || "").toLocaleLowerCase("ru-RU").replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }

  function activeEventMultiplier(eventId = state.activeEvent) {
    return eventId === "gold" ? 10 : eventId === "pretty" ? 100 : 1;
  }

  function eventRemainingMs(eventId) {
    return eventId === "gold" ? state.goldRemainingMs : eventId === "pretty" ? state.prettyRemainingMs : 0;
  }

  function formatClock(milliseconds) {
    const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
  }

  function advanceActiveEvent(now = Date.now()) {
    const elapsed = Math.max(0, now - lastEventTickAt);
    lastEventTickAt = now;
    if (!state.activeEvent || elapsed <= 0) return false;
    const field = state.activeEvent === "gold" ? "goldRemainingMs" : "prettyRemainingMs";
    state[field] = Math.max(0, state[field] - elapsed);
    if (state[field] === 0) state.activeEvent = "";
    return true;
  }

  function updateEventSwitcher() {
    const hasGold = state.goldRemainingMs > 0;
    const hasPretty = state.prettyRemainingMs > 0;
    $("eventSwitcher").hidden = !hasGold && !hasPretty;
    $("goldEventButton").hidden = !hasGold;
    $("pinkEventButton").hidden = !hasPretty;
    $("goldEventButton").classList.toggle("active", state.activeEvent === "gold");
    $("pinkEventButton").classList.toggle("active", state.activeEvent === "pretty");
    $("goldEventButton").setAttribute("aria-pressed", String(state.activeEvent === "gold"));
    $("pinkEventButton").setAttribute("aria-pressed", String(state.activeEvent === "pretty"));
    setText("goldEventTimer", formatClock(state.goldRemainingMs));
    setText("pinkEventTimer", formatClock(state.prettyRemainingMs));
    $("surveyPrompt").hidden = state.surveyCompleted;
  }

  function clickBoost() {
    return (1 + state.upgrades.touch) * Math.pow(2, state.upgrades.power);
  }

  function heartsPerSecond() {
    return state.upgrades.hugs * activeEventMultiplier();
  }

  function costFor(item) {
    return Math.floor(item.baseCost * Math.pow(item.growth, state.upgrades[item.id]));
  }

  function expectedBearPayout(bear) {
    return bear.randomReward ? 9.8 : bear.base;
  }

  function currentTapMultiplier(now = Date.now()) {
    const bear = currentBear();
    return (bear.multiplier || 1) * clickBoost() * (state.flowerBoostUntil > now ? 3 : 1) * activeEventMultiplier();
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
    syncEventVisuals();
    updateEventSwitcher();
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
    const effects = [];
    if (state.activeEvent) {
      const eventTitle = state.activeEvent === "gold" ? "Золотая бесконечность" : "Эвент прекрасности";
      effects.push(`${eventTitle} ×${activeEventMultiplier()} · ${formatClock(eventRemainingMs(state.activeEvent))}`);
    }
    if (state.flowerBoostUntil > now) effects.push(`цветочный x3 ещё ${Math.ceil((state.flowerBoostUntil - now) / 1000)} сек.`);
    const tagline = effects.length ? `${bear.tagline} ✨ ${effects.join(" · ")}` : bear.tagline;
    setText("bearTagline", tagline);
    goldTitle.hidden = state.activeEvent !== "gold";
    pinkTitle.hidden = state.activeEvent !== "pretty";
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
    if (advanceActiveEvent()) queueHUDUpdate();
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

  function spawnGoldBar() {
    if (goldBars.size >= MAX_GOLD_BARS) return;
    const bar = document.createElement("span");
    const duration = 8 + Math.random() * 5;
    bar.className = "gold-bar";
    bar.style.left = `${Math.random() * 100}%`;
    bar.style.setProperty("--gold-duration", `${duration}s`);
    bar.style.setProperty("--gold-drift", `${Math.round((Math.random() - .5) * 130)}px`);
    bar.style.opacity = `${.6 + Math.random() * .4}`;
    goldRain.appendChild(bar);
    goldBars.add(bar);
    window.setTimeout(() => {
      bar.remove();
      goldBars.delete(bar);
    }, (duration + 1) * 1000);
  }

  function spawnFlowerPetal() {
    if (flowerPetals.size >= MAX_FLOWER_PETALS) return;
    const petal = document.createElement("span");
    const duration = 8 + Math.random() * 5;
    petal.className = "flower-petal";
    petal.textContent = ["🌸", "🌷", "🌼", "💮", "🌺"][Math.floor(Math.random() * 5)];
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--flower-duration", `${duration}s`);
    petal.style.setProperty("--flower-drift", `${Math.round((Math.random() - .5) * 150)}px`);
    flowerRain.appendChild(petal);
    flowerPetals.add(petal);
    window.setTimeout(() => {
      petal.remove();
      flowerPetals.delete(petal);
    }, (duration + 1) * 1000);
  }

  function syncEventVisuals() {
    const goldActive = state.activeEvent === "gold" && eventRemainingMs("gold") > 0;
    const prettyActive = state.activeEvent === "pretty" && eventRemainingMs("pretty") > 0;
    document.body.classList.toggle("golden-mode", goldActive);
    document.body.classList.toggle("pink-mode", prettyActive);
    themeColorMeta.content = goldActive ? "#382b10" : prettyActive ? "#47243d" : "#0e1720";
    if (goldActive && !goldRainTimer) {
      spawnGoldBar();
      goldRainTimer = window.setInterval(spawnGoldBar, 600);
    } else if (!goldActive && goldRainTimer) {
      window.clearInterval(goldRainTimer);
      goldRainTimer = 0;
      goldRain.replaceChildren();
      goldBars.clear();
    }
    if (prettyActive && !flowerRainTimer) {
      spawnFlowerPetal();
      flowerRainTimer = window.setInterval(spawnFlowerPetal, 650);
    } else if (!prettyActive && flowerRainTimer) {
      window.clearInterval(flowerRainTimer);
      flowerRainTimer = 0;
      flowerRain.replaceChildren();
      flowerPetals.clear();
    }
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
    const multiplier = (bear.multiplier || 1) * clickBoost() * (state.flowerBoostUntil > now ? 3 : 1) * activeEventMultiplier();
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
    if (id === "flowers") state.flowersEndingSeen = true;
    renderedBearId = "";
    renderShop();
    updateHUD();
    persist();
    if (id === "halloween") halloweenWelcome.hidden = false;
    else if (id === "flowers") flowersWelcome.hidden = false;
    else showToast(`${bear.name} теперь с тобой! ♥`);
  }

  function closeFlowersWelcome(startGoldenEvent = false) {
    flowersWelcome.hidden = true;
    activeView = "game";
    if (startGoldenEvent) {
      state.goldRemainingMs = GOLDEN_DURATION_MS;
      state.activeEvent = "gold";
      lastEventTickAt = Date.now();
    }
    render();
    if (startGoldenEvent) {
      persist();
      spawnParticles(currentBear());
      showToast("Золотая бесконечность! x10 на 10 минут ✨");
    }
  }

  function continueFromWelcome() {
    welcome.hidden = true;
    activeView = "game";
    render();
    if (pendingFlowersWelcome) {
      pendingFlowersWelcome = false;
      state.flowersEndingSeen = true;
      persist();
      flowersWelcome.hidden = false;
    } else if (state.prettyRewardPending) {
      pinkWelcome.hidden = false;
    }
  }

  function openSurvey() {
    surveyIntro.hidden = false;
  }

  function startSurvey() {
    surveyIntro.hidden = true;
    quizResultModal.hidden = true;
    quizIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
    quizModal.hidden = false;
  }

  function addQuizChoice(label, onSelect) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-choice";
    button.textContent = label;
    button.addEventListener("click", onSelect, { once: true });
    quizAnswers.appendChild(button);
  }

  function renderQuizQuestion() {
    const question = quizQuestions[quizIndex];
    setText("quizProgress", `вопрос ${quizIndex + 1} из ${quizQuestions.length}`);
    setText("quizQuestion", question.prompt);
    setText("quizHint", question.hint || "");
    quizHint.hidden = !question.hint;
    quizAnswers.replaceChildren();

    if (question.type === "text-or-choice") {
      const form = document.createElement("form");
      form.className = "quiz-text-form";
      const input = document.createElement("input");
      input.type = "text";
      input.autocomplete = "off";
      input.placeholder = question.placeholder;
      input.setAttribute("aria-label", question.prompt);
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.className = "quiz-choice quiz-submit";
      submit.textContent = "Ответить";
      form.append(input, submit);
      form.addEventListener("submit", event => {
        event.preventDefault();
        answerQuizQuestion(question.isCorrect(input.value));
      });
      quizAnswers.appendChild(form);
      addQuizChoice(question.fallback, () => answerQuizQuestion(false));
      input.focus();
      return;
    }

    question.options.forEach((option, index) => {
      addQuizChoice(option, () => answerQuizQuestion(index === question.correct));
    });
  }

  function answerQuizQuestion(correct) {
    if (correct) quizScore++;
    quizIndex++;
    if (quizIndex >= quizQuestions.length) finishSurvey();
    else renderQuizQuestion();
  }

  function finishSurvey() {
    quizModal.hidden = true;
    const passed = quizScore >= 4;
    setText("quizScore", `${quizScore} из ${quizQuestions.length} правильных`);
    if (passed) {
      state.surveyCompleted = true;
      state.prettyRewardPending = true;
      setText("quizResultTitle", "Ты отлично меня знаешь!");
      setText("quizResultMessage", "Набрано 4 или больше правильных ответов — твоя награда ждёт тебя 💗");
      quizSuccessActions.hidden = false;
      quizRetryActions.hidden = true;
      persist();
      updateHUD();
    } else {
      setText("quizResultTitle", "Попробуем ещё раз?");
      setText("quizResultMessage", "Для награды нужно набрать хотя бы 4 правильных ответа. Подсказка: отвечай сердцем 💞");
      quizSuccessActions.hidden = true;
      quizRetryActions.hidden = false;
    }
    quizResultModal.hidden = false;
  }

  function activatePrettyEvent() {
    pinkWelcome.hidden = true;
    state.prettyRewardPending = false;
    state.prettyRemainingMs = PRETTY_DURATION_MS;
    state.activeEvent = "pretty";
    lastEventTickAt = Date.now();
    activeView = "game";
    render();
    persist();
    spawnParticles(currentBear());
    showToast("Эвент прекрасности! x100 на 5 минут 🌸");
  }

  function selectEvent(eventId) {
    if (eventRemainingMs(eventId) <= 0) return;
    advanceActiveEvent();
    state.activeEvent = eventId;
    lastEventTickAt = Date.now();
    render();
    persist();
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
    pendingFlowersWelcome = false;
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
  $("flowersDismissButton").addEventListener("click", () => closeFlowersWelcome());
  $("goldenLoveButton").addEventListener("click", () => closeFlowersWelcome(true));
  $("goldEventButton").addEventListener("click", () => selectEvent("gold"));
  $("pinkEventButton").addEventListener("click", () => selectEvent("pretty"));
  $("surveyOpenButton").addEventListener("click", openSurvey);
  $("surveyStartButton").addEventListener("click", startSurvey);
  $("surveyLaterButton").addEventListener("click", () => { surveyIntro.hidden = true; });
  $("quizContinueButton").addEventListener("click", () => {
    quizResultModal.hidden = true;
    pinkWelcome.hidden = false;
  });
  $("quizRetryButton").addEventListener("click", startSurvey);
  $("quizCloseButton").addEventListener("click", () => { quizResultModal.hidden = true; });
  $("pinkThanksButton").addEventListener("click", activatePrettyEvent);
  $("pinkLoveButton").addEventListener("click", activatePrettyEvent);
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
    let changed = advanceActiveEvent(now);
    const passiveHearts = heartsPerSecond();
    if (passiveHearts > 0) {
      state.hearts += passiveHearts;
      state.earned += passiveHearts;
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
