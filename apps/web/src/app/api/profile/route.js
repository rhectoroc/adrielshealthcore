import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const authUserId = session.user.id;

    // Get user profile from users table
    const userRows = await sql`
      SELECT id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified, doctor_id, created_at
      FROM users
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `;

    const userProfile = userRows?.[0] || null;

    return Response.json({ user: userProfile, authUser: session.user });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { role, fullName, mppsNumber, colegioNumber, specialty, rif } =
      body || {};

    // Check if user already exists in users table
    const existingRows = await sql`
      SELECT id, role FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1
    `;

    if (existingRows && existingRows.length > 0) {
      // Update existing user
      const setClauses = [];
      const values = [];
      let paramCount = 1;

      if (fullName && fullName.trim().length > 0) {
        setClauses.push(`full_name = $${paramCount}`);
        values.push(fullName.trim());
        paramCount++;
      }

      if (role) {
        // Prevent accidental downgrade of superuser role from onboarding form
        if (existingRows[0].role === "superuser" && role !== "superuser") {
          console.log("Blocking role downgrade for superuser:", session.user.email);
        } else {
          setClauses.push(`role = $${paramCount}`);
          values.push(role);
          paramCount++;
        }
      }

      if (mppsNumber && mppsNumber.trim().length > 0) {
        setClauses.push(`mpps_number = $${paramCount}`);
        values.push(mppsNumber.trim());
        paramCount++;
      }

      if (colegioNumber && colegioNumber.trim().length > 0) {
        setClauses.push(`colegio_number = $${paramCount}`);
        values.push(colegioNumber.trim());
        paramCount++;
      }

      if (specialty && specialty.trim().length > 0) {
        setClauses.push(`specialty = $${paramCount}`);
        values.push(specialty.trim());
        paramCount++;
      }

      if (rif && rif.trim().length > 0) {
        setClauses.push(`rif = $${paramCount}`);
        values.push(rif.trim());
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
        UPDATE users 
        SET ${setClauses.join(", ")} 
        WHERE id = $${paramCount}
        RETURNING id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified
      `;

      values.push(existingRows[0].id);
      const result = await sql.unsafe(updateQuery, values);
      const updated = result?.[0] || null;

      return Response.json({ user: updated });
    } else {
      // Create new user
      const insertResult = await sql`
        INSERT INTO users (email, role, full_name, mpps_number, colegio_number, specialty, rif)
        VALUES (
          ${session.user.email},
          ${role || "doctor"},
          ${fullName || session.user.name || ""},
          ${mppsNumber || null},
          ${colegioNumber || null},
          ${specialty || null},
          ${rif || null}
        )
        RETURNING id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified
      `;

      const created = insertResult?.[0] || null;
      return Response.json({ user: created });
    }
  } catch (err) {
    console.error("PUT /api/profile error details:", {
      message: err.message,
      stack: err.stack,
      email: session?.user?.email
    });
    return Response.json(
      { error: `Error interno: ${err.message}` },
      { status: 500 },
    );
  }
}
