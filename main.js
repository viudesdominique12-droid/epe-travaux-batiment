/* ========================================
   E.P.E Couverture — Main JS
   ======================================== */

import { initHero3D } from './hero-3d.js';

// --- Init hero 3D ---
initHero3D();

// --- Header scroll effect ---
const header = document.getElementById('header');
const stickyCta = document.getElementById('stickyCta');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Header background
  if (scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Sticky CTA visibility
  if (scrollY > 600) {
    stickyCta.classList.add('visible');
  } else {
    stickyCta.classList.remove('visible');
  }

  // Active nav link
  updateActiveNav();
});

// --- Active navigation link ---
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__link');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      // Close mobile menu if open
      const nav = document.getElementById('nav');
      const burger = document.getElementById('burger');
      nav.classList.remove('open');
      burger.classList.remove('open');
    }
  });
});

// --- Mobile menu toggle ---
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});

// --- Scroll reveal (Intersection Observer) ---
const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale, .paint-drip');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add stagger delay for items in grids
      const parent = entry.target.parentElement;
      if (parent && parent.classList.contains('reveal-stagger')) {
        const siblings = Array.from(parent.children).filter(el =>
          el.classList.contains('reveal')
        );
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.1}s`;
      }
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// --- Gallery filter ---
const filterButtons = document.querySelectorAll('.gallery__filter');
const galleryItems = document.querySelectorAll('.gallery__item');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// --- Accordion (Detail prestations) ---
document.querySelectorAll('.accordion-item__header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const body = item.querySelector('.accordion-item__body');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.accordion-item').forEach(acc => {
      acc.classList.remove('open');
      acc.querySelector('.accordion-item__body').style.maxHeight = null;
    });

    // Open clicked if was closed
    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// --- FAQ accordion ---
document.querySelectorAll('.faq-item__question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const answer = item.querySelector('.faq-item__answer');
    const isOpen = item.classList.contains('open');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(faq => {
      faq.classList.remove('open');
      faq.querySelector('.faq-item__answer').style.maxHeight = null;
    });

    // Open clicked if was closed
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// --- Form submission ---
const form = document.getElementById('devisForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Show success message
  formSuccess.classList.add('show');

  // Reset form
  form.reset();

  // Update file label (innerHTML for SVG icon)
  const photosLabel = document.getElementById('photosLabel');
  photosLabel.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> Ajouter des photos du chantier';

  // Hide success after 3s
  setTimeout(() => {
    formSuccess.classList.remove('show');
  }, 3000);
});

// --- File input label update ---
const photosInput = document.getElementById('photos');
const photosLabel = document.getElementById('photosLabel');

photosInput.addEventListener('change', () => {
  const count = photosInput.files.length;
  if (count > 0) {
    photosLabel.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> ${count} photo${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`;
  } else {
    photosLabel.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> Ajouter des photos du chantier';
  }
});

// --- 3D Card Tilt (desktop only) ---
if (window.matchMedia('(hover: hover)').matches) {
  const tiltCards = document.querySelectorAll('.service-card, .engagement-card, .review-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
