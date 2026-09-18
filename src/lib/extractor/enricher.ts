import * as cheerio from "cheerio";
import { LeadSocials } from "./types";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// Domínios ou extensões falsas para ignorar
const IGNORED_EMAILS = [
  "sentry.io",
  "wixpress.com",
  "example.com",
  "domain.com",
  "email.com",
  "test.com",
  "webpack",
  "png",
  "jpg",
  "jpeg",
  "svg",
  "gif",
  "webp",
  "bootstrap",
  "schema.org",
];

export interface EnrichedData {
  emails: string[];
  socials: LeadSocials;
  whatsappFound?: string;
}

export async function enrichWebsite(url: string): Promise<EnrichedData> {
  const result: EnrichedData = {
    emails: [],
    socials: {},
  };

  if (!url || !url.startsWith("http")) {
    if (url && !url.startsWith("http")) {
      url = "https://" + url;
    } else {
      return result;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return result;

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Extração de E-mails via regex e mailto:
    const emailsSet = new Set<string>();

    // Checar links mailto:
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const mail = href.replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
        if (isValidEmail(mail)) {
          emailsSet.add(mail);
        }
      }
    });

    // Checar todo o texto do HTML
    const matchedEmails = html.match(EMAIL_REGEX);
    if (matchedEmails) {
      for (const email of matchedEmails) {
        const cleaned = email.toLowerCase().trim();
        if (isValidEmail(cleaned)) {
          emailsSet.add(cleaned);
        }
      }
    }

    // 2. Extração de Redes Sociais
    const socials: LeadSocials = {};

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const lowerHref = href.toLowerCase();

      // Instagram
      if (lowerHref.includes("instagram.com/") && !lowerHref.includes("/p/") && !lowerHref.includes("/reel/")) {
        if (!socials.instagram) socials.instagram = cleanSocialUrl(href);
      }
      // Facebook
      else if (lowerHref.includes("facebook.com/") && !lowerHref.includes("/sharer")) {
        if (!socials.facebook) socials.facebook = cleanSocialUrl(href);
      }
      // LinkedIn
      else if (lowerHref.includes("linkedin.com/company/") || lowerHref.includes("linkedin.com/in/")) {
        if (!socials.linkedin) socials.linkedin = cleanSocialUrl(href);
      }
      // WhatsApp direto pelo site
      else if (lowerHref.includes("wa.me/") || lowerHref.includes("api.whatsapp.com/send")) {
        if (!result.whatsappFound) {
          result.whatsappFound = href;
        }
      }
      // TikTok
      else if (lowerHref.includes("tiktok.com/@")) {
        if (!socials.tiktok) socials.tiktok = cleanSocialUrl(href);
      }
    });

    result.emails = Array.from(emailsSet).slice(0, 5); // até 5 e-mails válidos
    result.socials = socials;

    return result;
  } catch (err) {
    // Timeout ou erro de conexão com o site - segue silencioso sem quebrar o fluxo
    return result;
  }
}

function isValidEmail(email: string): boolean {
  if (!email || email.length > 80) return false;
  if (!email.includes("@") || !email.includes(".")) return false;

  const lower = email.toLowerCase();
  for (const ignored of IGNORED_EMAILS) {
    if (lower.includes(ignored)) return false;
  }

  // Ignorar extensões de imagem que possam parecer e-mail
  if (/\.(png|jpg|jpeg|svg|webp|gif|css|js)$/i.test(lower)) return false;

  return true;
}

function cleanSocialUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}
