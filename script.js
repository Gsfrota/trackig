import { validateContactFields, buildContactWhatsAppUrl } from './assets/contact-form.js';
import { initHeroMobileCarousel } from './assets/hero-mobile-carousel.js';

// Keep the supplied official commercial destinations together.
const TRACKIG_CONFIG = Object.freeze({
  protectUrl: 'https://wa.me/5585991318582',
  contactUrl: 'https://wa.me/5585991318582',
  customerUrl: '',
});

const dialog = document.querySelector('#info-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
let dialogTrigger = null;

const messages = {
  protect: ['Proteja seu veículo', 'O canal de contratação da TrackIG será disponibilizado em breve.'],
  contact: ['Fale com a TrackIG', 'O contato oficial da TrackIG será disponibilizado em breve.'],
  customer: ['Área do cliente', 'A área do cliente está em desenvolvimento. Em breve, você poderá acessá-la aqui.'],
  technology: ['Conheça a tecnologia TrackIG', 'Rastreamento em tempo real para acompanhar o veículo. Histórico para consultar os registros de trajetos. Alertas para manter você informado.'],
  how: ['Como funciona', 'Estamos preparando esta apresentação. Em breve, você poderá conhecer o funcionamento aqui.'],
  privacy: ['Privacidade', 'A política de privacidade da TrackIG ainda não está disponível.'],
  terms: ['Termos de uso', 'Os termos de uso da TrackIG ainda não estão disponíveis.'],
  instagram: ['Instagram', 'A TrackIG ainda não possui um perfil oficial no Instagram.'],
  linkedin: ['LinkedIn', 'A TrackIG ainda não possui um perfil oficial no LinkedIn.'],
  youtube: ['YouTube', 'A TrackIG ainda não possui um canal oficial no YouTube.'],
};

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
}

function showInformation(key, trigger) {
  dialogTrigger = trigger;
  const [title, description] = messages[key];
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  dialog.showModal();
}

document.querySelectorAll('[data-action], [data-info]').forEach((button) => {
  const configuredUrl = TRACKIG_CONFIG[`${button.dataset.action}Url`];
  if (button.tagName === 'A' && configuredUrl?.startsWith('https://')) button.href = configuredUrl;
  button.addEventListener('click', (event) => {
    const trigger = event.currentTarget;
    closeMenu();
    const action = button.dataset.action;
    const destination = action ? TRACKIG_CONFIG[`${action}Url`] : '';
    if (destination) {
      try {
        const url = new URL(destination);
        if (url.protocol === 'https:') {
          if (button.tagName === 'A') return;
          window.open(url.href, '_blank', 'noopener,noreferrer');
          return;
        }
      } catch { /* An incomplete destination uses the honest fallback below. */ }
    }
    event.preventDefault();
    showInformation(action || button.dataset.info, trigger);
  });
});

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});
document.querySelectorAll('.dialog-close, .dialog-confirm').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('close', () => {
  const trigger = dialogTrigger;
  dialogTrigger = null;
  if (trigger?.isConnected && trigger.getClientRects().length) {
    trigger.focus();
  } else if (menuToggle.getClientRects().length) {
    menuToggle.focus();
  }
});
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

const contactForm = document.querySelector('#contact-form');
const contactFields = {
  name: document.querySelector('#contact-name'),
  phone: document.querySelector('#contact-phone'),
  interest: document.querySelector('#contact-interest'),
};
const contactStatus = document.querySelector('#contact-status');
const readContactValues = () => Object.fromEntries(Object.entries(contactFields).map(([key, field]) => [key, field.value]));

function renderContactError(key, message = '') {
  const field = contactFields[key];
  const error = document.querySelector(`#${field.id}-error`);
  error.textContent = message;
  error.hidden = !message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

for (const [key, field] of Object.entries(contactFields)) {
  const recover = () => {
    contactStatus.textContent = '';
    contactStatus.hidden = true;
    if (field.getAttribute('aria-invalid') === 'true') {
      renderContactError(key, validateContactFields(readContactValues()).errors[key]);
    }
  };
  field.addEventListener('input', recover);
  field.addEventListener('change', recover);
}

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = readContactValues();
  const result = validateContactFields(values);
  for (const key of Object.keys(contactFields)) renderContactError(key, result.errors[key]);
  if (!result.valid) {
    contactStatus.hidden = true;
    contactFields[Object.keys(result.errors)[0]].focus();
    return;
  }
  const url = buildContactWhatsAppUrl(values, TRACKIG_CONFIG.contactUrl);
  contactStatus.textContent = 'Revise e envie a mensagem no WhatsApp. O envio não acontece automaticamente.';
  contactStatus.hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
});
// Keep native submission inactive until validation is connected. With JavaScript
// unavailable, the disabled submit and noscript link prevent a data-bearing GET.
contactForm.querySelector('button[type="submit"]').disabled = false;
initHeroMobileCarousel();
