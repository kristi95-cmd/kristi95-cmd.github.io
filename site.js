/* Общий скрипт сайта. Каждый блок включается, только если на странице есть то,
   с чем он работает, и если доехала нужная библиотека. Без js страница остается
   полностью читаемой, просто без движения. */

(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var home = !!document.getElementById('list');

  /* ---------- занавес: прелоадер на главной, переход везде ---------- */

  var curtain = document.getElementById('curtain');
  var curtainN = document.getElementById('curtain-n');
  var madeHere = false;

  if (!curtain && !reduce) {
    curtain = document.createElement('div');
    curtain.id = 'curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.style.cssText = 'position:fixed;inset:0;z-index:90;background:#0A0B0C;transform:translateY(101%);pointer-events:none';
    document.body.appendChild(curtain);
    madeHere = true;
  }

  if (curtain && !madeHere) {
    if (reduce) {
      curtain.style.display = 'none';
    } else {
      var t0 = Date.now(), span = 900;
      (function count() {
        var k = Math.min(1, (Date.now() - t0) / span);
        if (curtainN) curtainN.textContent = String(Math.round(k * 100)).padStart(2, '0');
        if (k < 1) requestAnimationFrame(count);
        else {
          curtain.style.transition = 'transform .9s cubic-bezier(.76,0,.24,1)';
          curtain.style.transform = 'translateY(-101%)';
          setTimeout(function () { curtain.style.display = 'none'; }, 950);
        }
      })();
    }
  }

  function leaveTo(url) {
    if (!curtain || reduce) { location.href = url; return; }
    curtain.style.display = 'block';
    curtain.style.transition = 'none';
    curtain.style.transform = 'translateY(101%)';
    if (curtainN) curtainN.textContent = '00';
    void curtain.offsetHeight;
    curtain.style.transition = 'transform .55s cubic-bezier(.76,0,.24,1)';
    curtain.style.transform = 'translateY(0)';
    setTimeout(function () { location.href = url; }, 520);
  }

  /* ---------- курсор ---------- */

  var cursor = document.getElementById('cursor');
  if (!cursor && fine && !reduce) {
    cursor = document.createElement('div');
    cursor.id = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText = 'position:fixed;top:0;left:0;z-index:95;pointer-events:none;width:12px;height:12px;border-radius:50%;background:#fff;mix-blend-mode:difference;transition:width .25s ease,height .25s ease';
    document.body.appendChild(cursor);
  }

  var px = innerWidth / 2, py = innerHeight / 2, cx = px, cy = py;

  if (cursor && fine && !reduce) {
    addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; });
    (function loop() {
      cx += (px - cx) * 0.22;
      cy += (py - cy) * 0.22;
      cursor.style.transform = 'translate(' + (cx - 6) + 'px,' + (cy - 6) + 'px)';
      requestAnimationFrame(loop);
    })();
    var grow = function () { cursor.style.width = '48px'; cursor.style.height = '48px'; cursor.style.marginLeft = '-18px'; cursor.style.marginTop = '-18px'; };
    var shrink = function () { cursor.style.width = '12px'; cursor.style.height = '12px'; cursor.style.marginLeft = '0'; cursor.style.marginTop = '0'; };
    document.querySelectorAll('a,button,summary').forEach(function (el) {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ---------- главная: скриншот работы фоном ---------- */

  var bgs = document.getElementById('bgs');
  if (bgs) {
    var figs = bgs.querySelectorAll('figure');
    var items = document.querySelectorAll('#list .item');
    var show = function (k) {
      figs.forEach(function (f) { f.classList.toggle('on', f.dataset.k === k); });
    };
    items.forEach(function (it) {
      it.addEventListener('mouseenter', function () { show(it.dataset.k); });
      it.addEventListener('focus', function () { show(it.dataset.k); });
    });
    var list = document.getElementById('list');
    if (list) list.addEventListener('mouseleave', function () { show(null); });
  }

  /* ---------- бегущая строка: скорость идет за курсором ---------- */

  var ticker = document.getElementById('ticker');
  var tickWrap = document.getElementById('tick');

  if (ticker) {
    var SERVICES = [
      ['Ведение соцсетей',            'content-case.html'],
      ['Контент-план на месяц',       'content-case.html'],
      ['Копирайтинг',                 'texts.html'],
      ['Тексты до и после',           'texts.html'],
      ['Монтаж вертикального видео',  '#do'],
      ['UGC на английском',           '#do'],
      ['Сценарии и раскадровки',      'content-case.html'],
      ['Таргет в инстаграме и вк',    '#do'],
      ['Яндекс.Директ',               '#do'],
      ['Чат-боты',                    'bot.html'],
      ['Оформление презентаций',      'deck.html'],
      ['Страницы под услугу',         'expert.html'],
      ['Разговорный английский',      'english.html'],
      ['Посчитать стоимость',         'calc.html']
    ];

    ticker.innerHTML = SERVICES.map(function (it) {
      return '<a href="' + it[1] + '">' + it[0] + '</a>';
    }).join('').repeat(2);

    var BASE = 0.5;     // спокойный ход, когда курсора нет
    var MAX  = 7;       // у самого края
    var speed = BASE;
    var target = BASE;
    var offset = 0;
    var half = 0;

    function measure() { half = ticker.scrollWidth / 2; }
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    function frame() {
      speed += (target - speed) * 0.08;      // мягкий разгон и торможение
      if (half) {
        offset -= speed;
        if (offset <= -half) offset += half;
        if (offset > 0) offset -= half;
      }
      ticker.style.transform = 'translate3d(' + offset.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(frame);
    }

    if (!reduce) {
      frame();

      if (tickWrap) {
        tickWrap.addEventListener('mousemove', function (e) {
          var r = tickWrap.getBoundingClientRect();
          var n = (e.clientX - r.left) / r.width * 2 - 1;   // -1 слева, +1 справа
          // мертвая зона в центре, чтобы можно было спокойно прицелиться в пункт
          if (Math.abs(n) < 0.18) n = 0;
          else n = (n - Math.sign(n) * 0.18) / 0.82;
          target = n * MAX;
          tickWrap.classList.add('is-touched');
        });
        tickWrap.addEventListener('mouseleave', function () { target = BASE; });
      }
    } else {
      ticker.style.transform = 'none';
    }
  }

  /* ---------- плавный скролл и переходы по ссылкам ---------- */

  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href) return;

    if (href.charAt(0) === '#') {
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    if (/\.html$/.test(href) && !/^https?:/.test(href)) {
      e.preventDefault();
      leaveTo(href);
    }
  });

  /* ---------- появление блоков ---------- */

  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.lagSmoothing(0); }

    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 28, duration: .85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    if (home) {
      var marks = document.querySelectorAll('.do__side li');
      gsap.utils.toArray('.do__g').forEach(function (g, i) {
        ScrollTrigger.create({
          trigger: g, start: 'top 55%', end: 'bottom 55%',
          onToggle: function (self) {
            if (!self.isActive) return;
            marks.forEach(function (m) { m.classList.remove('on'); });
            if (marks[i]) marks[i].classList.add('on');
          }
        });
      });
    }
  } else if (!reduce && 'IntersectionObserver' in window) {
    /* без gsap блоки проявляются своими силами. Если разметка не разложена
       вручную по .reveal, берем крупные куски страницы как они стоят. */
    var marked = document.querySelectorAll('.reveal');
    var targets = marked.length ? marked : document.querySelectorAll(
      '.band > .wrap > *, .hero > .wrap > *, section.hero > *, .cases > .case, .svc > .svc__row'
    );

    if (targets.length) {
      document.documentElement.classList.add('has-reveal');
      targets.forEach(function (el) { el.classList.add('reveal'); });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

      targets.forEach(function (el) { io.observe(el); });
    }
  }
})();
