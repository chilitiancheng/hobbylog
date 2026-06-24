const STORE_KEY = "interest-home-v4";
const OLD_KEYS = ["interest-home-v3", "interest-home-v2", "interest-home-v1"];
const app = document.querySelector("#app");

const seedBirds = [
  ["麻雀", "Passer montanus", "城市里最常见，群体活动。"],
  ["喜鹊", "Pica pica", "黑白羽色，长尾。"],
  ["灰喜鹊", "Cyanopica cyanus", "蓝灰色长尾，常成群。"],
  ["乌鸫", "Turdus mandarinus", "雄鸟通体黑色，嘴橙黄。"],
  ["白头鹎", "Pycnonotus sinensis", "城市绿地常见。"],
  ["珠颈斑鸠", "Spilopelia chinensis", "颈侧有珠点状斑纹。"],
  ["家燕", "Hirundo rustica", "叉尾，春夏常见。"],
  ["白鹭", "Egretta garzetta", "湿地常见，黑嘴黑脚。"],
  ["池鹭", "Ardeola bacchus", "飞起时白翼明显。"],
  ["夜鹭", "Nycticorax nycticorax", "傍晚活跃。"],
  ["普通翠鸟", "Alcedo atthis", "蓝绿色背，常贴水飞行。"],
  ["黑水鸡", "Gallinula chloropus", "红额甲，池塘湿地常见。"],
  ["小䴙䴘", "Tachybaptus ruficollis", "小型水鸟，常潜水。"],
  ["大山雀", "Parus major", "黑色头顶和胸中线。"],
  ["棕背伯劳", "Lanius schach", "黑色眼罩，常停在枝头。"],
  ["戴胜", "Upupa epops", "羽冠醒目，嘴长下弯。"]
];

const baseData = {
  birding: {
    logs: [{ id: id(), date: today(), time: nowTime(), species: "白鹭", location: "河边湿地", count: "3", note: "清晨觅食，水面很安静。" }],
    birds: seedBirds.map(([name, scientific, note]) => ({ id: id(), name, scientific, note })),
    locations: [{ id: id(), name: "河边湿地", habitat: "湿地", note: "清晨人少，适合慢慢看。" }],
    plans: [],
    pendingPhotos: []
  },
  fitness: {
    plans: [{ id: id(), date: today(), time: nowTime(), title: "轻力量恢复", status: "计划中", note: "先留一个入口。" }],
    workouts: [],
    body: [],
    checkins: [],
    dailyPlans: []
  },
  crochet: {
    projects: [{
      id: id(),
      name: "春日杯垫",
      progress: "35%",
      material: "棉线",
      start: today(),
      expectedEnd: offsetDate(14),
      end: "",
      note: "边缘想换成湖蓝色。"
    }],
    sessions: [{ id: id(), projectId: "", projectName: "春日杯垫", date: today(), time: nowTime(), progress: "35%", note: "继续边缘。" }],
    patterns: [],
    inventory: []
  },
  calendar: { selectedDate: today() }
};

const checkinQuestions = [
  { key: "sleepHours", title: "睡了多久？", options: [["8", "7.5小时以上"], ["6.5", "6-7.5小时"], ["5.8", "5.5-6小时"], ["5", "少于5.5小时"]] },
  { key: "sleepQuality", title: "睡眠质量怎么样？", options: [["good", "睡得稳"], ["normal", "一般"], ["bad", "很差"]] },
  { key: "energy", title: "今天精神状态？", options: [["high", "很清醒"], ["normal", "正常"], ["low", "明显疲劳"], ["crash", "很虚"]] },
  { key: "stomach", title: "胃部状态？", options: [["ok", "正常"], ["mild", "有点不适"], ["bad", "明显不适"], ["pain", "胃疼明显"]] },
  { key: "hypoglycemia", title: "有明显低血糖吗？", options: [["no", "没有"], ["yes", "有"]] },
  { key: "chest", title: "有明显胸闷吗？", options: [["no", "没有"], ["yes", "有"]] },
  { key: "blackout", title: "有黑视吗？", options: [["no", "没有"], ["yes", "有"]] },
  { key: "cycle", title: "经期阶段？", options: [["none", "不在经期"], ["day1_3", "月经1-3天"], ["day4_7", "月经4-7天"], ["luteal", "黄体期"]] },
  { key: "muscle", title: "肌肉恢复情况？", options: [["ready", "恢复很好"], ["normal", "正常酸胀"], ["sore", "明显酸痛"], ["heavy", "沉重无力"]] },
  { key: "neck", title: "肩颈紧张程度？", options: [["low", "不紧"], ["mid", "有点紧"], ["high", "很紧"]] },
  { key: "stress", title: "今日压力？", options: [["low", "低"], ["mid", "中"], ["high", "高"]] },
  { key: "appetite", title: "今日食欲？", options: [["good", "正常"], ["low", "偏低"], ["bad", "吃不下"]] }
];

