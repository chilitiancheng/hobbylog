const STORE_KEY = "interest-home-v2";
const app = document.querySelector("#app");

const emptyData = {
  birding: { logs: [], birds: [], locations: [], plans: [], pendingPhotos: [] },
  fitness: { plans: [], workouts: [], body: [] },
  crochet: { projects: [], patterns: [], inventory: [] }
};

const demoData = {
  birding: {
    logs: [{ id: id(), date: today(), species: "白鹭", location: "河边湿地", count: "3", note: "清晨觅食。" }],
    birds: [{ id: id(), name: "白鹭", scientific: "Egretta garzetta", note: "黑嘴黑脚。" }],
    locations: [{ id: id(), name: "河边湿地", habitat: "湿地", note: "清晨人少。" }],
    plans: [],
    pendingPhotos: []
  },
  fitness: {
    plans: [{ id: id(), date: today(), title: "上肢力量", status: "计划中", note: "控制动作。" }],
    workouts: [],
    body: []
  },
  crochet: {
    projects: [{ id: id(), name: "春日杯垫", progress: "35%", material: "棉线", note: "边缘换湖蓝。" }],
    patterns: [],
    inventory: []
  }
};

let data = loadData();
let listPage = 0;

window.addEventListener("hashchange", () => {
  listPage = 0;
  render();
});
document.addEventListener("submit", onSubmit);
document.addEventListener("click", onClick);
document.addEventListener("input", onInput);

function loadData() {
  const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem("interest-home-v1");
  if (!raw) return clone(demoData);
  try {
    return merge(clone(emptyData), JSON.parse(raw));
  } catch {
    return clone(demoData);
  }
}

function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function render() {
  const route = location.hash.slice(1) || "home";
  const view = routes[route] || renderHome;
  app.innerHTML = view();
}

