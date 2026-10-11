'use strict';

const INQUIRY_RECIPIENT = 'iyahbartolome.10@gmail.com';
const PUBLIC_BUSINESS_EMAIL = 'iyahbartolome.10@gmail.com';
const MINIMUM_BOOKING_DAYS = 7;
const MINIMUM_GUESTS = 4;

const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-navigation');
const navBackdrop = document.querySelector('.nav-backdrop');
const navClose = document.querySelector('.nav-close');
const body = document.body;

function closeMenu() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  primaryNav.classList.remove('is-open');
  navBackdrop?.classList.remove('is-visible');
  body.classList.remove('menu-open');
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    primaryNav.classList.toggle('is-open', !isOpen);
    navBackdrop?.classList.toggle('is-visible', !isOpen);
    body.classList.toggle('menu-open', !isOpen);
  });
  primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  navBackdrop?.addEventListener('click', closeMenu);
  navClose?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
}

// Five-photo hero slideshow. Only the hero background changes; content and layout stay still.
const heroSlides = [...document.querySelectorAll('.hero-slide')];
if (heroSlides.length > 1) {
  const reduceHeroMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeHeroSlide = 0;
  let heroSlideTimer = null;
  const showHeroSlide = nextIndex => {
    heroSlides[activeHeroSlide].classList.remove('is-active');
    activeHeroSlide = nextIndex;
    heroSlides[activeHeroSlide].classList.add('is-active');
  };
  const startHeroSlideshow = () => {
    if (reduceHeroMotion.matches || document.hidden || heroSlideTimer) return;
    heroSlideTimer = window.setInterval(() => {
      showHeroSlide((activeHeroSlide + 1) % heroSlides.length);
    }, 6500);
  };
  const stopHeroSlideshow = () => {
    if (!heroSlideTimer) return;
    window.clearInterval(heroSlideTimer);
    heroSlideTimer = null;
  };
  startHeroSlideshow();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroSlideshow();
    else startHeroSlideshow();
  });
  reduceHeroMotion.addEventListener?.('change', event => {
    if (event.matches) stopHeroSlideshow();
    else startHeroSlideshow();
  });
}

// Highlight the current navigation section when IntersectionObserver is available.
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const observedSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
  observedSections.forEach(section => sectionObserver.observe(section));
}

// Smooth, one-time scroll reveals. If motion is reduced or JS/IO is unavailable,
// content stays visible and usable without waiting for animation.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
}

// Lightweight scroll progress, compact header treatment, and back-to-top visibility.
const scrollProgressBar = document.querySelector('#scroll-progress-bar');
const backToTop = document.querySelector('.back-to-top');
let scrollTicking = false;
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
  if (scrollProgressBar) scrollProgressBar.style.transform = `scaleX(${progress / 100})`;
  document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 12);
  const currentScroll = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
  backToTop?.classList.toggle('is-visible', currentScroll > 280);
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
updateScrollUI();

