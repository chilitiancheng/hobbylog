const STORE_KEY = "interest-home-v3";
const OLD_KEYS = ["interest-home-v2", "interest-home-v1"];
const app = document.querySelector("#app");

const seedBirds = [
  ["麻雀", "Passer montanus", "城市里最常见，群体活动。"],
  ["喜鹊", "Pica pica", "黑白羽色，长尾，常在树梢鸣叫。"],
  ["灰喜鹊", "Cyanopica cyanus", "蓝灰色长尾，常成群。"],
  ["乌鸫", "Turdus mandarinus", "雄鸟通体黑色，嘴橙黄。"],
  ["白头鹎", "Pycnonotus sinensis", "头顶白斑，城市绿地常见。"],
  ["珠颈斑鸠", "Spilopelia chinensis", "颈侧有珠点状斑纹。"],
  ["家燕", "Hirundo rustica", "叉尾，春夏常在空中捕虫。"],
  ["白鹭", "Egretta garzetta", "湿地常见，黑嘴黑脚。"],
  ["池鹭", "Ardeola bacchus", "繁殖羽栗红，飞起时白翼明显。"],
  ["夜鹭", "Nycticorax nycticorax", "傍晚活跃，红眼灰背。"],
  ["普通翠鸟", "Alcedo atthis", "蓝绿色背，常贴水飞行。"],
  ["黑水鸡", "Gallinula chloropus", "红额甲，池塘湿地常见。"],
  ["小䴙䴘", "Tachybaptus ruficollis", "小型水鸟，常潜水。"],
  ["大山雀", "Parus major", "黑色头顶和胸中线。"],
  ["棕背伯劳", "Lanius schach", "有黑色眼罩，常停在枝头。"],
  ["戴胜", "Upupa epops", "羽冠醒目，嘴长下弯。"]
];

const baseData = {
  birding: {
    logs: [{ id: id(), date: today(), species: "白鹭", location: "河边湿地", count: "3", note: "清晨觅食，水面很安静。" }],
    birds: seedBirds.map(([name, scientific, note]) => ({ id: id(), name, scientific, note })),
    locations: [{ id: id(), name: "河边湿地", habitat: "湿地", note: "清晨人少，适合慢慢看。" }],
    plans: [],
    pendingPhotos: []
  },
  fitness: {
    plans: [{ id: id(), date: today(), title: "轻力量恢复", status: "计划中", note: "先留一个入口，等你发正式计划。" }],
    workouts: [],
    body: []
  },
  crochet: {
    projects: [{ id: id(), name: "春日杯垫", progress: "35%", material: "棉线", note: "边缘想换成湖蓝色。" }],
    patterns: [],
    inventory: []
  }
};

let data = loadData();
let listPage = 0;
let calendarCursor = new Date();

window.addEventListener("hashchange", () => {
  listPage = 0;
  render();
});
document.addEventListener("submit", onSubmit);
document.addEventListener("click", onClick);
document.addEventListener("input", onInput);

