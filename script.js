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

const messages = {
  protect: ['Proteja seu veículo', 'O canal de contratação da TrackIG será disponibilizado em breve.'],
  contact: ['Fale com a TrackIG', 'O contato oficial da TrackIG será disponibilizado em breve.'],
  customer: ['Área do cliente', 'A área do cliente está em desenvolvimento. Em breve, você poderá acessá-la aqui.'],
  solutions: ['Soluções TrackIG', 'Estamos preparando os detalhes das soluções. Em breve, você poderá conhecê-los aqui.'],
  how: ['Como funciona', 'Estamos preparando esta apresentação. Em breve, você poderá conhecer o funcionamento aqui.'],
};

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
}

function showInformation(key) {
  const [title, description] = messages[key];
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  dialog.showModal();
}

document.querySelectorAll('[data-action], [data-info]').forEach((button) => {
  const configuredUrl = TRACKIG_CONFIG[`${button.dataset.action}Url`];
  if (button.tagName === 'A' && configuredUrl?.startsWith('https://')) button.href = configuredUrl;
  button.addEventListener('click', (event) => {
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
    showInformation(action || button.dataset.info);
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
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
