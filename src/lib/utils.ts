import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getWhatsAppLink(phone: string, businessName?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  
  // Se for Brasil e não tem 55, adiciona
  let fullNumber = digits;
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
    fullNumber = "55" + digits;
  }
  
  const text = businessName 
    ? `Olá, tudo bem? Vi sua empresa ${businessName} no Google e gostaria de saber mais informações!`
    : `Olá, tudo bem? Gostaria de saber mais informações!`;
    
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`;
}
