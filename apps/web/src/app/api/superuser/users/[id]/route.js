import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Update user (superuser only)
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify user is superuser
    const userRows = await sql`
      SELECT role FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1
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

    const { id } = params;

    // Get old values for comparison
    const oldUserResult = await sql`
      SELECT id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified 
      FROM users WHERE id = ${id} LIMIT 1
    `;
    const oldUser = oldUserResult?.[0];

    if (!oldUser) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const {
      fullName,
      mppsNumber,
      colegioNumber,
      specialty,
      rif,
      isVerified,
      role,
    } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    // Mapping of body fields to DB columns
    const fieldMapping = {
      fullName: 'full_name',
      mppsNumber: 'mpps_number',
      colegioNumber: 'colegio_number',
      specialty: 'specialty',
      rif: 'rif',
      isVerified: 'is_verified',
      role: 'role'
    };

    const diff = { targetName: oldUser.full_name, changes: {} };

    Object.entries(body).forEach(([key, newVal]) => {
      const dbCol = fieldMapping[key];
      if (dbCol && newVal !== undefined && newVal !== oldUser[dbCol]) {
        diff.changes[key] = {
          old: oldUser[dbCol],
          new: newVal
        };

        setClauses.push(`${dbCol} = $${paramCount}`);
        values.push(newVal);
        paramCount++;
      }
    });

    if (setClauses.length === 0) {
      return Response.json({ message: "No se detectaron cambios", user: oldUser });
    }

    setClauses.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE users 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING id, email, role, full_name, mpps_number, colegio_number, specialty, rif, is_verified, created_at
    `;

    values.push(id);
    const result = await sql.unsafe(updateQuery, values);
    const updatedUser = result?.[0];

    // Log the action with diff
    const actorResult = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1`;
    const actorId = actorResult?.[0]?.id || null;

    if (actorId) {
      await sql`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (${actorId}, 'UPDATE_USER', 'users', ${id}, ${diff})
      `;
    }

    return Response.json({ user: updatedUser });

    return Response.json({ user });
  } catch (err) {
    console.error("PUT /api/superuser/users/[id] error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// Delete user (superuser only)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify user is superuser
    const userRows = await sql`
      SELECT id, role FROM users WHERE LOWER(email) = LOWER(${session.user.email}) LIMIT 1
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

    const { id } = params;

    // Prevent self-deletion
    if (parseInt(id) === userRows[0].id) {
      return Response.json(
        { error: "No puede eliminar su propia cuenta de SuperUsuario" },
        { status: 400 },
      );
    }

    // Get user details before deletion
    const userToDelete = await sql`
      SELECT email, role, full_name FROM users WHERE id = ${id} LIMIT 1
    `;

    if (!userToDelete || userToDelete.length === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Delete user
    await sql`DELETE FROM users WHERE id = ${id}`;

    // Log the action
    await sql`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (${userRows[0].id}, 'DELETE_USER', 'users', ${id}, ${userToDelete[0]})
    `;

    return Response.json({ success: true, message: "Usuario eliminado" });
  } catch (err) {
    console.error("DELETE /api/superuser/users/[id] error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
