/* ========================================
   E.P.E Couverture — Main JS
   ======================================== */

import { initHero3D } from './hero-3d.js';

// --- Init hero 3D ---
initHero3D();

// --- Header scroll effect ---
const header = document.getElementById('header');
const stickyCta = document.getElementById('stickyCta');
const colorPalette = document.getElementById('colorPalette');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Header background
  if (scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Sticky CTA + Palette visibility
  if (scrollY > 600) {
    stickyCta.classList.add('visible');
    if (colorPalette) colorPalette.classList.add('visible');
  } else {
    stickyCta.classList.remove('visible');
    if (colorPalette) colorPalette.classList.remove('visible');
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
const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale, .paint-drip, .paint-splash');

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

// --- 3D Coverflow Carousel ---
const carousel = document.getElementById('carousel3d');
if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.carousel3d__slide'));
  const counter = document.getElementById('carouselCounter');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  function updateCarousel() {
    slides.forEach((slide, i) => {
      slide.className = 'carousel3d__slide';
      slide.removeAttribute('data-pos');
      const diff = ((i - current) % total + total) % total;
      const rdiff = diff > total / 2 ? diff - total : diff;

      if (rdiff === 0) slide.classList.add('active');
      else if (rdiff === -1) slide.classList.add('prev');
      else if (rdiff === 1) slide.classList.add('next');
      else if (rdiff === -2) slide.classList.add('far-prev');
      else if (rdiff === 2) slide.classList.add('far-next');
      // else: stays hidden (opacity: 0 by default)
    });
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    updateCarousel();
  }

  document.getElementById('carouselPrev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('carouselNext').addEventListener('click', () => goTo(current + 1));

  // Click on adjacent slides to navigate
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i !== current) goTo(i);
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx > 0 ? -1 : 1));
  });

  // Keyboard
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Auto-rotate
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('touchstart', stopAuto, { passive: true });

  updateCarousel();
  startAuto();
}

// --- Service detail modal ---
const serviceDetails = {
  couverture: ['Pose de couverture neuve', 'Rénovation de toiture existante', 'Réparation de fuites et infiltrations', 'Remplacement de tuiles cassées ou endommagées', 'Pose de velux et fenêtres de toit', 'Zinguerie et éléments d\'étanchéité'],
  charpente: ['Traitement préventif et curatif du bois', 'Entretien et renforcement de charpente', 'Consolidation de structures fragilisées', 'Remplacement de pièces de bois', 'Isolation sous toiture'],
  ravalement: ['Nettoyage haute pression des façades', 'Réparation des fissures et enduit', 'Application d\'enduit de finition', 'Imperméabilisation des murs extérieurs', 'Protection contre les intempéries'],
  peinture: ['Peinture murs extérieurs', 'Finitions esthétiques résistantes', 'Choix de couleurs et conseils', 'Application de sous-couche et finition', 'Protection UV et intempéries'],
  nettoyage: ['Démoussage de toiture', 'Nettoyage haute pression', 'Élimination des lichens et salissures', 'Nettoyage de gouttières', 'Traitement anti-mousse préventif'],
  hydrofuge: ['Diagnostic d\'humidité', 'Application de produits hydrofuges', 'Protection contre les infiltrations', 'Traitement des murs et toitures', 'Conseils prévention humidité'],
  gouttieres: ['Installation de gouttières neuves', 'Remplacement de gouttières usagées', 'Réparation de fuites', 'Nettoyage et entretien', 'Descentes d\'eau pluviale'],
  urgence: ['Intervention rapide', 'Bâchage d\'urgence', 'Réparation temporaire de fuites', 'Sécurisation de toiture endommagée', 'Devis d\'urgence gratuit']
};

const serviceModal = document.getElementById('serviceModal');
const modalIcon = serviceModal.querySelector('.service-modal__icon');
const modalTitle = serviceModal.querySelector('.service-modal__title');
const modalDesc = serviceModal.querySelector('.service-modal__desc');
const modalList = serviceModal.querySelector('.service-modal__list');

function openServiceModal(card) {
  const key = card.dataset.service;
  const details = serviceDetails[key];
  if (!details) return;

  modalIcon.innerHTML = card.querySelector('.service-card__icon').innerHTML;
  modalTitle.textContent = card.querySelector('h3').textContent;
  modalDesc.textContent = card.querySelector('p').textContent;
  modalList.innerHTML = details.map(item => `<li>${item}</li>`).join('');

  serviceModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
  serviceModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.service-card[data-service]').forEach(card => {
  card.addEventListener('click', () => openServiceModal(card));
});

serviceModal.querySelector('.service-modal__overlay').addEventListener('click', closeServiceModal);
serviceModal.querySelector('.service-modal__close').addEventListener('click', closeServiceModal);
serviceModal.querySelector('.service-modal__cta').addEventListener('click', closeServiceModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && serviceModal.classList.contains('open')) closeServiceModal();
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

  // Google Ads conversion — form submission
  // REMPLACER AW-XXXXXXXXXX/YYYYYYY par votre ID de conversion Google Ads
  if (typeof gtag === 'function') {
    gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXXX/YYYYYYY' });
    gtag('event', 'generate_lead', {
      event_category: 'formulaire',
      event_label: form.querySelector('#travaux')?.value || 'devis',
      value: 1
    });
  }

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

// --- Google Ads — Phone click tracking ---
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXXX/ZZZZZZZ' });
      gtag('event', 'click_to_call', {
        event_category: 'contact',
        event_label: link.getAttribute('href')
      });
    }
  });
});

// --- Google Ads — WhatsApp click tracking ---
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'click_whatsapp', {
        event_category: 'contact',
        event_label: 'whatsapp'
      });
    }
  });
});
