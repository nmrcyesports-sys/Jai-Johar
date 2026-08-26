/* ============================================
   JAI JOHAR — Shared JavaScript
   ============================================ */

(function () {
  'use strict';

  // ---- Mobile nav toggle ----
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Header scroll shadow ----
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Scroll reveal (IntersectionObserver) ----
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-scale');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---- Menu tabs (menu page) ----
  function initMenuTabs() {
    var tabs = document.querySelectorAll('.menu-tab');
    var cats = document.querySelectorAll('.menu-category');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        cats.forEach(function (c) { c.classList.remove('active'); });
        tab.classList.add('active');
        var cat = document.getElementById('cat-' + target);
        if (cat) cat.classList.add('active');
      });
    });
  }

  // ---- Lightbox (gallery) ----
  function initLightbox() {
    var items = document.querySelectorAll('.gallery-item');
    var lb = document.querySelector('.lightbox');
    if (!items.length || !lb) return;
    var lbImg = lb.querySelector('.lightbox__img');
    var lbClose = lb.querySelector('.lightbox__close');
    var lbPrev = lb.querySelector('.lightbox__prev');
    var lbNext = lb.querySelector('.lightbox__next');
    var current = 0;
    var srcs = [];

    items.forEach(function (item, i) {
      var img = item.querySelector('img');
      if (img) {
        srcs.push({ src: img.src, alt: img.alt });
        item.addEventListener('click', function () {
          current = i;
          showImage();
          lb.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        });
      }
    });

    function showImage() {
      if (!srcs[current]) return;
      lbImg.src = srcs[current].src;
      lbImg.alt = srcs[current].alt;
    }

    function close() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function next() { current = (current + 1) % srcs.length; showImage(); }
    function prev() { current = (current - 1 + srcs.length) % srcs.length; showImage(); }

    if (lbClose) lbClose.addEventListener('click', close);
    if (lbNext) lbNext.addEventListener('click', next);
    if (lbPrev) lbPrev.addEventListener('click', prev);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  // ---- Toast helper ----
  window.showToast = function (title, message) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<div class="toast__icon"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div>' +
      '<div class="toast__text"><strong>' + (title || 'Success') + '</strong>' + (message || '') + '</div>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-open'); });
    setTimeout(function () {
      toast.classList.remove('is-open');
      setTimeout(function () { toast.remove(); }, 600);
    }, 4000);
  };

  // ---- Reservation form ----
  function initReservationForm() {
    var form = document.querySelector('#reservationForm');
    if (!form) return;
    // default date = tomorrow
    var dateField = form.querySelector('[name="date"]');
    if (dateField) {
      var t = new Date();
      t.setDate(t.getDate() + 1);
      dateField.value = t.toISOString().split('T')[0];
      dateField.min = new Date().toISOString().split('T')[0];
    }
    var timeField = form.querySelector('[name="time"]');
    if (timeField) timeField.value = '19:30';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var date = (data.get('date') || '').toString();
      var time = (data.get('time') || '').toString();
      var guests = (data.get('guests') || '').toString();

      if (!name || !date || !time || !guests) {
        window.showToast('Please check', 'All required fields must be filled.');
        return;
      }
      var dateObj = new Date(date + 'T' + time);
      var niceDate = dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      var niceTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Save to localStorage for Admin panel
      var resList = JSON.parse(localStorage.getItem('jaijohar_reservations') || '[]');
      resList.push({
        id: Date.now().toString(),
        name: name,
        date: date,
        time: time,
        guests: guests,
        phone: (data.get('phone') || '').toString(),
        email: (data.get('email') || '').toString(),
        occasion: (data.get('occasion') || '').toString(),
        notes: (data.get('notes') || '').toString(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('jaijohar_reservations', JSON.stringify(resList));

      window.showToast('Table requested!', name + ', ' + guests + ' on ' + niceDate + ' at ' + niceTime + '. We will call to confirm.');
      form.reset();
      if (dateField) {
        var t2 = new Date();
        t2.setDate(t2.getDate() + 1);
        dateField.value = t2.toISOString().split('T')[0];
      }
      if (timeField) timeField.value = '19:30';
    });
  }

  // ---- Contact form ----
  function initContactForm() {
    var form = document.querySelector('#contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var msg = (data.get('message') || '').toString().trim();

      if (!name || !email || !msg) {
        window.showToast('Please check', 'All fields are required.');
        return;
      }
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        window.showToast('Invalid email', 'Please enter a valid email address.');
        return;
      }

      // Save to localStorage for Admin panel
      var msgList = JSON.parse(localStorage.getItem('jaijohar_messages') || '[]');
      msgList.push({
        id: Date.now().toString(),
        name: name,
        email: email,
        phone: (data.get('phone') || '').toString(),
        subject: (data.get('subject') || '').toString(),
        message: msg,
        status: 'Unread',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('jaijohar_messages', JSON.stringify(msgList));

      window.showToast('Message sent!', 'Thank you, ' + name + '. We will reply within 24 hours.');
      form.reset();
    });
  }

  // ---- Newsletter (footer) ----
  function initNewsletter() {
    var form = document.querySelector('#newsletterForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      if (!emailOk) {
        window.showToast('Invalid email', 'Please enter a valid email address.');
        return;
      }

      // Save to localStorage for Admin panel
      var subsList = JSON.parse(localStorage.getItem('jaijohar_subscribers') || '[]');
      subsList.push({
        id: Date.now().toString(),
        email: input.value,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('jaijohar_subscribers', JSON.stringify(subsList));

      window.showToast('Subscribed!', input.value + ' has been added to our newsletter.');
      input.value = '';
    });
  }

  // ---- Init everything ----
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHeaderScroll();
    initReveal();
    initMenuTabs();
    initLightbox();
    initReservationForm();
    initContactForm();
    initNewsletter();
  });
})();
