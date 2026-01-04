import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        const userRows = await sql`SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1`;
        if (!userRows?.[0] || userRows[0].role !== "superuser") {
            return Response.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const users = await sql`SELECT * FROM users`;
        const specialties = await sql`SELECT * FROM specialties`;
        const settings = await sql`SELECT * FROM system_settings`;

        const backup = {
            timestamp: new Date().toISOString(),
            data: {
                users,
                specialties,
                system_settings: settings
            }
        };

        return Response.json(backup);
    } catch (err) {
        console.error("Backup error:", err);
        return Response.json({ error: "Error generando backup" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        const userRows = await sql`SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1`;
        if (!userRows?.[0] || userRows[0].role !== "superuser") {
            return Response.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const { data } = await request.json();
        if (!data) return Response.json({ error: "Datos de backup requeridos" }, { status: 400 });

        // Restore users
        if (data.users) {
            for (const user of data.users) {
                await sql`
          INSERT INTO users (id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified, parent_doctor_id)
          VALUES (${user.id}, ${user.email}, ${user.role}, ${user.full_name}, ${user.mpps_number}, ${user.colegio_number}, ${user.specialty}, ${user.rif}, ${user.is_verified}, ${user.parent_doctor_id})
          ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email, 
            role = EXCLUDED.role, 
            full_name = EXCLUDED.full_name,
            is_verified = EXCLUDED.is_verified,
            parent_doctor_id = EXCLUDED.parent_doctor_id
        `;
            }
        }

        // Restore specialties
        if (data.specialties) {
            for (const spec of data.specialties) {
                await sql`
          INSERT INTO specialties (id, name, description)
          VALUES (${spec.id}, ${spec.name}, ${spec.description})
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
        `;
            }
        }

        // Restore settings
        if (data.system_settings) {
            for (const setting of data.system_settings) {
                await sql`
          INSERT INTO system_settings (key, value)
          VALUES (${setting.key}, ${setting.value})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
            }
        }

        return Response.json({ success: true });
    } catch (err) {
        console.error("Restore error:", err);
        return Response.json({ error: "Error restaurando backup" }, { status: 500 });
    }
}
