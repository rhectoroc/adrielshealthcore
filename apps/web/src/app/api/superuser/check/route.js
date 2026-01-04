import sql from "@/app/api/utils/sql";

// Check if superuser exists in the system
export async function GET() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'superuser'
    `;

    const count = parseInt(result?.[0]?.count || 0);
    const exists = count > 0;

    console.log("[DEBUG] Superuser check:", { exists, count });

    return Response.json({ exists, count });
  } catch (err) {
    console.error("GET /api/superuser/check error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