const routes = {
  home: renderHome,
  birding: () => modulePage("观鸟", "把遇见留在地点、季节和羽色里", birdStats(), [
    ["新增观察", "bird-log", "记录今天看见什么"],
    ["观鸟计划", "bird-plan", "下次去哪里、带什么"],
    ["待确认", "bird-pending", "留住还没认出的瞬间"],
    ["地点", "bird-location", "整理常去的观察点"],
    ["鸟种库", "list-birds", "常见鸟与个人记录"],
    ["观察日志", "list-birdlogs", "按时间回看"]
  ]),
  fitness: () => modulePage("健身", "把身体的变化放进日程", fitnessStats(), [
    ["训练计划", "fitness-plan", "安排动作和节奏"],
    ["训练打卡", "workout", "记录完成情况"],
    ["身体数据", "body", "保存体重围度状态"],
    ["训练记录", "list-workouts", "回看训练轨迹"]
  ]),
  crochet: () => modulePage("钩织", "让线、图解和作品慢慢成形", crochetStats(), [
    ["作品项目", "project", "记录一件作品"],
    ["图解收藏", "pattern", "保存想做的灵感"],
    ["材料库存", "inventory", "毛线颜色和数量"],
    ["作品列表", "list-projects", "查看进行中的作品"]
  ]),
  "bird-log": () => formPage("新增观察", "birding", "logs", "birding", [
    ["date", "日期", "date", today()],
    ["species", "鸟种", "text", "", "白鹭"],
    ["location", "地点", "text", "", "河边湿地"],
    ["count", "数量", "number", "1"],
    ["note", "备注", "textarea", "", "行为、天气、识别依据"]
  ], afterBirdLog),
  "bird-plan": () => formPage("观鸟计划", "birding", "plans", "birding", [
    ["date", "日期", "date", today()],
    ["location", "地点", "text", "", "城市公园"],
    ["target", "目标鸟种", "text", "", "翠鸟、鹭类"],
    ["gear", "装备", "text", "", "望远镜, 相机"],
    ["note", "备注", "textarea", "", "路线、天气、提醒"]
  ]),
  "bird-pending": () => formPage("待确认照片", "birding", "pendingPhotos", "birding", [
    ["date", "日期", "date", today()],
    ["candidate", "候选鸟种", "text", "", "柳莺属？"],
    ["photo", "照片引用", "text", "", "链接或文件名"],
    ["reason", "判断依据", "text", "", "翼斑、嘴型"],
    ["note", "不确定点", "textarea", "", "还需要确认什么"]
  ]),
  "bird-location": () => formPage("新增地点", "birding", "locations", "birding", [
    ["name", "地点", "text", "", "河边湿地"],
    ["habitat", "栖息地", "text", "", "湿地 / 公园"],
    ["season", "季节", "text", "", "春秋"],
    ["common", "常见鸟", "text", "", "白鹭、翠鸟"],
    ["note", "备注", "textarea", "", "交通、注意事项"]
  ]),
  "fitness-plan": () => formPage("训练计划", "fitness", "plans", "fitness", [
    ["date", "日期", "date", today()],
    ["title", "标题", "text", "", "上肢力量"],
    ["status", "状态", "select", "计划中", "计划中|已完成|跳过"],
    ["exercises", "动作", "textarea", "", "俯卧撑 3x10；划船 3x12"],
    ["note", "备注", "text", "", "重点提醒"]
  ]),
  workout: () => formPage("训练打卡", "fitness", "workouts", "fitness", [
    ["date", "日期", "date", today()],
    ["exercise", "动作", "text", "", "深蹲"],
    ["sets", "组数", "number", "3"],
    ["reps", "次数", "text", "", "12 / 45s"],
    ["load", "重量/时长", "text", "", "20kg / 30min"]
  ]),
  body: () => formPage("身体数据", "fitness", "body", "fitness", [
    ["date", "日期", "date", today()],
    ["weight", "体重", "text", "", "kg"],
    ["measurements", "围度", "text", "", "腰围/臀围"],
    ["fat", "体脂", "text", "", "%"],
    ["note", "状态", "textarea", "", "睡眠、疲劳、饮食"]
  ]),
  project: () => formPage("钩织作品", "crochet", "projects", "crochet", [
    ["name", "作品名", "text", "", "春日杯垫"],
    ["progress", "进度", "text", "", "35%"],
    ["material", "材料", "text", "", "棉线"],
    ["hook", "针号", "text", "", "3.0mm"],
    ["note", "备注", "textarea", "", "针法、图片引用、想法"]
  ]),
  pattern: () => formPage("图解收藏", "crochet", "patterns", "crochet", [
    ["title", "图解名", "text", "", "花片图解"],
    ["source", "来源", "text", "", "https://"],
    ["difficulty", "难度", "text", "", "入门 / 中等"],
    ["status", "状态", "select", "想做", "想做|进行中|已完成"],
    ["note", "备注", "textarea", "", "适合材料、注意点"]
  ]),
  inventory: () => formPage("材料库存", "crochet", "inventory", "crochet", [
    ["name", "毛线", "text", "", "牛奶棉"],
    ["color", "颜色", "text", "", "湖蓝"],
    ["weight", "克重", "text", "", "50g"],
    ["stock", "库存", "text", "", "2团"],
    ["usedFor", "用于", "text", "", "春日杯垫"]
  ]),
  "list-birdlogs": () => listPageView("观察日志", "birding", "logs", "birding", birdLogCard),
  "list-birds": () => listPageView("鸟种库", "birding", "birds", "birding", birdCard),
  "list-workouts": () => listPageView("训练记录", "fitness", "workouts", "fitness", workoutCard),
  "list-projects": () => listPageView("作品列表", "crochet", "projects", "crochet", projectCard),
  calendar: renderCalendar,
  settings: renderSettings
};

