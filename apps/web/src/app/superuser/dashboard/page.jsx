import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Users,
  Shield,
  Activity,
  Database,
  Calendar,
  FileText,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Menu,
  X,
  LogOut,
  BarChart3,
  Clock,
} from "lucide-react";

export default function SuperUserDashboard() {
  const { data: authUser, loading: userLoading } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  const [newUser, setNewUser] = useState({
    email: "",
    role: "doctor",
    fullName: "",
    mppsNumber: "",
    colegioNumber: "",
    specialty: "",
    rif: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);

          if (!data.user || data.user.role !== "superuser") {
            window.location.href = "/";
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (authUser && !userLoading) {
      fetchProfile();
    }
  }, [authUser, userLoading]);

  useEffect(() => {
    if (userProfile?.role === "superuser") {
      fetchStats();
      fetchUsers();
      fetchLogs();
      fetchSpecialties();
    }
  }, [userProfile]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/superuser/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const url = `/api/superuser/users?role=${roleFilter}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/superuser/logs?limit=50");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await fetch("/api/specialties");
      if (res.ok) {
        const data = await res.json();
        setSpecialties(data.specialties || []);
      }
    } catch (err) {
      console.error("Error fetching specialties:", err);
    }
  };

  useEffect(() => {
    if (userProfile?.role === "superuser") {
      fetchUsers();
    }
  }, [searchTerm, roleFilter, userProfile]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superuser/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewUser({
          email: "",
          role: "doctor",
          fullName: "",
          mppsNumber: "",
          colegioNumber: "",
          specialty: "",
          rif: "",
        });
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Error al crear usuario");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Error al crear usuario");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/superuser/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error al eliminar usuario");
    }
  };

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      const res = await fetch(`/api/superuser/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !isVerified }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar usuario");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error al actualizar usuario");
    }
  };

  if (userLoading || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFF] dark:bg-[#121212]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2E39C9] dark:border-[#4F46E5] border-r-transparent"></div>
          <p className="mt-4 font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "users", icon: Users, label: "Gestión de Usuarios" },
    { id: "logs", icon: Activity, label: "Logs de Auditoría" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#121212]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] sm:w-[220px] bg-gradient-to-b from-[#2E39C9] to-[#1E2A99] dark:from-[#1F2937] dark:to-[#111827] z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center px-6 py-6">
          <Shield className="w-8 h-8 mr-3 text-white" />
          <div>
            <span className="text-white font-poppins font-bold text-lg block">
              SuperUsuario
            </span>
            <span className="text-white text-opacity-60 font-inter text-xs">
              Panel de Control
            </span>
          </div>
        </div>

        <nav className="px-4 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-white dark:bg-[#374151] text-[#2E39C9] dark:text-white shadow-lg"
                  : "text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <item.icon size={18} className="mr-3" />
              <span className="font-inter text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <a
            href="/account/logout"
            className="w-full flex items-center px-4 py-3 rounded-lg text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            <LogOut size={18} className="mr-3" />
            <span className="font-inter text-sm">Cerrar Sesión</span>
          </a>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-4 text-white lg:hidden p-1 rounded hover:bg-white hover:bg-opacity-20"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[220px] min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-[#1E1E1E] border-b border-[#ECEFF9] dark:border-[#374151] flex items-center justify-between px-4 sm:px-6 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#1E2559] dark:text-white lg:hidden p-2 rounded hover:bg-[#F0F2FF] dark:hover:bg-[#374151]"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-poppins font-semibold text-sm text-[#1E2559] dark:text-white">
                {userProfile?.full_name || "SuperUsuario"}
              </div>
              <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                Administrador del Sistema
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6">
          {activeTab === "dashboard" && stats && (
            <div>
              <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-6">
                Dashboard del Sistema
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-10 h-10 text-blue-500" />
                    <span className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white">
                      {stats.totalUsers}
                    </span>
                  </div>
                  <h3 className="font-inter font-medium text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                    Total Usuarios
                  </h3>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-10 h-10 text-green-500" />
                    <span className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white">
                      {stats.patients}
                    </span>
                  </div>
                  <h3 className="font-inter font-medium text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                    Total Pacientes
                  </h3>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-10 h-10 text-purple-500" />
                    <span className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white">
                      {stats.appointments}
                    </span>
                  </div>
                  <h3 className="font-inter font-medium text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                    Total Citas
                  </h3>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-10 h-10 text-orange-500" />
                    <span className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white">
                      {stats.records}
                    </span>
                  </div>
                  <h3 className="font-inter font-medium text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                    Historias Clínicas
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
                  <div className="font-poppins font-bold text-2xl text-blue-700 dark:text-blue-300 mb-1">
                    {stats.users.doctor}
                  </div>
                  <div className="font-inter text-sm text-blue-600 dark:text-blue-400">
                    Médicos
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
                  <div className="font-poppins font-bold text-2xl text-green-700 dark:text-green-300 mb-1">
                    {stats.users.nurse}
                  </div>
                  <div className="font-inter text-sm text-green-600 dark:text-green-400">
                    Enfermeras
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
                  <div className="font-poppins font-bold text-2xl text-purple-700 dark:text-purple-300 mb-1">
                    {stats.users.administrator}
                  </div>
                  <div className="font-inter text-sm text-purple-600 dark:text-purple-400">
                    Administrativos
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
                  <div className="font-poppins font-bold text-2xl text-orange-700 dark:text-orange-300 mb-1">
                    {stats.users.superuser}
                  </div>
                  <div className="font-inter text-sm text-orange-600 dark:text-orange-400">
                    SuperUsuarios
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                <h2 className="font-poppins font-semibold text-xl text-[#1E2559] dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Actividad Reciente
                </h2>
                <div className="space-y-3">
                  {stats.recentActivity.slice(0, 5).map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-[#ECEFF9] dark:border-[#374151] last:border-0"
                    >
                      <div className="flex-1">
                        <div className="font-inter text-sm text-[#1E2559] dark:text-white">
                          <span className="font-semibold">
                            {log.full_name || "Sistema"}
                          </span>{" "}
                          <span className="text-[#7B8198] dark:text-[#9CA3AF]">
                            {log.action === "CREATE_USER" && "creó un usuario"}
                            {log.action === "UPDATE_USER" &&
                              "actualizó un usuario"}
                            {log.action === "DELETE_USER" &&
                              "eliminó un usuario"}
                          </span>
                        </div>
                        <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF] mt-1">
                          {new Date(log.created_at).toLocaleString("es-VE")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white">
                  Gestión de Usuarios
                </h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2E39C9] dark:bg-[#4F46E5] text-white rounded-lg font-inter font-medium text-sm hover:bg-[#1E2A99] dark:hover:bg-[#4338CA]"
                >
                  <UserPlus size={18} />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                  <div className="relative flex-1">
                    <Search
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8198] dark:text-[#9CA3AF]"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre o email..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] font-inter text-sm text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] font-inter text-sm text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="superuser">SuperUsuario</option>
                    <option value="doctor">Médicos</option>
                    <option value="nurse">Enfermeras</option>
                    <option value="administrator">Administrativos</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#ECEFF9] dark:border-[#374151]">
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">
                          Usuario
                        </th>
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">
                          Rol
                        </th>
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">
                          Especialidad
                        </th>
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">
                          Estado
                        </th>
                        <th className="text-right font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-[#ECEFF9] dark:border-[#374151] hover:bg-[#F9FAFF] dark:hover:bg-[#2D2D2D]"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                                {user.full_name}
                              </div>
                              <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full font-inter font-semibold text-xs ${
                                user.role === "superuser"
                                  ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                                  : user.role === "doctor"
                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                    : user.role === "nurse"
                                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                      : "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                              }`}
                            >
                              {user.role === "superuser" && "SuperUsuario"}
                              {user.role === "doctor" && "Médico"}
                              {user.role === "nurse" && "Enfermera"}
                              {user.role === "administrator" &&
                                "Administrativo"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                              {user.specialty || "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                handleVerifyUser(user.id, user.is_verified)
                              }
                              className="flex items-center space-x-1"
                            >
                              {user.is_verified ? (
                                <>
                                  <CheckCircle
                                    size={16}
                                    className="text-green-500"
                                  />
                                  <span className="font-inter text-xs text-green-600 dark:text-green-400">
                                    Verificado
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle
                                    size={16}
                                    className="text-yellow-500"
                                  />
                                  <span className="font-inter text-xs text-yellow-600 dark:text-yellow-400">
                                    Pendiente
                                  </span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div>
              <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-6">
                Logs de Auditoría
              </h1>

              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6">
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 py-4 border-b border-[#ECEFF9] dark:border-[#374151] last:border-0"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-inter font-semibold text-sm text-[#1E2559] dark:text-white">
                            {log.full_name || "Sistema"}
                          </span>
                          <span className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                            ({log.email})
                          </span>
                        </div>
                        <div className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF] mb-2">
                          Acción:{" "}
                          <span className="font-semibold">{log.action}</span> en{" "}
                          {log.entity_type}
                        </div>
                        <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                          {new Date(log.created_at).toLocaleString("es-VE")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#ECEFF9] dark:border-[#374151] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white mb-6">
              Crear Nuevo Usuario
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.fullName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, fullName: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                  />
                </div>

                <div>
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                  />
                </div>

                <div>
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                    Rol *
                  </label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                  >
                    <option value="doctor">Médico</option>
                    <option value="nurse">Enfermera</option>
                    <option value="administrator">Administrativo</option>
                  </select>
                </div>

                {newUser.role === "doctor" && (
                  <>
                    <div>
                      <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                        MPPS
                      </label>
                      <input
                        type="text"
                        value={newUser.mppsNumber}
                        onChange={(e) =>
                          setNewUser({ ...newUser, mppsNumber: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                        Colegio
                      </label>
                      <input
                        type="text"
                        value={newUser.colegioNumber}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            colegioNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                        Especialidad
                      </label>
                      <select
                        value={newUser.specialty}
                        onChange={(e) =>
                          setNewUser({ ...newUser, specialty: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                      >
                        <option value="">Seleccione</option>
                        {specialties.map((spec) => (
                          <option key={spec.id} value={spec.name}>
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white mb-2">
                        RIF
                      </label>
                      <input
                        type="text"
                        value={newUser.rif}
                        onChange={(e) =>
                          setNewUser({ ...newUser, rif: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-2 font-inter text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#ECEFF9] dark:border-[#374151] font-inter font-medium text-sm text-[#1E2559] dark:text-white hover:bg-[#F9FAFF] dark:hover:bg-[#2D2D2D]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#2E39C9] dark:bg-[#4F46E5] text-white font-inter font-medium text-sm hover:bg-[#1E2A99] dark:hover:bg-[#4338CA]"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
