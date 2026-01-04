import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get system statistics (superuser only)
export async function GET() {
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

    // Get user counts by role
    const userCounts = await sql`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;

    // Get total patients
    const patientCount = await sql`
      SELECT COUNT(*) as count FROM patients
    `;

    // Get total appointments
    const appointmentCount = await sql`
      SELECT COUNT(*) as count FROM appointments
    `;

    // Get total medical records
    const recordCount = await sql`
      SELECT COUNT(*) as count FROM medical_records
    `;

    // Get recent activity
    const recentActivity = await sql`
      SELECT al.*, u.full_name, u.email, u.role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `;

    // Format user counts
    const userStats = {
      superuser: 0,
      doctor: 0,
      nurse: 0,
      administrator: 0,
    };

    userCounts.forEach((row) => {
      userStats[row.role] = parseInt(row.count);
    });

    return Response.json({
      users: userStats,
      totalUsers: Object.values(userStats).reduce((a, b) => a + b, 0),
      patients: parseInt(patientCount?.[0]?.count || 0),
      appointments: parseInt(appointmentCount?.[0]?.count || 0),
      records: parseInt(recordCount?.[0]?.count || 0),
      recentActivity: recentActivity || [],
    });
  } catch (err) {
    console.error("GET /api/superuser/stats error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
