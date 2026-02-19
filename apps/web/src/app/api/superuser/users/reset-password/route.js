import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { hash } from "argon2";
import crypto from "crypto";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        // Identificar al usuario que realiza la acción (debe ser doctor o superuser)
        const actorRows = await sql`
      SELECT id, role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;
        const actor = actorRows?.[0];

        if (!actor || (actor.role !== 'doctor' && actor.role !== 'superuser')) {
            return Response.json({ error: "No tiene permisos para resetear claves" }, { status: 403 });
        }

        const { assistantId } = await request.json();
        if (!assistantId) {
            return Response.json({ error: "ID de asistente requerido" }, { status: 400 });
        }

        // Verificar que el asistente pertenezca al equipo del doctor (si no es superuser)
        const assistantRows = await sql`
      SELECT id, email, full_name, parent_doctor_id, doctor_id 
      FROM users WHERE id = ${assistantId} LIMIT 1
    `;
        const assistant = assistantRows?.[0];

        if (!assistant) {
            return Response.json({ error: "Asistente no encontrado" }, { status: 404 });
        }

        if (actor.role === 'doctor' && assistant.parent_doctor_id !== actor.id) {
            return Response.json({ error: "Este asistente no pertenece a su unidad médica" }, { status: 403 });
        }

        // 1. Generar nueva clave temporal
        const tempPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await hash(tempPassword);

        // 2. Actualizar en auth_accounts (Auth.js)
        // Usamos doctor_id de la tabla users que es el UUID linkeado a Auth.js
        await sql`
      UPDATE auth_accounts 
      SET password = ${hashedPassword}
      WHERE "userId" = ${assistant.doctor_id}
    `;

        // 3. Marcar require_password_change en users
        await sql`
      UPDATE users 
      SET require_password_change = true 
      WHERE id = ${assistantId}
    `;

        // 4. Registrar en auditoría
        await sql`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (
        ${actor.id}, 'RESET_ASSISTANT_PASSWORD', 'users', ${assistantId}, 
        ${JSON.stringify({ assistantEmail: assistant.email, assistantName: assistant.full_name })}
      )
    `;

        return Response.json({
            success: true,
            tempPassword,
            message: "Contraseña reseteada exitosamente"
        });

    } catch (err) {
        console.error("error in reset-password:", err);
        return Response.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
