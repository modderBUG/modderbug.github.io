/* ═══════════════════════════════════════════════════════════
   WU XIAOWEI — 个人主页 · 交互脚本
   modderbug.github.io / static/js/geek.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────
     1. 矩阵数字雨背景
     ────────────────────────────────────────────── */
  var canvas = document.getElementById("matrix-rain");
  var ctx = canvas.getContext("2d");
  // 温馨粉主题：背景流动改为 0-9 数字，极浅淡粉，不影响上层文字
  var glyphs = "0123456789";
  var fontSize = 16;
  var columns = 0;
  var drops = [];
  var resizeTimer = null;

  function resizeMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height / fontSize);
    }
  }

  function drawMatrix() {
    // 浅色背景拖尾：几乎透明的白粉色
    ctx.fillStyle = "rgba(255, 246, 249, 0.09)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + "px 'Cascadia Code', Consolas, monospace";
    for (var i = 0; i < columns; i++) {
      var ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      var x = i * fontSize;
      var y = drops[i] * fontSize;
      // 数字颜色：淡粉柔和可见（浅底上仍显清浅，不干扰正文）
      ctx.fillStyle = Math.random() > 0.975 ? "rgba(255, 120, 175, 0.55)" : "rgba(255, 130, 180, 0.30)";
      ctx.fillText(ch, x, y);
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resizeMatrix();
  var matrixInterval = setInterval(drawMatrix, 70);
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeMatrix, 200);
  });

  /* ──────────────────────────────────────────────
     2. Hero 终端打字机效果
     ────────────────────────────────────────────── */
  function typeTerminal() {
    var lines = document.querySelectorAll("#term-body .term-line[data-type]");
    var idx = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      lines.forEach(function (l) { l.style.opacity = 1; });
      return;
    }
    // 初始全部透明
    lines.forEach(function (l) { l.style.opacity = 0; });

    function revealLine() {
      if (idx >= lines.length) return;
      var line = lines[idx];
      var speed = parseFloat(line.getAttribute("data-type")) * 1000;
      var pause = parseInt(line.getAttribute("data-pause") || "0", 10);
      var text = line.textContent.replace(/\u00a0/g, " ");
      var prompt = line.querySelector(".t-prompt");
      var out = line.querySelector(".t-out");

      if (out) {
        // 逐字输出
        var full = out.textContent;
        out.textContent = "";
        line.style.opacity = 1;
        var charIdx = 0;
        var tick = setInterval(function () {
          charIdx++;
          out.textContent = full.slice(0, charIdx);
          if (charIdx >= full.length) {
            clearInterval(tick);
            idx++;
            setTimeout(revealLine, pause);
          }
        }, speed);
      } else {
        // 单行整体淡入
        line.style.opacity = 1;
        idx++;
        setTimeout(revealLine, pause);
      }
    }
    // 等待页面首帧，保证动画顺滑
    requestAnimationFrame(function () {
      setTimeout(revealLine, 500);
    });
  }
  typeTerminal();

  /* ──────────────────────────────────────────────
     3. 技术栈滚动流（tag-stream 终端行）
     ────────────────────────────────────────────── */
  function startTagStream() {
    var el = document.querySelector("#tag-stream .t-out");
    if (!el) return;
    var tags = [
      "DeepSeek-32B", "Qwen2.5-72B", "GLM4-9B", "LLAMA3.1", "Ascend 910B3",
      "Hygon DCU", "CANN", "MindSpore", "ROCm", "DeepSpeed-ZeRO3", "FSDP",
      "Megatron-LM", "QLoRA", "GRPO", "RLHF", "DPO", "vLLM", "llama.cpp",
      "GPTQ-Int4", "AWQ", "FlashAttention-2", "FlashMLA", "Triton", "ONNX",
      "MinerU", "Neo4j", "Seraph", "Milvus", "LangChain", "Dify", "Coze",
      "YOLOv10", "CLIP", "BLIP", "PaddleOCRv4", "echomimicv2", "UIE",
      "STA*", "Reeds-Shepp", "DWA", "A*", "D*"
    ];
    var i = 0;
    setInterval(function () {
      el.textContent = tags[i % tags.length] + " →";
      i++;
    }, 420);
  }
  startTagStream();

  /* ──────────────────────────────────────────────
     4. 滚动渐显 + 顶栏导航高亮
     ────────────────────────────────────────────── */
  function initScrollEffects() {
    var blocks = document.querySelectorAll("[data-block]");
    var navLinks = document.querySelectorAll(".topbar-nav a");
    var sections = [];
    blocks.forEach(function (b) { sections.push(b); });

    // IntersectionObserver 渐显
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
      blocks.forEach(function (b) { io.observe(b); });
    } else {
      blocks.forEach(function (b) { b.classList.add("visible"); });
    }

    // 滚动监听导航高亮
    var navMap = {};
    navLinks.forEach(function (a) {
      var key = a.getAttribute("data-nav");
      if (key) navMap[key] = a;
    });

    function onScroll() {
      var pos = window.scrollY + 130;
      var current = null;
      sections.forEach(function (s) {
        if (s.offsetTop <= pos) current = s.id;
      });
      navLinks.forEach(function (a) { a.classList.remove("active"); });
      if (current && navMap[current]) navMap[current].classList.add("active");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  initScrollEffects();

  /* ──────────────────────────────────────────────
     5. 移动端导航折叠
     ────────────────────────────────────────────── */
  function initNavToggle() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("topbar-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
  initNavToggle();

  /* ──────────────────────────────────────────────
     6. 顶部状态条时钟
     ────────────────────────────────────────────── */
  function initClock() {
    var el = document.getElementById("topbar-status");
    if (!el) return;
    function tick() {
      var d = new Date();
      var h = String(d.getHours()).padStart(2, "0");
      var m = String(d.getMinutes()).padStart(2, "0");
      var s = String(d.getSeconds()).padStart(2, "0");
      el.innerHTML = "UPTIME: 7Y·1M·MGMT <span class='blink'>▮</span> " + h + ":" + m + ":" + s;
    }
    tick();
    setInterval(tick, 1000);
  }
  initClock();

  /* ──────────────────────────────────────────────
     7. 控制台彩蛋（F12 有惊喜）
     ────────────────────────────────────────────── */
  console.log(
    "%c\n  ██╗   ██╗██╗    ██╗ █████╗ ██╗\n  ██║   ██║██║    ██║██╔══██╗██║\n  ██║   ██║██║ █╗ ██║███████║██║\n  ╚██╗ ██╔╝██║███╗██║██╔══██║██║\n   ╚████╔╝ ╚███╔███╔╝██║  ██║███████╗\n    ╚═══╝   ╚══╝╚══╝  ╚═╝  ╚═╝╚══════╝\n",
    "color: #ff6fa5; font-size: 11px;"
  );
  console.log(
    "%c吴晓伟 · 大模型算法工程师 · 国产化算子适配\n7 年算法工程 / 1 年管理 · 昇腾 NPU / 海光 DCU 全流程交付\nmail: wxw.smile.ex@gmail.com · tel: 15210908048",
    "color: #b48adf; font-size: 13px;"
  );
})();