const routes = {
  home: renderHome,
  birding: () => modulePage("观鸟", "记录、计划、地点", "bird", birdStats(), [
    ["新增观察", "bird-log", "binoculars"],
    ["观鸟计划", "bird-plan", "calendar"],
    ["待确认", "bird-pending", "spark"],
    ["地点", "bird-location", "map"],
    ["鸟种库", "list-birds", "bird"],
    ["观察日志", "list-birdlogs", "list"]
  ]),
  fitness: () => modulePage("健身", "计划、打卡、身体数据", "fit", fitnessStats(), [
    ["训练计划", "fitness-plan", "calendar"],
    ["训练打卡", "workout", "dumbbell"],
    ["身体数据", "body", "pulse"],
    ["训练记录", "list-workouts", "list"]
  ]),
  crochet: () => modulePage("钩织", "作品、图解、材料", "crochet", crochetStats(), [
    ["作品项目", "project", "yarn"],
    ["图解收藏", "pattern", "bookmark"],
    ["材料库存", "inventory", "box"],
    ["作品列表", "list-projects", "list"]
  ]),
  "bird-log": () => formPage("新增观察", "birding", "logs", "观鸟", [
    ["date", "日期", "date", today()],
    ["species", "鸟种", "text", "", "白鹭"],
    ["location", "地点", "text", "", "河边湿地"],
    ["count", "数量", "number", "1"],
    ["note", "备注", "textarea", "", "行为、天气、识别依据"]
  ], afterBirdLog),
  "bird-plan": () => formPage("观鸟计划", "birding", "plans", "观鸟", [
    ["date", "日期", "date", today()],
    ["location", "地点", "text", "", "城市公园"],
    ["target", "目标鸟种", "text", "", "翠鸟、鹭类"],
    ["gear", "装备", "text", "", "望远镜, 相机"],
    ["note", "备注", "textarea", "", "路线、天气、提醒"]
  ]),
  "bird-pending": () => formPage("待确认照片", "birding", "pendingPhotos", "观鸟", [
    ["date", "日期", "date", today()],
    ["candidate", "候选鸟种", "text", "", "柳莺属？"],
    ["photo", "照片引用", "text", "", "链接或文件名"],
    ["reason", "判断依据", "text", "", "翼斑、嘴型"],
    ["note", "不确定点", "textarea", "", "还需要确认什么"]
  ]),
  "bird-location": () => formPage("新增地点", "birding", "locations", "观鸟", [
    ["name", "地点", "text", "", "河边湿地"],
    ["habitat", "栖息地", "text", "", "湿地 / 公园"],
    ["season", "季节", "text", "", "春秋"],
    ["common", "常见鸟", "text", "", "白鹭、翠鸟"],
    ["note", "备注", "textarea", "", "交通、注意事项"]
  ]),
  "fitness-plan": () => formPage("训练计划", "fitness", "plans", "健身", [
    ["date", "日期", "date", today()],
    ["title", "标题", "text", "", "上肢力量"],
    ["status", "状态", "select", "计划中", "计划中|已完成|跳过"],
    ["exercises", "动作", "textarea", "", "俯卧撑 3x10；划船 3x12"],
    ["note", "备注", "text", "", "重点提醒"]
  ]),
  workout: () => formPage("训练打卡", "fitness", "workouts", "健身", [
    ["date", "日期", "date", today()],
    ["exercise", "动作", "text", "", "深蹲"],
    ["sets", "组数", "number", "3"],
    ["reps", "次数", "text", "", "12 / 45s"],
    ["load", "重量/时长", "text", "", "20kg / 30min"]
  ]),
  body: () => formPage("身体数据", "fitness", "body", "健身", [
    ["date", "日期", "date", today()],
    ["weight", "体重", "text", "", "kg"],
    ["measurements", "围度", "text", "", "腰围/臀围"],
    ["fat", "体脂", "text", "", "%"],
    ["note", "状态", "textarea", "", "睡眠、疲劳、饮食"]
  ]),
  project: () => formPage("钩织作品", "crochet", "projects", "钩织", [
    ["name", "作品名", "text", "", "春日杯垫"],
    ["progress", "进度", "text", "", "35%"],
    ["material", "材料", "text", "", "棉线"],
    ["hook", "针号", "text", "", "3.0mm"],
    ["note", "备注", "textarea", "", "针法、图片引用、想法"]
  ]),
  pattern: () => formPage("图解收藏", "crochet", "patterns", "钩织", [
    ["title", "图解名", "text", "", "花片图解"],
    ["source", "来源", "text", "", "https://"],
    ["difficulty", "难度", "text", "", "入门 / 中等"],
    ["status", "状态", "select", "想做", "想做|进行中|已完成"],
    ["note", "备注", "textarea", "", "适合材料、注意点"]
  ]),
  inventory: () => formPage("材料库存", "crochet", "inventory", "钩织", [
    ["name", "毛线", "text", "", "牛奶棉"],
    ["color", "颜色", "text", "", "湖蓝"],
    ["weight", "克重", "text", "", "50g"],
    ["stock", "库存", "text", "", "2团"],
    ["usedFor", "用于", "text", "", "春日杯垫"]
  ]),
  "list-birdlogs": () => listPageView("观察日志", "birding", "logs", "观鸟", birdLogCard),
  "list-birds": () => listPageView("鸟种库", "birding", "birds", "观鸟", birdCard),
  "list-workouts": () => listPageView("训练记录", "fitness", "workouts", "健身", workoutCard),
  "list-projects": () => listPageView("作品列表", "crochet", "projects", "钩织", projectCard),
  calendar: renderCalendar,
  settings: renderSettings
};

render();

function renderHome() {
  return shell("", "兴趣记", "观鸟 · 健身 · 钩织", `
    <section class="home-hero">
      <div class="home-copy">
        <h2>喜欢的事，分屏管理。</h2>
        <p>手机优先：一页一个任务，放不下就跳转。</p>
      </div>
      <div class="entry-grid">
        ${entry("观鸟", "记录鸟种、地点和计划", "birding", "bird")}
        ${entry("健身", "计划、打卡、身体数据", "fitness", "fit")}
        ${entry("钩织", "作品、图解和材料", "crochet", "crochet")}
      </div>
    </section>
  `, bottomNav());
}

function modulePage(title, sub, iconName, stats, actions) {
  return shell("home", title, sub, `
    <section class="stats">
      ${stats.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join("")}
    </section>
    <section class="action-grid">
      ${actions.map(([label, route, icon]) => `
        <a class="card" href="#${route}">
          <span class="icon small ${iconName}">${iconSvg(icon)}</span>
          <h3>${label}</h3>
          <p>点按进入</p>
        </a>
      `).join("")}
    </section>
  `, bottomNav());
}

