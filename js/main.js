/* Open Thessaloniki — shared scripts */
(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.mobile-toggle-btn');
  var nav = document.querySelector('.main-nav');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !nav.classList.contains('open');
      if (open && typeof setSearch === 'function') setSearch(false);
      setMenu(open);
    });
    // close the menu when tapping outside it, or when the screen grows past the mobile layout
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
    });
    var mq = window.matchMedia('(min-width: 1081px)');
    var onMq = function () { if (mq.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
  }

  /* ---------- Search panel ---------- */
  var searchBtn = document.querySelector('.search-toggle-btn');
  var panel = document.querySelector('.search-modal');
  var searchInput = panel ? panel.querySelector('.search-input-field') : null;
  function setSearch(open) {
    if (!panel) return;
    panel.classList.toggle('open', open);
    searchBtn.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(function () { searchInput.focus(); }, 50);
  }
  if (searchBtn && panel) {
    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('open');
      if (open) setMenu(false);
      setSearch(open);
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target)) setSearch(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (panel && panel.classList.contains('open')) { setSearch(false); searchBtn.focus(); }
    if (nav && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Back to top ---------- */
  var fab = document.querySelector('.fab-back-to-top');
  if (fab) {
    window.addEventListener('scroll', function () {
      fab.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    fab.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
  }

  /* ---------- News: topic filters + live search ---------- */
  var articles = Array.prototype.slice.call(document.querySelectorAll('.news-card-article'));
  if (articles.length) {
    var pills = Array.prototype.slice.call(document.querySelectorAll('.filter-pill-btn'));
    var empty = document.querySelector('.no-search-results');
    var activeFilter = 'all';

    function applyNewsFilter() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var shown = 0;
      articles.forEach(function (a) {
        var cats = (a.getAttribute('data-category') || '').split(/\s+/);
        var okCat = activeFilter === 'all' || cats.indexOf(activeFilter) !== -1;
        var okText = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
        var visible = okCat && okText;
        a.hidden = !visible;
        if (visible) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        activeFilter = p.getAttribute('data-filter');
        pills.forEach(function (o) {
          var on = o === p;
          o.classList.toggle('is-active', on);
          o.setAttribute('aria-pressed', String(on));
        });
        applyNewsFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyNewsFilter);
      panel.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        applyNewsFilter();
        setSearch(false);
        var feed = document.getElementById('news-feed');
        if (feed) feed.scrollIntoView();
      });
    }
  }

  /* ---------- Lightbox (any img[data-full-img]) ---------- */
  var images = Array.prototype.slice.call(document.querySelectorAll('img[data-full-img]'));
  if (images.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Προβολή φωτογραφίας');
    dlg.innerHTML =
      '<div class="lightbox-inner">' +
      '<div class="lightbox-top"><span class="lightbox-count"></span>' +
      '<button class="lightbox-btn lightbox-close" aria-label="Κλείσιμο">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button></div>' +
      '<div class="lightbox-stage">' +
      '<button class="lightbox-btn lightbox-prev" aria-label="Προηγούμενη">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<img alt="">' +
      '<button class="lightbox-btn lightbox-next" aria-label="Επόμενη">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</button>' +
      '</div>' +
      '<p class="lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(dlg);

    var lbImg = dlg.querySelector('.lightbox-stage img');
    var lbCap = dlg.querySelector('.lightbox-caption');
    var lbCount = dlg.querySelector('.lightbox-count');
    var prevBtn = dlg.querySelector('.lightbox-prev');
    var nextBtn = dlg.querySelector('.lightbox-next');
    var current = 0;
    var lastTrigger = null;

    function show(i) {
      current = (i + images.length) % images.length;
      var src = images[current];
      lbImg.src = src.getAttribute('data-full-img');
      lbImg.alt = src.alt || '';
      lbCap.textContent = src.alt || '';
      lbCount.textContent = images.length > 1 ? (current + 1) + ' / ' + images.length : '';
      prevBtn.hidden = nextBtn.hidden = images.length < 2;
    }
    function open(i, trigger) {
      lastTrigger = trigger;
      show(i);
      dlg.showModal();
    }

    dlg.querySelector('.lightbox-close').addEventListener('click', function () { dlg.close(); });
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.classList.contains('lightbox-stage')) dlg.close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    dlg.addEventListener('close', function () {
      lbImg.removeAttribute('src');
      if (lastTrigger) lastTrigger.focus();
    });

    images.forEach(function (img, i) {
      var trigger = img.closest('button') || img;
      if (trigger === img) {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, img); }
        });
      }
      trigger.addEventListener('click', function () { open(i, trigger); });
    });
  }
})();