/* ---------------------------------------------------------
   Сайт дизайнера интерьеров — интерактив
   1. мобильное меню   2. тень у шапки   3. появление блоков
   4. галереи проектов 5. форма заявки
   --------------------------------------------------------- */
(function () {
  'use strict';

  /* ---------- 1. мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. граница у шапки при прокрутке ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. плавное появление блоков ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 4. галереи проектов ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var btnClose = document.getElementById('lightboxClose');
  var btnPrev = document.getElementById('lightboxPrev');
  var btnNext = document.getElementById('lightboxNext');

  var gallery = [];   // фото текущего проекта
  var current = 0;
  var title = '';
  var lastFocus = null;

  function show(i) {
    if (!gallery.length) return;
    current = (i + gallery.length) % gallery.length;      // по кругу
    var item = gallery[current];
    lightboxImg.src = item.full;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = title + ' · ' + (current + 1) + ' из ' + gallery.length +
      (item.alt ? ' — ' + item.alt.toLowerCase() : '');
  }

  function openGallery(items, galleryTitle, index) {
    gallery = items;
    title = galleryTitle;
    lastFocus = document.activeElement;
    show(index);

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeGallery() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Галерея — любой блок с data-gallery: сам проект и «было — стало» внутри него.
  // Вложенные галереи не забираем, иначе кадры «до» попали бы в ленту проекта.
  function own(root, selector) {
    return Array.prototype.filter.call(root.querySelectorAll(selector), function (el) {
      return el.closest('[data-gallery]') === root;
    });
  }

  document.querySelectorAll('[data-gallery]').forEach(function (root) {
    var galleryTitle = root.getAttribute('data-gallery') || '';
    var items = own(root, 'img[data-full]').map(function (img) {
      return { full: img.getAttribute('data-full'), alt: img.alt || '' };
    });

    // порядок кликабельных элементов совпадает с порядком кадров в разметке
    own(root, '.project-cover, .strip-item, .ba-shot').forEach(function (trigger, i) {
      trigger.addEventListener('click', function () { openGallery(items, galleryTitle, i); });
    });
  });

  if (lightbox) {
    btnClose.addEventListener('click', closeGallery);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightboxImg.parentElement) closeGallery();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    // листание свайпом на телефоне
    var startX = null;
    lightbox.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  }

  /* ---------- 5. форма заявки → письмо ---------- */
  var form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var to = form.dataset.mail || '';
      var data = new FormData(form);
      var lines = [
        'Имя: ' + (data.get('name') || '—'),
        'Связь: ' + (data.get('contact') || '—'),
        'Площадь: ' + (data.get('area') || '—'),
        'Комментарий: ' + (data.get('comment') || '—')
      ];

      var href = 'mailto:' + to +
        '?subject=' + encodeURIComponent('Заявка с сайта') +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = href;

      var note = form.querySelector('.form-note');
      if (note) note.textContent = 'Открывается почтовая программа с готовым письмом — осталось нажать «Отправить».';
    });
  }
})();
