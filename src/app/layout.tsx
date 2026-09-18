import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neon Leads | Extrator & Enriquecedor de Leads B2B",
  description:
    "Plataforma inteligente para extração de dados do Google Maps, enriquecimento automático de e-mails, redes sociais e validação de WhatsApp.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f0ff'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#070b12] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="fixed inset-0 bg-neon-glow pointer-events-none z-0" />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
