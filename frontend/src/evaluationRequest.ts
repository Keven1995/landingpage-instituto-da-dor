export const DEFAULT_WHATSAPP_NUMBER = '5561994443807';

export type EvaluationPreferences = {
  name: string;
  date: string;
  time: string;
};

export type EvaluationValidation =
  | { valid: true; name: string }
  | { valid: false; field: 'name' | 'date' | 'time'; message: string };

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

export function validateEvaluationPreferences(
  preferences: EvaluationPreferences,
  today: string,
): EvaluationValidation {
  const name = preferences.name.trim();
  const nameLength = Array.from(name).length;

  if (nameLength < 2 || nameLength > 80) {
    return { valid: false, field: 'name', message: 'Informe seu nome com 2 a 80 caracteres.' };
  }

  if (!isCalendarDate(preferences.date)) {
    return { valid: false, field: 'date', message: 'Informe uma data válida.' };
  }

  if (!isCalendarDate(today) || preferences.date < today) {
    return { valid: false, field: 'date', message: 'Escolha uma data de hoje em diante.' };
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(preferences.time)) {
    return { valid: false, field: 'time', message: 'Informe um horário válido no formato HH:mm.' };
  }

  return { valid: true, name };
}

export function createOnlineEvaluationMessage(
  name: string,
  date: string,
  time: string,
): string {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));

  return [
    'Olá! Encontrei o Instituto da Dor pelo site e gostaria de solicitar uma avaliação fisioterapêutica ONLINE por videochamada.',
    '',
    `Nome: ${name}`,
    `Data de preferência: ${formattedDate}`,
    `Horário de preferência: ${time}`,
    '',
    'Entendo que a data e o horário dependem de confirmação da equipe.',
    'Podem informar a disponibilidade, os valores e como receber o link da videochamada?',
  ].join('\n');
}

export function createWhatsAppLink(message: string, phone = DEFAULT_WHATSAPP_NUMBER): string {
  const safePhone = /^\d{8,15}$/.test(phone) ? phone : DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`;
}
