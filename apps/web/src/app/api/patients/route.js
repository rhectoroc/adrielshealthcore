import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create new patient
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get user profile
    const userRows = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (!userRows || userRows.length === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const userId = userRows[0].id;
    const body = await request.json();
    const {
      cedula,
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

    if (!cedula || !fullName) {
      return Response.json(
        { error: "Cédula y nombre son requeridos" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO patients (
        cedula, full_name, date_of_birth, gender, blood_type, weight, height,
        phone, email, address, emergency_contact_name, emergency_contact_phone,
        allergies, created_by
      )
      VALUES (
        ${cedula}, ${fullName}, ${dateOfBirth || null}, ${gender || null},
        ${bloodType || null}, ${weight || null}, ${height || null},
        ${phone || null}, ${email || null}, ${address || null},
        ${emergencyContactName || null}, ${emergencyContactPhone || null},
        ${allergies || null}, ${userId}
      )
      RETURNING *
    `;

    const patient = result?.[0] || null;
    return Response.json({ patient }, { status: 201 });
  } catch (err) {
    console.error("POST /api/patients error:", err);
    if (err.message.includes("unique")) {
      return Response.json(
        { error: "Ya existe un paciente con esta cédula" },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// List patients with search
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = `
      SELECT * FROM patients
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (search && search.trim().length > 0) {
      query += ` AND (
        cedula LIKE $${paramCount} OR
        LOWER(full_name) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const patients = await sql(query, values);

    return Response.json({ patients });
  } catch (err) {
    console.error("GET /api/patients error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