render();
saveData();

function loadData() {
  let loaded = null;
  const keys = [STORE_KEY, ...OLD_KEYS];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      loaded = JSON.parse(raw);
      break;
    } catch {
      loaded = null;
    }
  }
  const merged = merge(clone(baseData), loaded || {});
  seedCommonBirds(merged);
  return merged;
}

function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function seedCommonBirds(target) {
  const names = new Set((target.birding.birds || []).map((bird) => bird.name));
  seedBirds.forEach(([name, scientific, note]) => {
    if (!names.has(name)) target.birding.birds.push({ id: id(), name, scientific, note });
  });
}

function render() {
  const route = location.hash.slice(1) || "home";
  const view = routes[route] || renderHome;
  app.innerHTML = view();
}

function renderHome() {
  return shell("", "兴趣记", "观鸟 · 健身 · 钩织", `
    <section class="home-hero">
      <div class="home-copy">
        <h2>把日子里的热爱，轻轻收好。</h2>
        <p>记下鸟的来处、身体的节奏，也安放一针一线慢慢长出的作品。</p>
      </div>
      <div class="entry-grid">
        ${entry("观鸟", "看见、辨认、回到那片风景", "birding")}
        ${entry("健身", "计划、完成、感受身体的回声", "fitness")}
        ${entry("钩织", "从一团线开始，留下进度和灵感", "crochet")}
      </div>
    </section>
  `, bottomNav(), true);
}

function modulePage(title, sub, stats, actions) {
  return shell("home", title, sub, `
    <section class="stats">
      ${stats.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join("")}
    </section>
    <section class="action-grid">
      ${actions.map(([label, route, desc]) => `
        <a class="card" href="#${route}">
          <small>${label}</small>
          <h3>${desc}</h3>
          <p>点按进入</p>
        </a>
      `).join("")}
    </section>
  `, bottomNav());
}

function formPage(title, group, list, backRoute, fields, afterSave) {
  return shell(backRoute, title, "保存到本机浏览器", `
    <form class="form" data-form data-group="${group}" data-list="${list}" data-back="${backRoute}" data-after="${afterSave ? "bird-log" : ""}">
      <div class="fields">
        ${fields.map(field).join("")}
      </div>
      <div class="form-actions">
        <a class="ghost" href="#${backRoute}">取消</a>
        <button class="button" type="submit">保存</button>
        <a class="ghost" href="#settings">备份</a>
      </div>
    </form>
  `, "");
}

