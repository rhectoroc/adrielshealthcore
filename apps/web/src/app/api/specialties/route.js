import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const specialties = await sql`
      SELECT id, name, description
      FROM specialties
      ORDER BY name ASC
    `;

    return Response.json({ specialties });
  } catch (err) {
    console.error("GET /api/specialties error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
