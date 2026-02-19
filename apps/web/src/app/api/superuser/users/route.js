import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { hash } from "argon2";
import crypto from "crypto";

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

    let query = `
      SELECT u.id, u.email, u.role, u.full_name, u.mpps_number, u.colegio_number, 
             u.specialty_id, s.name as specialty_name, u.rif, u.is_verified, 
             u.parent_doctor_id, u.created_at, u.require_password_change
      FROM users u
      LEFT JOIN specialties s ON u.specialty_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (role && role !== "all") {
      query += ` AND u.role = $${paramCount}`;
      values.push(role);
      paramCount++;
    }

    if (search && search.trim().length > 0) {
      query += ` AND (LOWER(u.full_name) LIKE LOWER($${paramCount}) OR LOWER(u.email) LIKE LOWER($${paramCount}))`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY u.created_at DESC`;

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
    const superUserCheck = await sql`
      SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (
      !superUserCheck ||
      superUserCheck.length === 0 ||
      superUserCheck[0].role !== "superuser"
    ) {
      return Response.json(
        { error: "Acceso denegado. Solo SuperUsuarios." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, role, fullName, mppsNumber, colegioNumber, specialtyId, rif, parent_doctor_id } =
      body;

    if (!email || !role || !fullName) {
      return Response.json(
        { error: "Email, rol y nombre son requeridos" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser && existingUser.length > 0) {
      return Response.json(
        { error: "Este usuario ya existe" },
        { status: 409 },
      );
    }

    // 1. Generar password temporal
    const tempPassword = crypto.randomBytes(6).toString('hex'); // 12 chars
    const hashedPassword = await hash(tempPassword);

    // 2. Crear en auth_users (Auth.js)
    const authUserResult = await sql`
      INSERT INTO auth_users (name, email)
      VALUES (${fullName}, ${email})
      RETURNING id
    `;
    const authUserId = authUserResult[0].id;

    // 3. Crear en auth_accounts (Auth.js - Credentials)
    await sql`
      INSERT INTO auth_accounts (
        "userId", type, provider, "providerAccountId", password
      )
      VALUES (
        ${authUserId}, 'credentials', 'credentials', ${authUserId}, ${hashedPassword}
      )
    `;

    // 4. Crear en aplicación (users table)
    const result = await sql`
      INSERT INTO users (
        email, role, full_name, mpps_number, colegio_number, 
        specialty_id, rif, is_verified, parent_doctor_id, 
        require_password_change, doctor_id
      )
      VALUES (
        ${email},
        ${role},
        ${fullName},
        ${mppsNumber || null},
        ${colegioNumber || null},
        ${specialtyId || null},
        ${rif || null},
        ${true}, -- Auto-verificar si lo crea el admin
        ${parent_doctor_id || null},
        ${true}, -- Marcar para cambio obligatorio
        ${authUserId} -- Link UUID de Auth.js
      )
      RETURNING id, email, role, full_name, mpps_number, colegio_number, specialty_id, rif, is_verified, parent_doctor_id, created_at
    `;

    const newUser = result?.[0] || null;

    // 5. SI hay parent_doctor_id, insertar también en tabla relacional doctor_assistants
    if (newUser && parent_doctor_id) {
      await sql`
        INSERT INTO doctor_assistants (doctor_id, assistant_id)
        VALUES (${parent_doctor_id}, ${newUser.id})
        ON CONFLICT (doctor_id, assistant_id) DO NOTHING
      `;
    }

    // Log the action
    const actorResult = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1`;
    const actorId = actorResult?.[0]?.id || null;

    if (actorId && newUser) {
      await sql`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (
          ${actorId}, 'CREATE_USER', 'users', ${newUser.id}, 
          ${JSON.stringify({ email, role, fullName, targetName: fullName, autoGenerated: true })}
        )
      `;
    }

    // Importante: Retornar el tempPassword para que el admin lo vea UNA VEZ
    return Response.json({
      user: newUser,
      tempPassword
    }, { status: 201 });

  } catch (err) {
    console.error("POST /api/superuser/users error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