function listPageView(title, group, list, backRoute, cardFn) {
  const items = data[group][list] || [];
  const perPage = 3;
  const total = Math.max(1, Math.ceil(items.length / perPage));
  listPage = Math.min(listPage, total - 1);
  const visible = items.slice(listPage * perPage, listPage * perPage + perPage);
  return shell(backRoute, title, `${items.length} 条记录`, `
    <section class="list">
      <div class="hint">第 ${listPage + 1} / ${total} 页</div>
      <div class="list-stack">
        ${visible.length ? visible.map((item) => cardFn(item, `${group}.${list}`)).join("") : `<div class="compact-note"><h2>暂无记录</h2><p>回到模块页新增一条。</p></div>`}
      </div>
      <div class="pager">
        <button class="ghost" data-page="-1">上一页</button>
        <a class="button" href="#${backRoute}">返回</a>
        <button class="ghost" data-page="1">下一页</button>
      </div>
    </section>
  `, "");
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthStart = new Date(year, month, 1);
  const firstDay = monthStart.getDay();
  const start = new Date(year, month, 1 - firstDay);
  const items = calendarItems();
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);
    const dayItems = items.filter((item) => item.date === key);
    const classes = ["day"];
    if (date.getMonth() !== month) classes.push("muted");
    if (key === today()) classes.push("today");
    return `
      <div class="${classes.join(" ")}">
        <span>${date.getDate()}</span>
        <span class="dots">${dayItems.slice(0, 3).map((item) => `<i class="dot ${item.kind}"></i>`).join("")}</span>
      </div>
    `;
  }).join("");

  return shell("home", "日历", "把三种兴趣放进同一张月历", `
    <section class="calendar">
      <div class="calendar-head">
        <button class="ghost" data-month="-1">上月</button>
        <strong>${year}年${month + 1}月</strong>
        <button class="ghost" data-month="1">下月</button>
      </div>
      <div class="week">${["日", "一", "二", "三", "四", "五", "六"].map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="month-grid">${days}</div>
    </section>
  `, bottomNav());
}

function renderSettings() {
  return shell("home", "设置与备份", "数据只在当前浏览器", `
    <section class="list">
      <div class="compact-note">
        <h2>换设备前先备份</h2>
        <p>导出 JSON 后，可以在另一台设备导入。</p>
      </div>
      <div class="list-stack">
        <button class="button" data-action="export">导出 JSON</button>
        <label class="ghost">导入 JSON<input class="hidden-input" type="file" accept="application/json" data-import></label>
        <button class="danger" data-action="clear">清空本地数据</button>
      </div>
    </section>
  `, bottomNav());
}

function shell(back, title, sub, content, nav, isHome = false) {
  return `
    <section class="phone">
      <header class="top ${isHome ? "home" : ""}">
        ${isHome ? "" : `<a class="back" href="#${back}" aria-label="返回">‹</a>`}
        <div class="title"><h1>${title}</h1><p>${sub}</p></div>
        <a class="settings-button" href="#settings" aria-label="设置">⋯</a>
      </header>
      <main class="content">${content}</main>
      ${nav}
    </section>
  `;
}

function bottomNav() {
  return `
    <nav class="bottom-nav">
      <a class="nav-item" href="#home">首页</a>
      <a class="nav-item" href="#birding">观鸟</a>
      <a class="nav-item" href="#fitness">健身</a>
      <a class="nav-item" href="#crochet">钩织</a>
      <a class="nav-item" href="#calendar">日历</a>
    </nav>
  `;
}

function entry(title, desc, route) {
  return `
    <a class="entry" href="#${route}">
      <span><h3>${title}</h3><p>${desc}</p></span>
      <span class="arrow">›</span>
    </a>
  `;
}

function field([name, label, type, value = "", placeholder = ""]) {
  if (type === "textarea") {
    return `<div class="field full"><label>${label}</label><textarea name="${name}" placeholder="${placeholder}">${value}</textarea></div>`;
  }
  if (type === "select") {
    return `<div class="field"><label>${label}</label><select name="${name}">${placeholder.split("|").map((item) => `<option ${item === value ? "selected" : ""}>${item}</option>`).join("")}</select></div>`;
  }
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${value}" placeholder="${placeholder}"></div>`;
}

function onSubmit(event) {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const item = Object.fromEntries(new FormData(form).entries());
  item.id = id();
  data[form.dataset.group][form.dataset.list].unshift(item);
  if (form.dataset.after === "bird-log") afterBirdLog(item);
  saveData();
  location.hash = form.dataset.back;
}

function onClick(event) {
  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    removeItem(deleteButton.dataset.delete, deleteButton.dataset.id);
    saveData();
    render();
    return;
  }

  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    listPage = Math.max(0, listPage + Number(pageButton.dataset.page));
    render();
    return;
  }

  const monthButton = event.target.closest("[data-month]");
  if (monthButton) {
    calendarCursor.setMonth(calendarCursor.getMonth() + Number(monthButton.dataset.month));
    render();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "export") exportData();
  if (action.dataset.action === "clear" && confirm("确定清空当前浏览器里的所有数据吗？")) {
    data = clone(baseData);
    saveData();
    render();
  }
}

