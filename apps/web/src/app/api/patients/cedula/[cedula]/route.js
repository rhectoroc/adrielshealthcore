import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ error: "No autorizado" }, { status: 401 });
        }

        const { cedula } = params;

        // Obtener perfil del usuario para multitenancy
        const userRows = await sql`
          SELECT u.id, u.role, u.parent_doctor_id, u.doctor_id,
                 p.doctor_id as parent_doctor_uuid
          FROM users u
          LEFT JOIN users p ON u.parent_doctor_id = p.id
          WHERE u.email = ${session.user.email} 
          LIMIT 1
        `;
        if (!userRows || userRows.length === 0) {
            return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const currentUser = userRows[0];
        const contextDoctorUuid = request.headers.get("x-doctor-context");

        let ownerDoctorUuid = null;

        if (currentUser.role === 'doctor') {
            ownerDoctorUuid = currentUser.doctor_id;
        } else if (currentUser.role === 'nurse' || currentUser.role === 'administrator') {
            // Si hay un contexto enviado, validar que el asistente esté vinculado a ese doctor
            if (contextDoctorUuid) {
                const linkedCheck = await sql`
                    SELECT 1 FROM doctor_assistants da
                    JOIN users u ON da.doctor_id = u.id
                    WHERE da.assistant_id = ${currentUser.id} AND u.doctor_id = ${contextDoctorUuid}
                `;
                if (linkedCheck && linkedCheck.length > 0) {
                    ownerDoctorUuid = contextDoctorUuid;
                }
            }

            // Si no hay contexto o falló la validación, intentar con el parent_doctor_id legacy
            if (!ownerDoctorUuid) {
                ownerDoctorUuid = currentUser.parent_doctor_uuid;
            }
        }

        if (!ownerDoctorUuid && currentUser.role !== 'superuser') {
            return Response.json({ error: "No tiene un equipo médico autorizado o el contexto del doctor es inválido" }, { status: 403 });
        }

        // Buscar paciente por cédula y doctor_id (multitenancy)
        const patientResult = currentUser.role === 'superuser'
            ? await sql`SELECT * FROM patients WHERE cedula = ${cedula} LIMIT 1`
            : await sql`SELECT * FROM patients WHERE cedula = ${cedula} AND doctor_id = ${ownerDoctorUuid} LIMIT 1`;

        const patient = patientResult?.[0] || null;

        if (!patient) {
            return Response.json(
                { error: "Paciente no encontrado" },
                { status: 404 },
            );
        }

        // Buscar historial médico (consultas)
        const consultations = await sql`
      SELECT * FROM consultations 
      WHERE patient_id = ${patient.id} 
      ORDER BY created_at DESC
    `;

        return Response.json({
            patient: {
                ...patient,
                history: consultations
            }
        });
    } catch (err) {
        console.error("GET /api/patients/cedula/[cedula] error:", err);
        return Response.json(
            { error: "Error interno del servidor" },
            { status: 500 },
        );
    }
}