function formPage(title, group, list, backLabel, fields, afterSave) {
  return shell(routeFor(backLabel), title, "保存到本机浏览器", `
    <form class="form" data-form data-group="${group}" data-list="${list}" data-after="${afterSave ? "bird-log" : ""}">
      <div class="fields">
        ${fields.map(field).join("")}
      </div>
      <div class="form-actions">
        <a class="ghost" href="#${routeFor(backLabel)}">取消</a>
        <button class="button" type="submit">保存</button>
        <a class="ghost" href="#settings">备份</a>
      </div>
    </form>
  `, "");
}

function listPageView(title, group, list, backLabel, cardFn) {
  const items = data[group][list] || [];
  const perPage = 3;
  const total = Math.max(1, Math.ceil(items.length / perPage));
  listPage = Math.min(listPage, total - 1);
  const visible = items.slice(listPage * perPage, listPage * perPage + perPage);
  return shell(routeFor(backLabel), title, `${items.length} 条记录`, `
    <section class="list">
      <div class="hint">第 ${listPage + 1} / ${total} 页</div>
      <div class="list-stack">
        ${visible.length ? visible.map((item) => cardFn(item, `${group}.${list}`)).join("") : `<div class="compact-note"><h2>暂无记录</h2><p>回到模块页新增一条。</p></div>`}
      </div>
      <div class="pager">
        <button class="ghost" data-page="-1">上一页</button>
        <a class="button" href="#${routeFor(backLabel)}">返回</a>
        <button class="ghost" data-page="1">下一页</button>
      </div>
    </section>
  `, "");
}

function renderCalendar() {
  const items = calendarItems().slice(0, 5);
  return shell("home", "共享日历", "最近 5 条", `
    <section class="list">
      <div class="hint">这里只显示最近事项，避免手机页滚动。</div>
      <div class="list-stack">
        ${items.length ? items.map((item) => simpleCard(item.title, item.date, [item.type], "")).join("") : `<div class="compact-note"><h2>暂无日程</h2><p>新增记录后会出现在这里。</p></div>`}
      </div>
      <div class="pager">
        <a class="ghost" href="#birding">观鸟</a>
        <a class="ghost" href="#fitness">健身</a>
        <a class="ghost" href="#crochet">钩织</a>
      </div>
    </section>
  `, bottomNav());
}

function renderSettings() {
  return shell("home", "设置与备份", "本地数据", `
    <section class="list">
      <div class="compact-note">
        <h2>数据只在当前浏览器</h2>
        <p>换设备前先导出 JSON，再到新设备导入。</p>
      </div>
      <div class="list-stack">
        <button class="button" data-action="export">导出 JSON</button>
        <label class="ghost">导入 JSON<input class="hidden-input" type="file" accept="application/json" data-import></label>
        <button class="danger" data-action="clear">清空本地数据</button>
      </div>
    </section>
  `, bottomNav());
}

function shell(back, title, sub, content, nav) {
  return `
    <section class="phone">
      <header class="top">
        ${back ? `<a class="back" href="#${back}" aria-label="返回">${iconSvg("left")}</a>` : `<span class="back">${iconSvg("home")}</span>`}
        <div class="title"><h1>${title}</h1><p>${sub}</p></div>
        <a class="icon-button" href="#settings" aria-label="设置">${iconSvg("settings")}</a>
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

function entry(title, desc, route, iconName) {
  return `
    <a class="entry" href="#${route}">
      <span class="icon ${iconName}">${iconSvg(iconName)}</span>
      <span><h3>${title}</h3><p>${desc}</p></span>
      <span>${iconSvg("right")}</span>
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
  location.hash = routeFor(form.dataset.group);
}

function onClick(event) {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    listPage = Math.max(0, listPage + Number(pageButton.dataset.page));
    render();
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "export") exportData();
  if (action.dataset.action === "clear" && confirm("确定清空当前浏览器里的所有数据吗？")) {
    data = clone(demoData);
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
      data = merge(clone(emptyData), JSON.parse(reader.result));
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
  return card(item, path, item.species || "未命名鸟种", item.date || "", [item.location, item.count && `${item.count} 只`], item.note);
}

