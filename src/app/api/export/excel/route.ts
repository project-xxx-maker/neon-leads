import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { Lead } from "@/lib/extractor/types";

export async function POST(req: NextRequest) {
  try {
    const { leads, campaignName = "Neon_Leads_Extracao" } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "Nenhum lead fornecido para exportação." },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Neon Leads Extractor";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Leads Extraídos", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Definir colunas
    sheet.columns = [
      { header: "Nome da Empresa", key: "name", width: 32 },
      { header: "Categoria / Nicho", key: "category", width: 22 },
      { header: "Telefone", key: "phone", width: 20 },
      { header: "É WhatsApp?", key: "isWhatsapp", width: 15 },
      { header: "Link Direto WhatsApp", key: "whatsappUrl", width: 35 },
      { header: "E-mails Corporativos", key: "emails", width: 35 },
      { header: "Instagram", key: "instagram", width: 30 },
      { header: "Facebook", key: "facebook", width: 30 },
      { header: "LinkedIn", key: "linkedin", width: 30 },
      { header: "Website", key: "website", width: 32 },
      { header: "Nota (Google)", key: "rating", width: 14 },
      { header: "Total Avaliações", key: "reviewsCount", width: 16 },
      { header: "Endereço Completo", key: "address", width: 45 },
      { header: "Cidade", key: "city", width: 22 },
      { header: "Google Maps URL", key: "googleMapsUrl", width: 35 },
    ];

    // Estilização do Cabeçalho Neon / Dark Premium
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" }, // Dark Slate 900
      };
      cell.font = {
        name: "Segoe UI",
        size: 11,
        bold: true,
        color: { argb: "FF00F0FF" }, // Neon Cyan
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF00F0FF" } },
      };
    });

    // Adicionar Linhas
    (leads as Lead[]).forEach((lead, index) => {
      const row = sheet.addRow({
        name: lead.name,
        category: lead.category,
        phone: lead.formattedPhone || lead.phone,
        isWhatsapp: lead.isWhatsapp ? "SIM" : "NÃO",
        whatsappUrl: lead.whatsappUrl || "",
        emails: lead.emails?.join("; ") || "",
        instagram: lead.socials?.instagram || "",
        facebook: lead.socials?.facebook || "",
        linkedin: lead.socials?.linkedin || "",
        website: lead.website || "",
        rating: lead.rating ? Number(lead.rating.toFixed(1)) : "",
        reviewsCount: lead.reviewsCount || 0,
        address: lead.address || "",
        city: lead.city || "",
        googleMapsUrl: lead.googleMapsUrl || "",
      });

      row.height = 22;
      const isEven = index % 2 === 0;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Segoe UI", size: 10, color: { argb: "FF1E293B" } };
        cell.alignment = { vertical: "middle", horizontal: colNumber === 1 || colNumber === 13 ? "left" : "center" };
        
        // Formatar cores alternadas suaves
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" },
        };

        cell.border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        // Formatação condicional para WhatsApp SIM
        if (colNumber === 4 && cell.value === "SIM") {
          cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF059669" } };
        }
      });
    });

    // Gerar Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `${campaignName.replace(/[^a-zA-Z0-9_-]/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Excel Export Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo Excel.", details: error.message },
      { status: 500 }
    );
  }
}
