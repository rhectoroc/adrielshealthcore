import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const offset = parseInt(searchParams.get("offset") || "0");

        const userRows = await sql`
      SELECT role FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1
    `;

        if (!userRows?.[0] || userRows[0].role !== "superuser") {
            return Response.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const logs = await sql`
      SELECT al.*, u.full_name, u.email, u.role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

        return Response.json({ logs });
    } catch (err) {
        console.error("GET /api/superuser/logs error:", err);
        return Response.json({ error: "Error interno", details: err.message }, { status: 500 });
    }
}