// Explicit back-to-top behavior, including mobile Safari.
if (backToTop) {
  backToTop.addEventListener('click', event => {
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    document.documentElement.scrollTo?.({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

// Set the earliest selectable tour date to at least seven calendar days from the visitor's local date.
const tourDateInput = document.querySelector('#tour-date');
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
if (tourDateInput) {
  const earliestDate = new Date();
  earliestDate.setHours(0, 0, 0, 0);
  earliestDate.setDate(earliestDate.getDate() + MINIMUM_BOOKING_DAYS);
  tourDateInput.min = formatLocalDate(earliestDate);
}

const form = document.querySelector('#inquiry-form');
const statusBox = document.querySelector('#form-status');
const fallbackBox = document.querySelector('#email-fallback');
const generatedMessage = document.querySelector('#generated-message');
const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

function setFieldError(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  if (error) error.textContent = message || '';
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}
function isAtLeastSevenDays(value) {
  if (!value) return false;
  const [year, month, day] = value.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  selected.setHours(0, 0, 0, 0);
  const earliest = new Date();
  earliest.setHours(0, 0, 0, 0);
  earliest.setDate(earliest.getDate() + MINIMUM_BOOKING_DAYS);
  return selected >= earliest;
}

function validateForm() {
  if (!form) return false;
  const name = form.elements.fullName;
  const email = form.elements.email;
  const phone = form.elements.phone;
  const date = form.elements.tourDate;
  const guests = form.elements.guests;
  const errors = [];

  const rules = [
    [name, name.value.trim() ? '' : 'Please enter your full name.'],
    [email, !email.value.trim() ? 'Please enter your email address.' : (!isValidEmail(email.value) ? 'Enter a valid email address.' : '')],
    [phone, !phone.value.trim() ? 'Please enter a contact number.' : (!isValidPhone(phone.value) ? 'Enter a valid contact number (10–13 digits, including country code if used).' : '')],
    [date, !date.value ? 'Please choose your preferred tour date.' : (!isAtLeastSevenDays(date.value) ? 'Choose a date at least 7 days from today.' : '')],
    [guests, !guests.value ? 'Please enter the number of guests.' : (Number(guests.value) < MINIMUM_GUESTS || !Number.isInteger(Number(guests.value)) ? 'This package requires at least 4 guests.' : '')]
  ];
  rules.forEach(([field, message]) => {
    setFieldError(field, message);
    if (message) errors.push(field);
  });
  if (errors.length) {
    errors[0].focus();
    statusBox.hidden = false;
    statusBox.textContent = `Please review ${errors.length} field${errors.length === 1 ? '' : 's'} marked with an error.`;
    statusBox.style.background = '#fff0e9';
    statusBox.style.color = '#9b422e';
    return false;
  }
  statusBox.hidden = true;
  return true;
}

function makeInquiryMessage() {
  const data = new FormData(form);
  const message = String(data.get('message') || '').trim();
  return [
    'LAKVENTURE TOUR & TRAVEL — TOUR INQUIRY',
    '',
    `Full name: ${String(data.get('fullName')).trim()}`,
    `Email address: ${String(data.get('email')).trim()}`,
    `Contact number: ${String(data.get('phone')).trim()}`,
    `Preferred tour date: ${String(data.get('tourDate'))}`,
    `Number of guests: ${String(data.get('guests'))}`,
    `Package: ${String(data.get('package'))}`,
    '',
    'Message / special requests:',
    message || 'No additional message provided.',
    '',
    'I understand that this is an inquiry only and not a confirmed reservation.',
    'Please confirm availability, final arrangements, and payment instructions.',
    '',
    'Prepared from the Lakventure Tour & Travel website.'
  ].join('\n');
}

if (form) {
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) setFieldError(field, '');
    });
    field.addEventListener('change', () => {
      if (field.hasAttribute('aria-invalid')) setFieldError(field, '');
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    fallbackBox.hidden = true;
    if (!validateForm()) return;

    const emailBody = makeInquiryMessage();
    generatedMessage.value = emailBody;
    const subject = 'Puerto Galera Tour Inquiry — Lakventure Tour & Travel';
    const mailto = `mailto:${INQUIRY_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    statusBox.hidden = false;
    statusBox.style.background = '#eaf7ef';
    statusBox.style.color = '#176c55';
    statusBox.textContent = `Your inquiry draft is ready. Your email application should open addressed to ${INQUIRY_RECIPIENT}. Please review and send the email there. This is not a confirmed reservation.`;
    fallbackBox.hidden = false;
    window.location.href = mailto;
  });
}

const copyButton = document.querySelector('#copy-inquiry');
if (copyButton && generatedMessage) {
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage.value);
      showToast('Inquiry details copied. Paste them into your email.');
    } catch (_) {
      generatedMessage.focus();
      generatedMessage.select();
      const copied = document.execCommand('copy');
      showToast(copied ? 'Inquiry details copied.' : 'Select the text and copy it manually.');
    }
  });
}

// CTA selection helper keeps the package preselected and moves focus to the inquiry form.
document.querySelectorAll('[data-select-package]').forEach(button => {
  button.addEventListener('click', () => {
    const packageChoice = document.querySelector('#package-choice');
    if (packageChoice) { packageChoice.value = button.dataset.packageName || 'All-in Puerto Galera Adventure'; const label = document.querySelector('#selected-package-label'); if (label) label.textContent = packageChoice.options[packageChoice.selectedIndex]?.textContent || packageChoice.value; }
  });
});

const packageChoice = document.querySelector('#package-choice');
if (packageChoice) packageChoice.addEventListener('change', () => { const label = document.querySelector('#selected-package-label'); if (label) label.textContent = packageChoice.options[packageChoice.selectedIndex]?.textContent || packageChoice.value; });

// Checklist is intentionally local to this page; nothing is stored or sent anywhere.
const checklist = document.querySelector('#packing-checklist');
const progressText = document.querySelector('#checklist-progress-text');
const progressBar = document.querySelector('#checklist-progress-bar');
if (checklist && progressText && progressBar) {
  const boxes = [...checklist.querySelectorAll('input[type="checkbox"]')];
  const updateChecklist = () => {
    const checked = boxes.filter(box => box.checked).length;
    progressText.textContent = `${checked} of ${boxes.length} packed`;
    progressBar.style.width = `${boxes.length ? (checked / boxes.length) * 100 : 0}%`;
  };
  boxes.forEach(box => box.addEventListener('change', updateChecklist));
  updateChecklist();
}

// Direct itinerary printing (desktop and mobile): skip the custom preview modal.
// The native browser print dialog opens directly from the user's button click.
const printButton = document.querySelector('#print-itinerary');
if (printButton) {
  const cleanPrintRoot = () => {
    document.querySelector('#itinerary-print-root')?.remove();
    document.body.classList.remove('is-printing-itinerary');
  };

  printButton.addEventListener('click', () => {
    const source = document.querySelector('#printable-itinerary');
    if (!source) {
      console.error('The itinerary section could not be found.');
      return;
    }

    cleanPrintRoot();
    const printRoot = document.createElement('main');
    printRoot.id = 'itinerary-print-root';
    printRoot.setAttribute('aria-label', 'Printable travel itinerary');

    const title = document.createElement('h1');
    title.className = 'itinerary-print-root__title';
    title.textContent = 'Lakventure Tour & Travel — Two-Day Itinerary';

    const note = document.createElement('p');
    note.className = 'itinerary-print-root__note';
    note.textContent = 'Schedule may change due to weather and sea conditions. Confirm final arrangements with Lakventure.';

    printRoot.append(title, note, source.cloneNode(true));
    document.body.appendChild(printRoot);
    document.body.classList.add('is-printing-itinerary');

    // Invoke synchronously within the click handler so mobile browsers retain
    // the user gesture and can open their native print sheet immediately.
    try {
      window.print();
    } catch (error) {
      cleanPrintRoot();
      console.error('Unable to open the print dialog.', error);
    }
  });

  window.addEventListener('afterprint', cleanPrintRoot);
  // Fallback cleanup for browsers that do not reliably fire afterprint.
  if (typeof window.matchMedia === 'function') {
    const printMedia = window.matchMedia('print');
    const onPrintMediaChange = event => {
      if (!event.matches) window.setTimeout(cleanPrintRoot, 300);
    };
    if (typeof printMedia.addEventListener === 'function') printMedia.addEventListener('change', onPrintMediaChange);
    else if (typeof printMedia.addListener === 'function') printMedia.addListener(onPrintMediaChange);
  }
}

const year = document.querySelector('#current-year');
if (year) year.textContent = String(new Date().getFullYear());

// Accessible photo lightbox: the selected gallery image opens in a larger view.
const galleryDialog = document.querySelector('#gallery-dialog');
const galleryDialogTitle = document.querySelector('#gallery-dialog-title');
const galleryLightboxImage = document.querySelector('#gallery-lightbox-image');
const closeGallery = () => { if (galleryDialog && galleryDialog.open) galleryDialog.close(); };
document.querySelectorAll('[data-gallery-label]').forEach(tile => {
  tile.addEventListener('click', () => {
    if (!galleryDialog || typeof galleryDialog.showModal !== 'function') return;
    const image = tile.querySelector('img');
    if (galleryLightboxImage && image) { galleryLightboxImage.src = image.src; galleryLightboxImage.alt = image.alt || tile.dataset.galleryLabel || 'Travel photograph'; }
    const title = tile.dataset.galleryLabel || 'Travel moments';
    if (galleryDialogTitle) galleryDialogTitle.textContent = title;
    if (galleryLightboxImage) galleryLightboxImage.setAttribute('aria-label', title);
    galleryDialog.showModal();
  });
});
if (document.querySelector('#close-gallery')) document.querySelector('#close-gallery').addEventListener('click', closeGallery);
if (document.querySelector('#gallery-dialog-done')) document.querySelector('#gallery-dialog-done').addEventListener('click', closeGallery);
if (galleryDialog) galleryDialog.addEventListener('click', event => { if (event.target === galleryDialog) closeGallery(); });

// Explicit configuration references for maintainers. Public email is displayed in contact areas only.
void PUBLIC_BUSINESS_EMAIL;

// Google Maps preview loads straight from the iframe src. This only toggles an alternate (OpenStreetMap) view.
(() => {
  const frame = document.querySelector('#map-embed');
  const button = document.querySelector('#map-switch');
  if (!frame || !button) return;
  const googleSrc = frame.getAttribute('src');
  let usingAlt = false;
  button.addEventListener('click', () => {
    usingAlt = !usingAlt;
    frame.src = usingAlt ? frame.dataset.altSrc : googleSrc;
    button.textContent = usingAlt ? 'Back to Google Maps view' : 'Map blank? Try alternate view';
  });
})();
