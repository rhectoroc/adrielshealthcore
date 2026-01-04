import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all users (superuser only)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify user is superuser
    const userRows = await sql`
      SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (
      !userRows ||
      userRows.length === 0 ||
      userRows[0].role !== "superuser"
    ) {
      return Response.json(
        { error: "Acceso denegado. Solo SuperUsuarios." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    let query = `SELECT id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified, parent_doctor_id, created_at FROM users WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (role && role !== "all") {
      query += ` AND role = $${paramCount}`;
      values.push(role);
      paramCount++;
    }

    if (search && search.trim().length > 0) {
      query += ` AND (LOWER(full_name) LIKE LOWER($${paramCount}) OR LOWER(email) LIKE LOWER($${paramCount}))`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const users = await sql.unsafe(query, values);

    return Response.json({ users });
  } catch (err) {
    console.error("GET /api/superuser/users error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// Create new user (superuser only)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify user is superuser
    const userRows = await sql`
      SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (
      !userRows ||
      userRows.length === 0 ||
      userRows[0].role !== "superuser"
    ) {
      return Response.json(
        { error: "Acceso denegado. Solo SuperUsuarios." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, role, fullName, mppsNumber, colegioNumber, specialty, rif, parent_doctor_id } =
      body;

    if (!email || !role || !fullName) {
      return Response.json(
        { error: "Email, rol y nombre son requeridos" },
        { status: 400 },
      );
    }

    // Check if email already exists in auth_users
    const existingAuthUser = await sql`
      SELECT id FROM auth_users WHERE email = ${email} LIMIT 1
    `;

    if (existingAuthUser && existingAuthUser.length > 0) {
      return Response.json(
        { error: "Este email ya está registrado en el sistema" },
        { status: 409 },
      );
    }

    // Check if email already exists in users table
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser && existingUser.length > 0) {
      return Response.json(
        { error: "Este usuario ya existe" },
        { status: 409 },
      );
    }

    const result = await sql`
      INSERT INTO users (email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified, parent_doctor_id)
      VALUES (
        ${email},
        ${role},
        ${fullName},
        ${mppsNumber || null},
        ${colegioNumber || null},
        ${specialty || null},
        ${rif || null},
        ${false},
        ${parent_doctor_id || null}
      )
      RETURNING id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified, parent_doctor_id, created_at
    `;

    const newUser = result?.[0] || null;

    // Log the action
    const actorResult = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1`;
    const actorId = actorResult?.[0]?.id || null;

    if (actorId) {
      await sql`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (${actorId}, 'CREATE_USER', 'users', ${newUser.id}, ${{ email, role, fullName, targetName: fullName }})
      `;
    }

    return Response.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/superuser/users error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
