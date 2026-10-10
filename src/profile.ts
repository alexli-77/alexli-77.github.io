import type { Brand } from './icons';

// Contact details shown on the home hero and the contact page.
// Fill in a value to show it; empty entries are hidden.
export const EMAIL = 'yang.li.9@umontreal.ca';
export const WHATSAPP = ''; // e.g. '+1-514-555-0100'

export const socials: { brand: Brand; label: string; url: string }[] = [
  { brand: 'linkedin', label: 'LinkedIn', url: '' },
  { brand: 'github', label: 'GitHub', url: 'https://github.com/alexli-77' },
  { brand: 'x', label: 'X', url: '' },
  { brand: 'facebook', label: 'Facebook', url: '' },
  { brand: 'instagram', label: 'Instagram', url: '' },
].filter((s) => s.url);
