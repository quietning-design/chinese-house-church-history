/* 背负十架 · 小组共学网站 —— 单页应用（hash 路由） */
(function () {
  "use strict";

  var CH = (window.COURSE && window.COURSE.chapters) || [];
  var app = document.getElementById("app");
  var STORE_KEY = "bfsj_quiz_v1";

  /* ---------------- 工具函数 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function nl(s) { return esc(s).replace(/\u000b/g, "<br>").replace(/\n/g, "<br>"); }
  function bullets(list) {
    if (!list || !list.length) return "";
    return '<ul class="bul">' + list.map(function (b) {
      if (Array.isArray(b)) return "<li><b>" + esc(b[0]) + "</b>" + nl(b[1]) + "</li>";
      return "<li>" + nl(b) + "</li>";
    }).join("") + "</ul>";
  }
  function loadScores() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveScore(n, score, total) {
    var all = loadScores();
    var prev = all[n] || { best: 0, attempts: 0 };
    all[n] = {
      best: Math.max(prev.best || 0, score), last: score, total: total,
      attempts: (prev.attempts || 0) + 1, at: new Date().toISOString()
    };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch (e) { /* 忽略 */ }
  }
  function chTitle(c) { return c.ch_title.replace(/^第.+?章[：:]\s*/, ""); }
  function setActive(hash) {
    document.querySelectorAll(".topnav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === hash);
    });
  }
  function pptBtn(c, cls) {
    return '<a class="btn ' + (cls || "") + '" href="' + esc(c.ppt_file) + '" download="' +
      esc(c.ppt_download_name) + '">⬇ 下载 PPT</a>';
  }
  function quizBadge(n) {
    var s = loadScores()[n];
    if (!s) return '<span class="badge">未测试</span>';
    return '<span class="badge done">最佳 ' + s.best + "/" + s.total + "</span>";
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    var scores = loadScores();
    var done = Object.keys(scores).length;
    var html = '<section class="hero">' +
      "<h1>背负十架</h1>" +
      '<p class="sub">中国家庭教会史（1807年–2018年）· 十周小组共学</p>' +
      "<p>每周主日下午一次，每次约 95 分钟：敬拜破冰 → 历史脉络串讲 → 齐读原文 → 深度讨论 → 行动挑战与回应祷告。本站提供每章导读、现场展示 PPT 下载，以及每章 10 题的在线自测。</p>" +
      '<div class="hero-stats"><span>📖 10 章 · 10 周</span><span>⏱ 每次 95 分钟</span><span>📝 ' +
      CH.reduce(function (a, c) { return a + (c.quiz ? c.quiz.length : 0); }, 0) +
      ' 道测试题</span><span>✅ 已完成测试 ' + done + "/" + CH.length + " 章</span></div>" +
      '<div class="actions" style="margin-top:20px"><a class="btn gold" href="#/ch/1">从第一章开始 →</a>' +
      '<a class="btn" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.5)" href="#/plan">查看学习方案</a></div>' +
      "</section>";

    html += '<h2 class="section-title">十周章节</h2><div class="grid">';
    CH.forEach(function (c) {
      var n = c.week_num;
      html += '<div class="card">' +
        '<div class="week">第 ' + n + " 周</div>" +
        "<h3>" + esc(c.ch_title) + "</h3>" +
        '<p class="subtitle">' + esc(c.subtitle) + "</p>" +
        '<div class="meta"><span>原书 ' + esc(c.page_range) + "</span>" + quizBadge(n) + "</div>" +
        '<div class="actions">' +
        '<a class="btn primary" href="#/ch/' + n + '">📖 阅读</a>' +
        '<a class="btn" href="#/quiz/' + n + '">📝 测试</a>' + pptBtn(c) +
        "</div></div>";
    });
    html += "</div>";
    app.innerHTML = html;
  }

  /* ---------------- 学习方案 ---------------- */
  function renderPlan() {
    var html = '<h2 class="section-title">十周学习方案</h2>' +
      '<div class="block"><h2>每次聚会流程 <span class="time">共 95 分钟</span></h2>' +
      '<div class="schedule">' +
      "<div><b>① 敬拜破冰</b><span class=\"min\">10 分钟</span><br>诗歌敬拜、分享上周行动挑战与预习触动</div>" +
      "<div><b>② 历史脉络串讲</b><span class=\"min\">10 分钟</span><br>时间线 + 三组对比，快速抓住本章主线</div>" +
      "<div><b>③ 齐读原文</b><span class=\"min\">20 分钟</span><br>轮流朗读 4 段原书摘录，标注触动之处</div>" +
      "<div><b>④ 深度讨论</b><span class=\"min\">45 分钟</span><br>3 个递进议题，每题 15 分钟，历史镜鉴照见今天</div>" +
      "<div><b>⑤ 行动挑战与回应祷告</b><span class=\"min\">10 分钟</span><br>2 项本周行动 + 7 分钟分组代祷 + 3 分钟同读结束祷告</div>" +
      "</div></div>";
    html += '<div class="block"><h2>进度安排</h2><table class="tbl"><thead><tr><th>周次</th><th>章节</th><th>时代主题</th><th>原书页码</th><th></th></tr></thead><tbody>';
    CH.forEach(function (c) {
      html += "<tr><td>第 " + c.week_num + " 周</td><td><a href=\"#/ch/" + c.week_num + "\">" + esc(c.ch_title) +
        "</a></td><td>" + esc(c.subtitle) + "</td><td>" + esc(c.page_range) + '</td><td><a href="#/quiz/' +
        c.week_num + '">测试</a></td></tr>';
    });
    html += "</tbody></table></div>";
    html += '<div class="note"><b>建议：</b>组员每周聚会前通读当章原文并浏览本站导读；聚会后一周内完成在线测试，作为复习与巩固。带领人可下载 PPT 用于现场投屏。</div>';
    app.innerHTML = html;
  }

  /* ---------------- 下载页 ---------------- */
  function renderDownloads() {
    var html = '<h2 class="section-title">PPT 下载（现场展示版）</h2>' +
      '<p class="ref">每份 14 页，16:9 宽屏，适合投影/电视展示；可用 PowerPoint、WPS 或 Keynote 打开。</p>' +
      '<table class="tbl"><thead><tr><th>周次</th><th>文件</th><th>大小</th><th></th></tr></thead><tbody>';
    CH.forEach(function (c) {
      html += "<tr><td>第 " + c.week_num + " 周</td><td>" + esc(c.ppt_download_name) + "</td><td>" +
        c.ppt_size_kb + " KB</td><td>" + pptBtn(c, "primary") + "</td></tr>";
    });
    html += "</tbody></table>";
    app.innerHTML = html;
  }

  /* ---------------- 进度页 ---------------- */
  function renderProgress() {
    var s = loadScores();
    var html = '<h2 class="section-title">我的测试进度</h2>' +
      '<table class="tbl"><thead><tr><th>章节</th><th>最佳成绩</th><th>最近一次</th><th>次数</th><th></th></tr></thead><tbody>';
    CH.forEach(function (c) {
      var r = s[c.week_num];
      html += "<tr><td>" + esc(c.ch_title) + "</td><td>" + (r ? r.best + "/" + r.total : "—") + "</td><td>" +
        (r ? r.last + "/" + r.total : "—") + "</td><td>" + (r ? r.attempts : 0) + '</td><td><a class="btn" href="#/quiz/' +
        c.week_num + '">' + (r ? "再测一次" : "开始测试") + "</a></td></tr>";
    });
    html += '</tbody></table><div class="actions" style="margin-top:16px"><button class="btn" id="reset">清除我的成绩记录</button></div>';
    app.innerHTML = html;
    document.getElementById("reset").onclick = function () {
      if (confirm("确定清除本浏览器中的全部测试记录？")) { localStorage.removeItem(STORE_KEY); renderProgress(); }
    };
  }

  /* ---------------- 章节阅读 ---------------- */
  function renderChapter(n) {
    var c = CH[n - 1];
    if (!c) return notFound();
    var sec = [
      ["sec-schedule", "本周安排"], ["sec-ice", "敬拜破冰"], ["sec-context", "历史脉络"],
      ["sec-reading", "齐读原文"], ["sec-discuss", "深度讨论"], ["sec-action", "行动挑战"],
      ["sec-prayer", "回应祷告"], ["sec-next", n < CH.length ? "下周预习" : "课程总结"]
    ];
    var toc = '<aside class="toc"><b>第 ' + n + " 周 · 目录</b>" +
      sec.map(function (s) { return '<a href="#/ch/' + n + "/" + s[0] + '">' + s[1] + "</a>"; }).join("") +
      '<div class="toc-actions"><a class="btn primary" href="#/quiz/' + n + '">📝 本章测试</a>' + pptBtn(c) + "</div></aside>";

    var h = '<div class="ch-head"><div class="week">第 ' + n + " 周 / 共 " + CH.length + " 周 · 原书 " + esc(c.page_range) + "</div>" +
      "<h1>" + esc(c.ch_title) + "</h1><p>" + esc(c.subtitle) + "</p>" +
      '<div class="actions" style="margin-top:14px"><a class="btn gold" href="#/quiz/' + n + '">📝 本章测试</a>' + pptBtn(c) + "</div></div>";

    // 本周安排
    h += block("sec-schedule", "本周学习安排", "95 分钟",
      '<div class="schedule">' +
      '<div><b>① 敬拜破冰</b><span class="min">10 分钟</span><br>' + nl(c.schedule_step1_desc) + "</div>" +
      '<div><b>② 脉络串讲</b><span class="min">10 分钟</span><br>' + nl(c.schedule_step2_desc) + "</div>" +
      '<div><b>③ 齐读原文</b><span class="min">20 分钟</span><br>' + nl(c.schedule_step3_desc) + "</div>" +
      '<div><b>④ 深度讨论</b><span class="min">45 分钟</span><br>3 个递进议题，每题约 15 分钟</div>' +
      '<div><b>⑤ 行动与祷告</b><span class="min">10 分钟</span><br>2 项行动挑战 + 回应祷告</div></div>');

    // 破冰
    h += block("sec-ice", "敬拜破冰", "10 分钟", '<div class="banner">' + nl(c.icebreaker_questions) + "</div>");

    // 脉络
    var ctx = "<h3>" + esc(c.s3_title) + '</h3><div class="timeline">' +
      (c.s3_milestones || []).map(function (m, i) {
        return '<div class="milestone' + (i % 2 ? " alt" : "") + '"><div class="yr">' + esc(m[0]) +
          '</div><div class="t">' + esc(m[1]) + "</div>" + nl(m[2]) + "</div>";
      }).join("") + "</div>";
    ctx += "<h3>" + esc(c.s4_title) + '</h3><p class="ref">' + esc(c.s4_ref) + "</p>" +
      twoCols(c.s4_left_header, c.s4_left_bullets, c.s4_right_header, c.s4_right_bullets);
    ctx += "<h3>" + esc(c.s5_title) + '</h3><p class="ref">' + esc(c.s5_ref) + '</p><div class="cols">' +
      (c.s5_cols || []).map(function (col) {
        return '<div class="col"><h4>' + esc(col[0]) + "</h4>" + bullets(col[1]) + "</div>";
      }).join("") + "</div>";
    ctx += "<h3>" + esc(c.s6_title) + '</h3><p class="ref">' + esc(c.s6_ref) + "</p>" +
      twoCols(c.s6_left_header, c.s6_left_bullets, c.s6_right_header, c.s6_right_bullets);
    h += block("sec-context", "历史脉络串讲", "10 分钟", ctx);

    // 原文
    var rd = "<h3>" + esc(c.s7_title) + "</h3>" + reading(c.reading_1) + reading(c.reading_2) +
      "<h3>" + esc(c.s8_title) + "</h3>" + reading(c.reading_3) + reading(c.reading_4);
    h += block("sec-reading", "齐读原文", "20 分钟", rd);

    // 讨论
    var ds = (c.discussions || []).map(function (d) {
      return '<div class="discussion"><h3>' + esc(d.title) + '</h3><div class="banner">' + nl(d.banner) + "</div>" +
        "<h4>" + esc(d.q1_title) + "</h4>" + bullets(d.q1_bullets) +
        "<h4>" + esc(d.q2_title) + "</h4>" + bullets(d.q2_bullets) + "</div>";
    }).join("");
    h += block("sec-discuss", "深度讨论", "45 分钟", ds);

    // 行动
    var ac = [c.challenge_1, c.challenge_2].filter(Boolean).map(function (x) {
      return '<div class="challenge"><h4>' + esc(x[0]) + "</h4>" + bullets(x[1]) + "</div>";
    }).join("");
    h += block("sec-action", "本周行动挑战", "", ac);

    // 祷告
    h += block("sec-prayer", "回应祷告", "10 分钟",
      '<div class="banner">' + nl(c.prayer_guide) + '</div><div class="prayer"><div class="pt">' +
      esc(c.closing_prayer_title) + "</div>" + nl(c.closing_prayer_text) + "</div>");

    // 下周
    h += block("sec-next", c.s14_title || "下周预习", "",
      '<p class="ref">' + esc(c.s14_ref) + "</p><p><b>" + esc(c.s14_heading) + "</b></p>" + bullets(c.s14_bullets));

    h += '<div class="pager">' +
      (n > 1 ? '<a class="btn" href="#/ch/' + (n - 1) + '">← 第 ' + (n - 1) + " 章</a>" : "<span></span>") +
      '<a class="btn primary" href="#/quiz/' + n + '">完成阅读，去做本章测试 →</a>' +
      (n < CH.length ? '<a class="btn" href="#/ch/' + (n + 1) + '">第 ' + (n + 1) + " 章 →</a>" : "<span></span>") +
      "</div>";

    app.innerHTML = '<div class="reader">' + toc + "<div>" + h + "</div></div>";
  }

  function block(id, title, time, inner) {
    return '<section class="block" id="' + id + '"><h2>' + esc(title) +
      (time ? ' <span class="time">' + esc(time) + "</span>" : "") + "</h2>" + inner + "</section>";
  }
  function twoCols(lh, lb, rh, rb) {
    return '<div class="cols"><div class="col"><h4>' + esc(lh) + "</h4>" + bullets(lb) +
      '</div><div class="col"><h4>' + esc(rh) + "</h4>" + bullets(rb) + "</div></div>";
  }
  function reading(r) {
    if (!r) return "";
    return '<div class="reading"><div class="rt">' + esc(r[0]) + '</div><div class="rx">' + nl(r[1]) + "</div></div>";
  }

  /* ---------------- 在线测试 ---------------- */
  function renderQuiz(n) {
    var c = CH[n - 1];
    if (!c) return notFound();
    var qs = c.quiz || [];
    if (!qs.length) {
      app.innerHTML = '<div class="empty">本章测试题正在准备中……<br><br><a class="btn" href="#/ch/' + n + '">返回阅读</a></div>';
      return;
    }
    var letters = ["A", "B", "C", "D", "E", "F"];
    var prev = loadScores()[n];
    var h = '<div class="quiz-head"><div><h2 class="section-title" style="margin-top:0">第 ' + n + " 章测试 · " +
      esc(chTitle(c)) + '</h2><p class="ref">共 ' + qs.length + " 题单选 · 依据原书 " + esc(c.page_range) +
      (prev ? " · 你的最佳成绩：" + prev.best + "/" + prev.total : "") + "</p></div>" +
      '<div class="actions"><a class="btn" href="#/ch/' + n + '">📖 回看本章</a></div></div>';
    h += '<div id="result"></div><form id="quiz">';
    qs.forEach(function (q, i) {
      h += '<div class="qcard" id="q' + i + '"><div class="qn">第 ' + (i + 1) + " 题" +
        (q.page ? " · " + esc(q.page) : "") + '</div><div class="qt">' + esc(q.q) + "</div>";
      q.options.forEach(function (o, j) {
        h += '<label class="opt" data-j="' + j + '"><input type="radio" name="q' + i + '" value="' + j + '">' +
          '<span><span class="letter">' + letters[j] + ".</span> " + esc(o) + "</span></label>";
      });
      h += '<div class="explain"><span class="verdict"></span> 正确答案：<b>' + letters[q.answer] + "</b>。" +
        esc(q.explain || "") + "</div></div>";
    });
    h += '</form><div class="scorebox"><span>已作答 <span class="big" id="answered">0</span> / ' + qs.length +
      '</span><span class="actions" style="margin:0"><button class="btn gold" id="submit">提交答案</button>' +
      '<button class="btn" id="retry" style="display:none">重新测试</button></span></div>';
    app.innerHTML = h;

    var form = document.getElementById("quiz");
    var answeredEl = document.getElementById("answered");
    form.addEventListener("change", function () {
      answeredEl.textContent = form.querySelectorAll("input:checked").length;
    });
    document.getElementById("submit").onclick = function () {
      var answered = form.querySelectorAll("input:checked").length;
      if (answered < qs.length && !confirm("还有 " + (qs.length - answered) + " 题未作答，确定提交吗？")) return;
      var score = 0;
      qs.forEach(function (q, i) {
        var card = document.getElementById("q" + i);
        var sel = form.querySelector('input[name="q' + i + '"]:checked');
        var v = sel ? parseInt(sel.value, 10) : -1;
        card.classList.add("locked");
        card.querySelectorAll("input").forEach(function (inp) { inp.disabled = true; });
        card.querySelectorAll(".opt").forEach(function (lab) {
          var j = parseInt(lab.getAttribute("data-j"), 10);
          if (j === q.answer) lab.classList.add("correct");
          else if (j === v) lab.classList.add("wrong");
        });
        var vd = card.querySelector(".verdict");
        if (v === q.answer) { score++; vd.textContent = "✔ 回答正确！"; vd.className = "verdict ok"; }
        else { vd.textContent = v < 0 ? "✘ 未作答。" : "✘ 回答错误。"; vd.className = "verdict no"; }
      });
      saveScore(n, score, qs.length);
      var pct = score / qs.length;
      var msg = pct === 1 ? "满分！感谢主，你对本章掌握得非常扎实。" :
        pct >= 0.8 ? "很好！可以看看错题解析，再巩固一下。" :
        pct >= 0.6 ? "及格了，建议回看本章导读与原文后再测一次。" :
        "建议重读本章原文与导读，再来挑战！";
      document.getElementById("result").innerHTML = '<div class="result"><div class="score">' + score + " / " + qs.length +
        '</div><p class="msg">' + msg + '</p><div class="actions" style="justify-content:center">' +
        (n < CH.length ? '<a class="btn primary" href="#/ch/' + (n + 1) + '">进入第 ' + (n + 1) + " 章 →</a>" :
          '<a class="btn primary" href="#/progress">查看全部进度</a>') + "</div></div>";
      this.style.display = "none";
      document.getElementById("retry").style.display = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    document.getElementById("retry").onclick = function () { renderQuiz(n); window.scrollTo(0, 0); };
  }

  function notFound() {
    app.innerHTML = '<div class="empty">页面不存在。<br><br><a class="btn" href="#/">返回首页</a></div>';
  }

  /* ---------------- 路由 ---------------- */
  function route() {
    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\/?/, "").split("/");
    setActive("#/" + (parts[0] || ""));
    var anchor = null;
    if (parts[0] === "ch") { renderChapter(parseInt(parts[1], 10)); anchor = parts[2]; }
    else if (parts[0] === "quiz") renderQuiz(parseInt(parts[1], 10));
    else if (parts[0] === "plan") renderPlan();
    else if (parts[0] === "downloads") renderDownloads();
    else if (parts[0] === "progress") renderProgress();
    else renderHome();
    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }
  window.addEventListener("hashchange", route);
  route();
})();
