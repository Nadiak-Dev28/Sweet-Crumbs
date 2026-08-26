/* ==========================================================
   SWEET CRUMBS BAKERY — script.js
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ---------- */
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 500);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ==========================================================
     NAVIGATION
     ========================================================== */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navLinkItems = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    toggleBackToTop();
    highlightNavOnScroll();
  });

  hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.toggle('active');
    navLinks.classList.toggle('active', isActive);
    hamburger.setAttribute('aria-expanded', isActive);
  });

  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  function highlightNavOnScroll() {
    const sections = document.querySelectorAll('main section[id], .hero[id]');
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinkItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  /* ==========================================================
     SCROLL REVEAL (Intersection Observer)
     ========================================================== */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statNums.forEach(el => statsObserver.observe(el));

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ==========================================================
     SHOPPING CART
     ========================================================== */
  const CART_KEY = 'sweetCrumbsCart';
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartEmpty.style.display = 'block';
    } else {
      cartEmpty.style.display = 'none';
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <img src="${item.img}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</span>
            <div class="qty-control">
              <button class="qty-dec" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button class="qty-inc" aria-label="Increase quantity">+</button>
              <button class="remove-item" aria-label="Remove ${item.name}"><svg class="icon"><use href="#icon-trash"></use></svg></button>
            </div>
          </div>`;
        row.querySelector('.qty-inc').addEventListener('click', () => changeQty(item.id, 1));
        row.querySelector('.qty-dec').addEventListener('click', () => changeQty(item.id, -1));
        row.querySelector('.remove-item').addEventListener('click', () => removeItem(item.id));
        cartItemsEl.appendChild(row);
      });
    }
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    cartTotalEl.textContent = `PKR ${total.toLocaleString()}`;
    cartCountEl.textContent = count;
  }

  function addToCart(product, btnEl) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    showToast(`${product.name} added to cart`);
    if (btnEl) {
      btnEl.classList.add('pulsed');
      setTimeout(() => btnEl.classList.remove('pulsed'), 400);
    }
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        img: card.dataset.img
      };
      addToCart(product, btn);
      openCart();
    });
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    showToast('Redirecting to checkout... (demo)');
  });

  renderCart();

  /* ---------- Toast ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ==========================================================
     GALLERY LIGHTBOX
     ========================================================== */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentLightboxIndex = 0;

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function updateLightbox() {
    const item = galleryItems[currentLightboxIndex];
    lightboxImg.src = item.dataset.img;
    lightboxImg.alt = item.dataset.caption;
    lightboxCaption.textContent = item.dataset.caption;
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => {
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
  });
  lightboxNext.addEventListener('click', () => {
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
    updateLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  /* ==========================================================
     TESTIMONIAL SLIDER
     ========================================================== */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsWrap = document.getElementById('testimonialDots');
  let currentSlide = 0;
  let testimonialTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('span');

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    resetTestimonialTimer();
  }

  document.getElementById('testNext').addEventListener('click', () => goToSlide(currentSlide + 1));
  document.getElementById('testPrev').addEventListener('click', () => goToSlide(currentSlide - 1));

  function resetTestimonialTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
  }

  goToSlide(0);
  resetTestimonialTimer();

  /* ==========================================================
     COUNTDOWN TIMER — counts down to midnight
     ========================================================== */
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  function updateCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    cdHours.textContent = String(h).padStart(2, '0');
    cdMinutes.textContent = String(m).padStart(2, '0');
    cdSeconds.textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ==========================================================
     CONTACT FORM VALIDATION
     ========================================================== */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  function setError(fieldId, message) {
    const group = document.getElementById(fieldId).closest('.form-group');
    const errEl = document.getElementById(`err-${fieldId.replace('cf', '').toLowerCase()}`);
    if (message) {
      group.classList.add('invalid');
      if (errEl) errEl.textContent = message;
    } else {
      group.classList.remove('invalid');
      if (errEl) errEl.textContent = '';
    }
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('cfName').value.trim();
    const phone = document.getElementById('cfPhone').value.trim();
    const email = document.getElementById('cfEmail').value.trim();
    const message = document.getElementById('cfMessage').value.trim();

    if (name.length < 2) { setError('cfName', 'Please enter your name.'); valid = false; }
    else setError('cfName', '');

    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(phone)) { setError('cfPhone', 'Please enter a valid phone number.'); valid = false; }
    else setError('cfPhone', '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('cfEmail', 'Please enter a valid email.'); valid = false; }
    else setError('cfEmail', '');

    if (message.length < 10) { setError('cfMessage', 'Message should be at least 10 characters.'); valid = false; }
    else setError('cfMessage', '');

    if (!valid) return;

    formSuccess.hidden = false;
    contactForm.reset();
    setTimeout(() => { formSuccess.hidden = true; }, 5000);
  });

  /* ==========================================================
     BACK TO TOP
     ========================================================== */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    backToTop.classList.toggle('show', window.scrollY > 500);
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
