import type { Brand } from './icons';

// Contact details shown on the contact page, the hero's Contact me drawer, and the footer.
// Fill in a value to show it; empty entries are hidden.
export const EMAIL = 'alex.geekai@outlook.com';
export const WHATSAPP = ''; // e.g. '+1-514-555-0100'

export const socials: { brand: Brand; label: string; url: string }[] = [
  { brand: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/yang124906/' },
  { brand: 'github', label: 'GitHub', url: 'https://github.com/alexli-77' },
  { brand: 'x', label: 'X', url: 'https://x.com/Leon_udem' },
  { brand: 'substack', label: 'Substack', url: 'https://substack.com/@leon124906' },
  { brand: 'facebook', label: 'Facebook', url: '' },
  { brand: 'instagram', label: 'Instagram', url: '' },
].filter((s) => s.url);
