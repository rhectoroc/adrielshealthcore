import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        const userRows = await sql`
      SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

        if (!userRows?.[0] || userRows[0].role !== "superuser") {
            return Response.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const settings = await sql`SELECT key, value FROM system_settings`;
        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        return Response.json({ settings: settingsMap });
    } catch (err) {
        console.error("GET /api/superuser/settings error:", err);
        return Response.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        const userRows = await sql`
      SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

        if (!userRows?.[0] || userRows[0].role !== "superuser") {
            return Response.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const body = await request.json();
        const { key, value } = body;

        await sql`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
    `;

        return Response.json({ success: true });
    } catch (err) {
        console.error("POST /api/superuser/settings error:", err);
        return Response.json({ error: "Error interno" }, { status: 500 });
    }
}
