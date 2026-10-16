const INTERESTS = new Set([
  'Rastreamento veicular',
  'Gestão de frotas',
  'Financiamento e securitizadoras',
  'Outros',
]);
const BRAZILIAN_AREA_CODES = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
]);

export function normalizeBrazilianWhatsApp(value) {
  const input = String(value ?? '').trim();
  if (!/^\+?[\d\s().-]+$/u.test(input)) return null;
  let digits = input.replace(/\D/g, '');
  if (input.startsWith('+') || digits.length > 11) {
    if (!digits.startsWith('55') || ![12, 13].includes(digits.length)) return null;
    digits = digits.slice(2);
  }
  if (![10, 11].includes(digits.length) || !BRAZILIAN_AREA_CODES.has(digits.slice(0, 2))) return null;
  const subscriber = digits.slice(2);
  if (/^(\d)\1+$/.test(subscriber)) return null;
  if (digits.length === 11 ? !/^9\d{8}$/.test(subscriber) : !/^[2-9]\d{7}$/.test(subscriber)) return null;
  return `55${digits}`;
}

export function validateContactFields(input) {
  const rawName = String(input.name ?? '');
  const name = rawName.trim().replace(/\s+/gu, ' ');
  const phone = normalizeBrazilianWhatsApp(input.phone);
  const interest = String(input.interest ?? '');
  const errors = {};
  if (!name) errors.name = 'Informe seu nome.';
  else if (!/\p{L}/u.test(name) || /[\u0000-\u001f\u007f]/.test(rawName) || name.length > 120) errors.name = 'Informe um nome válido.';
  if (!phone) errors.phone = 'Informe um WhatsApp brasileiro válido com DDD (10 ou 11 dígitos).';
  if (!INTERESTS.has(interest)) errors.interest = 'Selecione um tipo de interesse.';
  return { valid: Object.keys(errors).length === 0, errors, values: { name, phone, interest } };
}

export function buildContactWhatsAppUrl(input, destination) {
  const result = validateContactFields(input);
  if (!result.valid) throw new Error('Dados de contato inválidos.');
  const url = new URL(destination);
  if (url.protocol !== 'https:' || url.hostname !== 'wa.me') throw new Error('Destino de contato inválido.');
  const { name, phone, interest } = result.values;
  const message = `Olá! Quero iniciar um atendimento com a TrackIG.\nNome: ${name}\nWhatsApp: +${phone}\nInteresse: ${interest}`;
  url.searchParams.set('text', message);
  return url.href;
}
