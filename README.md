# ⚡ Neon Leads — Plataforma de Prospecção B2B & Consultor de Vendas IA

Plataforma Web moderna (Next.js 14 + Tailwind CSS + Playwright) para mineração de leads comerciais no **Google Maps** e **Instagram Business**, com foco estratégico em **empresas sem site**, recomendação de sistemas sob medida por IA, pipeline visual Kanban e dashboard executivo.

---

## 🚀 Principais Recursos

- 📍 **Extrator Google Maps em Tempo Real**: Extrai nome, categoria, endereço, notas e telefones comerciais diretamente do Google Maps.
- 📸 **Extrator Instagram Business**: Minera perfis comerciais por nicho e cidade, capturando arroba (`@`), seguidores e contatos da bio.
- 🔥 **Prioridade "Sem Site" (Mina de Ouro)**: Detecta estabelecimentos físicos sem presença online e ordena automaticamente na 1ª posição da lista.
- 💡 **Consultor de Vendas IA**:
  - Diagnóstico digital automático dos gargalos do cliente;
  - Sugestão de soluções sob medida (Landing Pages, Sistemas de Agendamento 24h, Cardápios sem taxa, Chatbots);
  - Ticket médio sugerido (Setup + Mensalidade recorrente);
  - Script de abordagem pronto com 1 clique para disparo no WhatsApp (`wa.me`).
- 💾 **Carteira Permanente de Leads Salvos**: Salve leads minerados no navegador, edite valores de propostas e exporte para **Excel (.xlsx)** e **CSV**.
- 📋 **Pipeline de Vendas (Kanban)**: Quadro visual estilo Trello (Novos Leads ➔ Contatados ➔ Em Negociação ➔ Proposta ➔ Fechado 🎉 ➔ Perdido).
- 📈 **Dashboard de Performance**: Acompanhe o Faturamento Fechado em R$, valor do Pipeline Ativo, taxa de conversão e ranking de nichos.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 14 (App Router) & TypeScript
- **Estilização:** Tailwind CSS (Dark Mode Neon Leads) & Lucide Icons
- **Automação:** Playwright (Chromium Headless) & Cheerio
- **Exportação:** ExcelJS & Canvas Confetti

---

## 💻 Como Rodar Localmente

```bash
# 1. Instalar dependências
bun install # ou npm install

# 2. Iniciar servidor em desenvolvimento
bun run dev # ou npm run dev

# 3. Ou compilar e rodar em produção
bun run build
bun run start
```

Acesse no navegador: `http://localhost:3000`

---

## ☁️ Hospedagem na Nuvem (Vercel & Railway)

### Vercel:
1. Conecte este repositório no dashboard da [Vercel](https://vercel.com).
2. O framework Next.js será detectado automaticamente.
3. Clique em **Deploy**.

---

Desenvolvido com foco em alta conversão e geração de receita recorrente B2B.
