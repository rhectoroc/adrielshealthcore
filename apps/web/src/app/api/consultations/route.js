import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import * as yup from "yup";

const consultationSchema = yup.object({
  patientId: yup.number().required(),
  reason: yup.string().required("El motivo de la consulta es requerido"),
  physicalExam: yup.string().optional(),
  diagnosis: yup.string().required("El diagnóstico es requerido"),
  prescriptions: yup.string().optional(),
  sickLeave: yup.string().optional(),
});

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener perfil del usuario para multitenancy (UUID based)
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
    const userId = userRows[0].id;
    const currentUser = userRows[0];
    const ownerDoctorUuid = currentUser.role === 'doctor'
      ? currentUser.doctor_id
      : currentUser.parent_doctor_uuid;

    if (!ownerDoctorUuid && currentUser.role !== 'superuser') {
      return Response.json({ error: "No tiene un equipo médico asignado o vinculado a un doctor" }, { status: 403 });
    }

    // Seguridad: Solo los doctores pueden crear consultas
    if (currentUser.role !== 'doctor' && currentUser.role !== 'superuser') {
      return Response.json({ error: "Solo los médicos pueden registrar consultas y diagnósticos" }, { status: 403 });
    }

    const body = await request.json();

    // Validar con Yup
    try {
      await consultationSchema.validate(body, { abortEarly: false });
    } catch (validationErr) {
      return Response.json(
        { error: "Datos inválidos", details: validationErr.errors },
        { status: 400 }
      );
    }

    const {
      patientId,
      reason,
      physicalExam,
      diagnosis,
      prescriptions,
      sickLeave,
    } = body;

    // Verificar propiedad del paciente (Multitenancy UUID)
    if (currentUser.role !== 'superuser') {
      const patientCheck = await sql`
        SELECT id FROM patients 
        WHERE id = ${patientId} AND doctor_id = ${ownerDoctorUuid} 
        LIMIT 1
      `;
      if (!patientCheck || patientCheck.length === 0) {
        return Response.json({ error: "No tiene permiso para añadir consultas a este paciente" }, { status: 403 });
      }
    }

    // Insertar consulta
    const result = await sql`
      INSERT INTO consultations (
        patient_id, doctor_id, reason, physical_exam, diagnosis, prescriptions, sick_leave
      )
      VALUES (
        ${patientId}, ${userId}, ${reason}, ${physicalExam || null}, 
        ${diagnosis}, ${prescriptions || null}, ${sickLeave || null}
      )
      RETURNING *
    `;

    const consultation = result?.[0] || null;

    if (consultation) {
      // Registrar log de auditoría con contexto de doctor (Multitenancy)
      const contextDoctorIdResult = await sql`SELECT id FROM users WHERE doctor_id = ${ownerDoctorUuid} LIMIT 1`;
      const contextDoctorId = contextDoctorIdResult?.[0]?.id;

      await sql`
        INSERT INTO audit_logs (user_id, doctor_context_id, action, entity_type, entity_id, details)
        VALUES (
          ${userId}, 
          ${contextDoctorId || null},
          'CREATE_CONSULTATION', 
          'consultation', 
          ${consultation.id}, 
          ${JSON.stringify({ patientId, diagnosis })}
        )
      `;
    }

    return Response.json({ consultation }, { status: 201 });
  } catch (err) {
    console.error("POST /api/consultations error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