let data = loadData();
let listPage = 0;
let calendarCursor = new Date();
let checkinDraft = { step: 0, answers: {} };

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
  fitness: renderFitness,
  "fitness-checkin": renderFitnessCheckin,
  "fitness-result": renderFitnessResult,
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
  crochet: () => modulePage("钩织", "让线、图解和作品慢慢成形", crochetStats(), [
    ["作品项目", "project", "记录一件作品"],
    ["钩织打卡", "crochet-session", "今天有没有织"],
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
  project: () => formPage("钩织作品", "crochet", "projects", "crochet", [
    ["name", "作品名", "text", "", "春日杯垫"],
    ["progress", "进度", "text", "", "35%"],
    ["material", "材料", "text", "", "棉线"],
    ["start", "开始", "date", today()],
    ["expectedEnd", "预计结束", "date", offsetDate(14)],
    ["end", "完成日", "date", ""],
    ["note", "备注", "textarea", "", "针法、图片引用、想法"]
  ]),
  "crochet-session": () => formPage("钩织打卡", "crochet", "sessions", "crochet", [
    ["date", "日期", "date", today()],
    ["projectName", "作品", "text", firstProjectName(), "毯子"],
    ["progress", "进度", "text", "", "42% / 第12行"],
    ["note", "备注", "textarea", "", "今天织了什么"]
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
  "list-projects": () => listPageView("作品列表", "crochet", "projects", "crochet", projectCard),
  calendar: renderCalendar,
  "calendar-day": renderCalendarDay,
  settings: renderSettings
};

render();
saveData();

function loadData() {
  let loaded = null;
  for (const key of [STORE_KEY, ...OLD_KEYS]) {
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
  merged.fitness.checkins ||= [];
  merged.fitness.dailyPlans ||= [];
  merged.crochet.sessions ||= [];
  merged.calendar ||= { selectedDate: today() };
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
  app.innerHTML = (routes[route] || renderHome)();
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
        ${entry("健身", "先判断状态，再决定今天怎么练", "fitness")}
        ${entry("钩织", "从一团线开始，留下进度和灵感", "crochet")}
      </div>
    </section>
  `, bottomNav(), true);
}

function renderFitness() {
  const latest = latestFitnessPlan();
  const theme = todayTheme();
  return shell("home", "健身", "今天先判断，再训练", `
    <section class="fitness-home">
      <div class="today-card">
        <span>今日主题</span>
        <strong>${theme.label}</strong>
        <p>${theme.short}</p>
      </div>
      <a class="primary-tile" href="#fitness-checkin" data-reset-checkin="1">
        <strong>开始今日判断</strong>
        <span>一题一答，生成今日计划</span>
      </a>
      <div class="result-mini">
        <span>最近结果</span>
        <strong>${latest ? `${latest.level}级` : "未判断"}</strong>
        <p>${latest ? latest.summary : "完成问卷后会显示今日建议。"}</p>
      </div>
      <div class="mini-actions">
        <a class="ghost" href="#workout">训练打卡</a>
        <a class="ghost" href="#body">身体数据</a>
      </div>
    </section>
  `, bottomNav());
}

function renderFitnessCheckin() {
  const question = checkinQuestions[checkinDraft.step] || checkinQuestions[0];
  const progress = checkinDraft.step + 1;
  return shell("fitness", "状态问卷", `${progress} / ${checkinQuestions.length}`, `
    <section class="question-screen">
      <div class="question-card">
        <span>问题 ${progress}</span>
        <h2>${question.title}</h2>
        <div class="answer-stack">
          ${question.options.map(([value, label]) => `<button class="answer" data-answer="${question.key}" data-value="${value}">${label}</button>`).join("")}
        </div>
      </div>
      <div class="pager">
        <button class="ghost" data-checkin-back>上一题</button>
        <a class="button" href="#fitness">退出</a>
        <button class="ghost" data-checkin-reset>重来</button>
      </div>
    </section>
  `, "");
}

function renderFitnessResult() {
  const latest = latestFitnessPlan();
  if (!latest) return renderFitness();
  return shell("fitness", "今日计划", "按状态生成", `
    <section class="result-screen">
      <div class="grade-card level-${latest.level}">
        <div>
          <span>等级</span>
          <strong>${latest.level}</strong>
        </div>
        <p>${latest.summary}</p>
      </div>
      <div class="plan-card">
        <span>今日计划</span>
        <h2>${latest.title}</h2>
        <div class="plan-lines">
          ${latest.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        </div>
      </div>
      <div class="pager">
        <a class="ghost" href="#fitness-checkin" data-reset-checkin="1">重测</a>
        <a class="button" href="#workout">记录</a>
        <a class="ghost" href="#fitness">返回</a>
      </div>
    </section>
  `, "");
}

function modulePage(title, sub, stats, actions) {
  return shell("home", title, sub, `
    <section class="stats">
      ${stats.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join("")}
    </section>
    <section class="action-grid ${actions.length > 6 ? "dense" : ""}">
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
  const timeline = calendarTimeline();
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);
    const classes = ["day"];
    if (date.getMonth() !== month) classes.push("muted");
    if (key === today()) classes.push("today");
    const main = mainEventForDay(key, timeline.events);
    const spans = timeline.spans.filter((span) => dateInRange(key, span.start, span.end));
    return `
      <button class="${classes.join(" ")}" data-calendar-day="${key}">
        <span class="day-num">${date.getDate()}</span>
        <span class="day-main">${main ? escapeHtml(main.label) : ""}</span>
        <span class="span-stack">${spans.slice(0, 2).map((span) => spanBand(span, key)).join("")}</span>
      </button>
    `;
  }).join("");

  return shell("home", "日历", "兴趣进展时间线", `
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

function renderCalendarDay() {
  const selected = data.calendar.selectedDate || today();
  const timeline = calendarTimeline();
  const events = timeline.events.filter((event) => event.date === selected).sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  const spans = timeline.spans.filter((span) => dateInRange(selected, span.start, span.end));
  return shell("calendar", selected.slice(5), "当天详情", `
    <section class="list">
      <div class="hint">${events.length || spans.length ? "当天记录" : "这天还没有记录。"}</div>
      <div class="list-stack">
        ${events.map((event) => detailCard(event.label, event.detail, [event.type])).join("")}
        ${spans.map((span) => detailCard(`钩织-${span.name}`, isCrochetActive(span, selected) ? "当天有钩织打卡" : "跨度内未打卡，日历用虚线", [span.start, span.end])).join("")}
        ${!events.length && !spans.length ? `<div class="compact-note"><h2>空白的一天</h2><p>新增记录后会出现在这里。</p></div>` : ""}
      </div>
      <div class="pager">
        <a class="ghost" href="#bird-log">观鸟</a>
        <a class="button" href="#calendar">返回</a>
        <a class="ghost" href="#crochet-session">钩织</a>
      </div>
    </section>
  `, "");
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
  item.time = nowTime();
  data[form.dataset.group][form.dataset.list].unshift(item);
  if (form.dataset.after === "bird-log") afterBirdLog(item);
  saveData();
  location.hash = form.dataset.back;
}

function onClick(event) {
  const reset = event.target.closest("[data-reset-checkin]");
  if (reset) {
    checkinDraft = { step: 0, answers: {} };
  }

  const answer = event.target.closest("[data-answer]");
  if (answer) {
    checkinDraft.answers[answer.dataset.answer] = answer.dataset.value;
    if (checkinDraft.step < checkinQuestions.length - 1) {
      checkinDraft.step += 1;
      render();
    } else {
      finishCheckin();
    }
    return;
  }

  if (event.target.closest("[data-checkin-back]")) {
    checkinDraft.step = Math.max(0, checkinDraft.step - 1);
    render();
    return;
  }

  if (event.target.closest("[data-checkin-reset]")) {
    checkinDraft = { step: 0, answers: {} };
    render();
    return;
  }

  const day = event.target.closest("[data-calendar-day]");
  if (day) {
    data.calendar.selectedDate = day.dataset.calendarDay;
    saveData();
    location.hash = "calendar-day";
    return;
  }

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

function finishCheckin() {
  const result = evaluateCheckin(checkinDraft.answers);
  const theme = todayTheme();
  const plan = makeDailyPlan(result.level, theme);
  const checkin = {
    id: id(),
    date: today(),
    time: nowTime(),
    theme: theme.label,
    level: result.level,
    summary: result.summary,
    answers: { ...checkinDraft.answers }
  };
  data.fitness.checkins.unshift(checkin);
  data.fitness.dailyPlans.unshift({
    id: id(),
    date: today(),
    time: nowTime(),
    theme: theme.label,
    level: result.level,
    title: plan.title,
    summary: result.summary,
    lines: plan.lines
  });
  saveData();
  location.hash = "fitness-result";
}

function evaluateCheckin(answers) {
  const dTrigger = answers.chest === "yes" || answers.blackout === "yes" || answers.hypoglycemia === "yes" || answers.stomach === "pain" || (Number(answers.sleepHours) < 5.5 && ["low", "crash"].includes(answers.energy));
  if (dTrigger) return { level: "D", summary: "恢复崩溃，只做恢复。" };

  const cTrigger = Number(answers.sleepHours) < 6 || answers.stomach === "bad" || answers.energy === "crash" || answers.cycle === "day1_3" || answers.muscle === "heavy";
  if (cTrigger) return { level: "C", summary: "明显疲劳，保主题但取消高刺激。" };

  const bSignals = [answers.sleepQuality === "bad", answers.energy === "low", answers.stomach === "mild", answers.cycle === "luteal", answers.muscle === "sore", answers.neck === "high", answers.stress === "high", answers.appetite === "bad"].filter(Boolean).length;
  if (bSignals >= 2) return { level: "B", summary: "轻疲劳，保主项并降低刺激。" };

  const sSignals = [Number(answers.sleepHours) >= 7.5, answers.sleepQuality === "good", answers.energy === "high", answers.muscle === "ready", answers.stress === "low", answers.appetite === "good"].filter(Boolean).length;
  if (sSignals >= 5) return { level: "S", summary: "恢复很好，可以稳定推进。" };

  return { level: "A", summary: "状态稳定，正常训练。" };
}

function makeDailyPlan(level, theme) {
  if (level === "D") {
    return { title: "恢复日", lines: ["八段锦 / 呼吸 / 拉伸 / 快走任选。", "禁止力量、HIIT、爆发拳击。", "吃容易消化的碳水和蛋白，不要热量腰斩。"] };
  }
  if (level === "C") {
    return { title: `${theme.label} · 技术版`, lines: [`保留${theme.label}主题。`, "取消高刺激，动作做轻量稳定版。", theme.cPlan, "不追重量，不做爆发。"] };
  }
  if (level === "B") {
    return { title: `${theme.label} · 降刺激`, lines: [`保留${theme.label}主项。`, "重量 -20%，容量 -20%-40%。", "不追PR，拳击取消重拳和高速组合。", theme.bPlan] };
  }
  if (level === "S") {
    return { title: `${theme.label} · 可推进`, lines: [theme.aPlan, "动作稳定可小幅推进。", "永远保留1-2次余力。"] };
  }
  return { title: `${theme.label} · 正常训练`, lines: [theme.aPlan, "稳定完成即可。", "不硬顶，不力竭成瘾。"] };
}

function todayTheme(date = new Date()) {
  const day = date.getDay();
  const themes = {
    1: { label: "下肢", short: "蹲类 / 髋主导 / 单侧稳定", aPlan: "蹲类、罗马尼亚硬拉、保加利亚分腿蹲、核心稳定。", bPlan: "蹲类和RDL降重，单侧动作少做1-2组。", cPlan: "呼吸深蹲、臀桥、轻核心、稳定训练。" },
    2: { label: "上肢", short: "背阔 / 上背 / 肩 / 推", aPlan: "高位下拉、划船、侧平举、哑铃推举。", bPlan: "背部和肩部保留，侧平举减组。", cPlan: "轻划船、弹力带下拉、肩胛控制。" },
    3: { label: "恢复", short: "呼吸 / 拉伸 / 快走", aPlan: "八段锦、呼吸、拉伸或快走。", bPlan: "快走减量，拉伸放慢。", cPlan: "呼吸和轻拉伸。" },
    4: { label: "下肢", short: "蹲类 / 髋主导 / 单侧稳定", aPlan: "蹲类、罗马尼亚硬拉、保加利亚分腿蹲、核心稳定。", bPlan: "蹲类和RDL降重，单侧动作少做1-2组。", cPlan: "呼吸深蹲、臀桥、轻核心、稳定训练。" },
    5: { label: "上肢", short: "背阔 / 上背 / 肩 / 推", aPlan: "高位下拉、划船、侧平举、哑铃推举。", bPlan: "背部和肩部保留，侧平举减组。", cPlan: "轻划船、弹力带下拉、肩胛控制。" },
    6: { label: "拳击", short: "步伐 / 空击 / 组合", aPlan: "步伐、空击、组合拳或沙袋。", bPlan: "只做技术空击和步伐。", cPlan: "取消拳击或只做轻步伐。" },
    0: { label: "恢复", short: "呼吸 / 拉伸 / 快走", aPlan: "八段锦、呼吸、拉伸或快走。", bPlan: "快走减量，拉伸放慢。", cPlan: "呼吸和轻拉伸。" }
  };
  return themes[day];
}

function latestFitnessPlan() {
  return data.fitness.dailyPlans?.[0] || null;
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
  return card(item, path, item.name || "钩织作品", item.progress || "", [item.material, item.start, item.expectedEnd || item.end], item.note);
}

function detailCard(title, sub, pills) {
  return `<article class="list-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(sub || "")}</p><div class="pills">${pills.filter(Boolean).map((pill) => `<span class="pill">${escapeHtml(pill)}</span>`).join("")}</div></article>`;
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
  return [[data.fitness.dailyPlans?.length || 0, "判断"], [data.fitness.workouts.length, "打卡"], [data.fitness.body.length, "身体"]];
}

function crochetStats() {
  return [[data.crochet.projects.length, "作品"], [data.crochet.sessions?.length || 0, "打卡"], [data.crochet.inventory.length, "材料"]];
}

function calendarTimeline() {
  const events = [
    ...data.birding.logs.map((x) => ({ date: x.date, time: x.time || "08:00", label: `观鸟-${x.species || "记录"}`, detail: x.location || x.note || "", type: "观鸟", kind: "birding" })),
    ...data.fitness.dailyPlans.map((x) => ({ date: x.date, time: x.time || "09:00", label: `健身-${x.theme}`, detail: `${x.level}级 ${x.title}`, type: "健身", kind: "fitness" })),
    ...data.fitness.workouts.map((x) => ({ date: x.date, time: x.time || "20:00", label: `健身-${x.exercise || "打卡"}`, detail: x.load || x.note || "", type: "健身", kind: "fitness" })),
    ...data.crochet.sessions.map((x) => ({ date: x.date, time: x.time || "21:00", label: `钩织-${x.projectName || "打卡"}`, detail: x.progress || x.note || "", type: "钩织", kind: "crochet" }))
  ].filter((x) => x.date);

  const spans = data.crochet.projects
    .filter((project) => project.start && (project.end || project.expectedEnd))
    .map((project) => ({
      id: project.id,
      name: project.name,
      start: project.start,
      end: project.end || project.expectedEnd,
      sessions: data.crochet.sessions.filter((session) => (session.projectName || "") === project.name).map((session) => session.date)
    }));

  return { events, spans };
}

function mainEventForDay(date, events) {
  return events.filter((event) => event.date === date).sort((a, b) => (b.time || "").localeCompare(a.time || ""))[0];
}

function spanBand(span, date) {
  const active = isCrochetActive(span, date);
  const label = date === span.start ? `钩织-${span.name}` : "";
  return `<i class="span-band ${active ? "" : "dashed"}">${escapeHtml(label)}</i>`;
}

function isCrochetActive(span, date) {
  return span.sessions.includes(date) || date === span.start;
}

function dateInRange(date, start, end) {
  return date >= start && date <= end;
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
    crochet: { ...base.crochet, ...(extra.crochet || {}) },
    calendar: { ...base.calendar, ...(extra.calendar || {}) }
  };
}

function firstProjectName() {
  return data.crochet.projects[0]?.name || "";
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

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
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