function onInput(event) {
  const input = event.target.closest("[data-import]");
  if (!input || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      data = merge(clone(baseData), JSON.parse(reader.result));
      seedCommonBirds(data);
      saveData();
      render();
    } catch {
      alert("导入失败：JSON 格式不正确。");
    }
  };
  reader.readAsText(input.files[0]);
}

function afterBirdLog(item) {
  if (item.species && !data.birding.birds.some((bird) => bird.name === item.species)) {
    data.birding.birds.unshift({ id: id(), name: item.species, scientific: "", note: "由观察记录创建。" });
  }
  if (item.location && !data.birding.locations.some((loc) => loc.name === item.location)) {
    data.birding.locations.unshift({ id: id(), name: item.location, habitat: "", note: "由观察记录创建。" });
  }
}

function birdLogCard(item, path) {
  return card(item, path, item.species || "未命名鸟种", item.date || "", [item.location, item.count && `${item.count}只`], item.note);
}

function birdCard(item, path) {
  const query = encodeURIComponent(item.scientific || item.name || "");
  return card(item, path, item.name || "未命名鸟种", item.scientific || "未填学名", [
    `<a href="https://www.gbif.org/species/search?q=${query}" target="_blank">GBIF</a>`,
    `<a href="https://www.wikipedia.org/search-redirect.php?family=wikipedia&language=zh&search=${query}" target="_blank">Wiki</a>`
  ], item.note, true);
}

function workoutCard(item, path) {
  return card(item, path, item.exercise || item.title || "训练", item.date || "", [item.sets && `${item.sets}组`, item.reps, item.load], item.note);
}

function projectCard(item, path) {
  return card(item, path, item.name || "钩织作品", item.progress || "", [item.material, item.hook], item.note);
}

function card(item, path, title, sub, pills, body, allowHtml = false) {
  return `
    <article class="list-card">
      <header>
        <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(sub)}</p></div>
        <button class="ghost" data-delete="${path}" data-id="${item.id}">删</button>
      </header>
      <div class="pills">${pills.filter(Boolean).map((pill) => `<span class="pill">${allowHtml ? pill : escapeHtml(pill)}</span>`).join("")}</div>
      ${body ? `<p>${escapeHtml(body)}</p>` : ""}
    </article>
  `;
}

function birdStats() {
  return [[data.birding.logs.length, "记录"], [data.birding.birds.length, "鸟种"], [data.birding.locations.length, "地点"]];
}

function fitnessStats() {
  return [[data.fitness.plans.length, "计划"], [data.fitness.workouts.length, "打卡"], [data.fitness.body.length, "身体"]];
}

function crochetStats() {
  return [[data.crochet.projects.length, "作品"], [data.crochet.patterns.length, "图解"], [data.crochet.inventory.length, "材料"]];
}

function calendarItems() {
  return [
    ...data.birding.logs.map((x) => ({ date: x.date, title: x.species, type: "观鸟", kind: "birding" })),
    ...data.fitness.plans.map((x) => ({ date: x.date, title: x.title, type: "计划", kind: "fitness" })),
    ...data.fitness.workouts.map((x) => ({ date: x.date, title: x.exercise, type: "训练", kind: "fitness" })),
    ...data.crochet.projects.map((x) => ({ date: x.start || today(), title: x.name, type: "钩织", kind: "crochet" }))
  ].filter((x) => x.date);
}

function removeItem(path, itemId) {
  const parts = path.split(".");
  const list = parts.reduce((target, key) => target[key], data);
  const index = list.findIndex((item) => item.id === itemId);
  if (index >= 0) list.splice(index, 1);
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hobbylog-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function merge(base, extra) {
  return {
    ...base,
    ...extra,
    birding: { ...base.birding, ...(extra.birding || {}) },
    fitness: { ...base.fitness, ...(extra.fitness || {}) },
    crochet: { ...base.crochet, ...(extra.crochet || {}) }
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function id() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function today() {
  return toDateKey(new Date());
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
