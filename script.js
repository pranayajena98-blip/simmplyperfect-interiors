// script.js — unobtrusive behavior: gallery generation, form handling, scrolling
document.addEventListener('DOMContentLoaded', () => {
  // Config
  const BUSINESS_NUMBER = '919390719623'; // confirm this before publishing
  const GALLERY_COUNT = 100; // keep if you really want 100; performance mitigated with lazy-loading

  // Smooth anchor handling is available via CSS scroll-behavior, but keep small JS for focus management
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          // allow default smooth scroll; then focus for accessibility
          setTimeout(() => {
            target.setAttribute('tabindex', '-1');
            target.focus({preventScroll: true});
          }, 250);
        }
      }
    });
  });

  // Book button scroll
  const bookBtn = document.getElementById('bookBtn');
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      const contact = document.getElementById('contact');
      if (contact) {
        contact.scrollIntoView({behavior: 'smooth', block: 'start'});
        setTimeout(() => {
          const firstInput = contact.querySelector('input, textarea, button');
          if (firstInput) firstInput.focus();
        }, 400);
      }
    });
  }

  // Populate gallery efficiently
  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid) {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= GALLERY_COUNT; i++) {
      const img = document.createElement('img');
      // use lazy loading & async decoding
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `Interior design photo ${i}`;
      // use a stable-ish Unsplash search; size varies per image
      img.src = `https://source.unsplash.com/collection/190727/800x${500 + (i % 50)}`; // randomized sizes
      frag.appendChild(img);
    }
    galleryGrid.appendChild(frag);
  }

  // Form handling
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  function showStatus(message, isError = false) {
    status.hidden = false;
    status.textContent = message;
    status.style.color = isError ? 'crimson' : '';
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendWhatsApp();
    });
  }

  // Validate, build message and open WhatsApp
  window.sendWhatsApp = function sendWhatsApp() {
    const name = (document.getElementById('name') || {}).value || '';
    const phoneRaw = (document.getElementById('phone') || {}).value || '';
    const msg = (document.getElementById('msg') || {}).value || '';

    const phoneDigits = phoneRaw.replace(/\D/g, '');
    if (!name.trim()) {
      showStatus('Please enter your name.', true);
      return;
    }
    // basic phone validation: require 10+ digits (adjust for your audience)
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      showStatus('Please enter a valid phone number (10–15 digits).', true);
      return;
    }

    const text = [
      `Hello, I am ${name.trim()}.`,
      `Phone: ${phoneDigits}`,
      `Message: ${msg.trim() || 'No message'}`,
      `I want to book a consultation.`
    ].join('\n');

    const url = `https://wa.me/${BUSINESS_NUMBER}?text=${encodeURIComponent(text)}`;

    // Open safely; include noreferrer noopener feature string for modern browsers
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      showStatus('Opening WhatsApp…', false);
      form.reset();
    } catch (err) {
      // fallback for older browsers
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      showStatus('Opening WhatsApp…', false);
      form.reset();
    }
  };

});