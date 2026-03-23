import { generateCsv, generateXlsx } from "@/lib/exporter";

export async function POST(req, { params }) {
  try {
    const { format } = await params;
    const body = await req.json();
    const products = body.products || [];

    if (format === "csv") {
      const csvContent = generateCsv(products);
      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="produkty.csv"',
        },
      });
    }

    if (format === "xlsx") {
      const buffer = await generateXlsx(products);
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="produkty.xlsx"',
        },
      });
    }

    return Response.json({ error: "Nieobsługiwany format" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}