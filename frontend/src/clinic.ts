import { createWhatsAppLink } from './evaluationRequest';

export type Clinic = {
  name: string;
  specialty: string;
  phone: string;
  whatsappNumber: string;
  instagramUrl: string;
  address: string;
  locality: string;
  mapUrl: string;
};

// Dados públicos confirmados da unidade Gama/DF.
// Esta configuração também permite que o site continue funcionando
// enquanto a API Java ainda não tiver sido implantada.
export const fallbackClinic: Clinic = {
  name: 'Instituto da Dor',
  specialty: 'Fisioterapia',
  phone: '(61) 99444-3807',
  whatsappNumber: '5561994443807',
  instagramUrl: 'https://www.instagram.com/institutodorgama/',
  address: 'Setor Sul, Quadra 3, Conjunto A, Lote 20, Sala 204',
  locality: 'Gama, Brasília - DF, CEP 72410-201',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Setor+Sul+Quadra+3+Conjunto+A+Lote+20+Sala+204+Gama+DF',
};

export const whatsappMessageLink = (clinic: Clinic, message: string) =>
  createWhatsAppLink(message, clinic.whatsappNumber);

export const whatsappLink = (clinic: Clinic, context: string) =>
  whatsappMessageLink(clinic,
    `Olá! Encontrei o Instituto da Dor pelo site e gostaria de agendar uma avaliação. ${context}`.trim());

export async function getClinic(): Promise<Clinic> {
  const apiBase = import.meta.env.VITE_API_URL ?? '';
  if (!apiBase && !import.meta.env.DEV) return fallbackClinic;

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(`${apiBase}/api/v1/clinic`, { signal: controller.signal });
      if (!response.ok) throw new Error(`API retornou ${response.status}`);
      return normalizeClinic(await response.json());
    } finally {
      window.clearTimeout(timeout);
    }
  } catch {
    return fallbackClinic;
  }
}

function normalizeClinic(value: unknown): Clinic {
  if (!value || typeof value !== 'object') return fallbackClinic;

  const data = value as Record<string, unknown>;
  const text = (key: keyof Clinic, maxLength: number): string => {
    const candidate = data[key];
    return typeof candidate === 'string' && candidate.trim().length > 0 && candidate.length <= maxLength
      ? candidate
      : fallbackClinic[key];
  };
  const safeUrl = (candidate: unknown, host: string, path: string, fallback: string): string => {
    if (typeof candidate !== 'string') return fallback;
    try {
      const url = new URL(candidate);
      return url.protocol === 'https:'
        && url.hostname === host
        && url.port === ''
        && !url.username
        && !url.password
        && url.pathname === path
        ? url.toString()
        : fallback;
    } catch {
      return fallback;
    }
  };

  const candidatePhone = data.whatsappNumber;
  return {
    name: text('name', 100),
    specialty: text('specialty', 100),
    phone: text('phone', 40),
    whatsappNumber: typeof candidatePhone === 'string' && /^\d{8,15}$/.test(candidatePhone)
      ? candidatePhone
      : fallbackClinic.whatsappNumber,
    instagramUrl: safeUrl(data.instagramUrl, 'www.instagram.com', '/institutodorgama/', fallbackClinic.instagramUrl),
    address: text('address', 200),
    locality: text('locality', 200),
    mapUrl: safeUrl(data.mapUrl, 'www.google.com', '/maps/search/', fallbackClinic.mapUrl),
  };
}
