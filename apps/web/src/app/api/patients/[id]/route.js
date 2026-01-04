import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get single patient
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const result = await sql`
      SELECT * FROM patients WHERE id = ${id} LIMIT 1
    `;

    const patient = result?.[0] || null;

    if (!patient) {
      return Response.json(
        { error: "Paciente no encontrado" },
        { status: 404 },
      );
    }

    return Response.json({ patient });
  } catch (err) {
    console.error("GET /api/patients/[id] error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// Update patient
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const {
      fullName,
      dateOfBirth,
      gender,
      bloodType,
      weight,
      height,
      phone,
      email,
      address,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
    } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (fullName) {
      setClauses.push(`full_name = $${paramCount}`);
      values.push(fullName);
      paramCount++;
    }
    if (dateOfBirth !== undefined) {
      setClauses.push(`date_of_birth = $${paramCount}`);
      values.push(dateOfBirth);
      paramCount++;
    }
    if (gender !== undefined) {
      setClauses.push(`gender = $${paramCount}`);
      values.push(gender);
      paramCount++;
    }
    if (bloodType !== undefined) {
      setClauses.push(`blood_type = $${paramCount}`);
      values.push(bloodType);
      paramCount++;
    }
    if (weight !== undefined) {
      setClauses.push(`weight = $${paramCount}`);
      values.push(weight);
      paramCount++;
    }
    if (height !== undefined) {
      setClauses.push(`height = $${paramCount}`);
      values.push(height);
      paramCount++;
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (address !== undefined) {
      setClauses.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }
    if (emergencyContactName !== undefined) {
      setClauses.push(`emergency_contact_name = $${paramCount}`);
      values.push(emergencyContactName);
      paramCount++;
    }
    if (emergencyContactPhone !== undefined) {
      setClauses.push(`emergency_contact_phone = $${paramCount}`);
      values.push(emergencyContactPhone);
      paramCount++;
    }
    if (allergies !== undefined) {
      setClauses.push(`allergies = $${paramCount}`);
      values.push(allergies);
      paramCount++;
    }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) {
      return Response.json(
        { error: "No hay campos para actualizar" },
        { status: 400 },
      );
    }

    const updateQuery = `
      UPDATE patients 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);
    const result = await sql.unsafe(updateQuery, values);
    const patient = result?.[0] || null;

    if (!patient) {
      return Response.json(
        { error: "Paciente no encontrado" },
        { status: 404 },
      );
    }

    return Response.json({ patient });
  } catch (err) {
    console.error("PUT /api/patients/[id] error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