function birdCard(item, path) {
  const query = encodeURIComponent(item.scientific || item.name || "");
  return card(item, path, item.name || "未命名鸟种", item.scientific || "未填学名", [
    `<a href="https://www.gbif.org/species/search?q=${query}" target="_blank">GBIF</a>`,
    `<a href="https://www.wikipedia.org/search-redirect.php?family=wikipedia&language=zh&search=${query}" target="_blank">Wiki</a>`
  ], item.note, true);
}

function workoutCard(item, path) {
  return card(item, path, item.exercise || item.title || "训练", item.date || "", [item.sets && `${item.sets} 组`, item.reps, item.load], item.note);
}

function projectCard(item, path) {
  return card(item, path, item.name || "钩织作品", item.progress || "", [item.material, item.hook], item.note);
}

function simpleCard(title, sub, pills, body) {
  return `<article class="list-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(sub)}</p><div class="pills">${pills.filter(Boolean).map((p) => `<span class="pill">${escapeHtml(p)}</span>`).join("")}</div>${body ? `<p>${escapeHtml(body)}</p>` : ""}</article>`;
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
    ...data.birding.logs.map((x) => ({ date: x.date, title: x.species, type: "观鸟" })),
    ...data.fitness.plans.map((x) => ({ date: x.date, title: x.title, type: "计划" })),
    ...data.fitness.workouts.map((x) => ({ date: x.date, title: x.exercise, type: "训练" })),
    ...data.crochet.projects.map((x) => ({ date: x.start || today(), title: x.name, type: "钩织" }))
  ].filter((x) => x.date).sort((a, b) => b.date.localeCompare(a.date));
}

function routeFor(label) {
  return { 观鸟: "birding", 健身: "fitness", 钩织: "crochet", birding: "birding", fitness: "fitness", crochet: "crochet" }[label] || "home";
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interest-home-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function iconSvg(name) {
  const icons = {
    home: `<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"></path><path d="M5 10v10h14V10"></path></svg>`,
    settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 3.1h5l.4-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4L18.9 13c.1-.3.1-.7.1-1z"></path></svg>`,
    left: `<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>`,
    right: `<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"></path></svg>`,
    bird: `<svg viewBox="0 0 24 24"><path d="M4 14c3-5 10-6 14-1l3 1-3 2c-3 4-10 4-14-2z"></path><circle cx="15.5" cy="11" r="1"></circle><path d="M8 18l-1 3M12 18l1 3"></path></svg>`,
    fit: `<svg viewBox="0 0 24 24"><path d="M3 12h4M17 12h4M7 8v8M17 8v8M9 12h6"></path></svg>`,
    crochet: `<svg viewBox="0 0 24 24"><circle cx="9" cy="14" r="5"></circle><path d="M14 5l5 15M16 4c2 1 3 3 2 5"></path></svg>`,
    binoculars: `<svg viewBox="0 0 24 24"><path d="M4 11l3-6h4v12H6a3 3 0 0 1-2-6z"></path><path d="M20 11l-3-6h-4v12h5a3 3 0 0 0 2-6z"></path></svg>`,
    calendar: `<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path></svg>`,
    spark: `<svg viewBox="0 0 24 24"><path d="M12 3l2 6 6 3-6 2-2 7-2-7-6-2 6-3z"></path></svg>`,
    map: `<svg viewBox="0 0 24 24"><path d="M9 18l-5 2V6l5-2 6 2 5-2v14l-5 2z"></path><path d="M9 4v14M15 6v14"></path></svg>`,
    list: `<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h1M3 12h1M3 18h1"></path></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24"><path d="M4 9v6M8 8v8M16 8v8M20 9v6M8 12h8"></path></svg>`,
    pulse: `<svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"></path></svg>`,
    yarn: `<svg viewBox="0 0 24 24"><circle cx="10" cy="13" r="6"></circle><path d="M5 10c5 1 8 3 11 6M8 7c2 5 2 8-1 11"></path></svg>`,
    bookmark: `<svg viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4z"></path></svg>`,
    box: `<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4-8 4z"></path><path d="M4 8v8l8 4 8-4V8"></path><path d="M12 12v8"></path></svg>`
  };
  return icons[name] || icons.list;
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
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
