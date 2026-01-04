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
  Settings,
  Download,
  Upload,
  Globe,
  Briefcase
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
  const [systemSettings, setSystemSettings] = useState({
    language: "es",
    date_format: "MM/DD/YYYY",
    timezone: "America/Caracas"
  });
  const [backupLoading, setBackupLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newUser, setNewUser] = useState({
    email: "",
    role: "doctor",
    fullName: "",
    mppsNumber: "",
    colegioNumber: "",
    specialty: "",
    rif: "",
    parent_doctor_id: ""
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
      fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/superuser/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSystemSettings(data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const res = await fetch("/api/superuser/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (err) {
      console.error("Error updating setting:", err);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch("/api/superuser/backup");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Error backup:", err);
      alert("Error al generar backup");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const res = await fetch("/api/superuser/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data })
        });
        if (res.ok) {
          alert("Base de datos restaurada con éxito");
          window.location.reload();
        } else {
          alert("Error al restaurar");
        }
      } catch (err) {
        console.error("Restore error:", err);
        alert("Archivo inválido");
      }
    };
    reader.readAsText(file);
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
          parent_doctor_id: ""
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

  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      mppsNumber: user.mpps_number || "",
      colegioNumber: user.colegio_number || "",
      specialty: user.specialty || "",
      rif: user.rif || "",
      parent_doctor_id: user.parent_doctor_id || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/superuser/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingUser(null);
        setNewUser({
          email: "",
          role: "doctor",
          fullName: "",
          mppsNumber: "",
          colegioNumber: "",
          specialty: "",
          rif: "",
          parent_doctor_id: ""
        });
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar usuario");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error al actualizar usuario");
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
    { id: "users", icon: Users, label: "Personal Médico" },
    { id: "logs", icon: Activity, label: "Auditoría" },
    { id: "database", icon: Database, label: "Base de Datos" },
    { id: "settings", icon: Settings, label: "Configuración" },
  ];

  const doctors = users.filter(u => u.role === 'doctor');

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
              Adm. del Sistema
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
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${activeTab === item.id
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-poppins font-semibold text-sm text-[#1E2559] dark:text-white">
                {userProfile?.full_name || "Admin"}
              </div>
              <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                Sistema General
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6">
          {activeTab === "dashboard" && stats && (
            <div>
              <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-6">
                Resumen del Sistema
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-10 h-10 text-blue-500" />
                    <span className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white">
                      {stats.totalUsers}
                    </span>
                  </div>
                  <h3 className="font-inter font-medium text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                    Total Personal
                  </h3>
                </div>

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
                    Equipo Soporte
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
                  <div className="font-poppins font-bold text-2xl text-orange-700 dark:text-orange-300 mb-1">
                    {stats.users.superuser}
                  </div>
                  <div className="font-inter text-sm text-orange-600 dark:text-orange-400">
                    Administradores
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6 shadow-sm">
                <h2 className="font-poppins font-semibold text-xl text-[#1E2559] dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                  Actividad Administrativa
                </h2>
                <div className="space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((log, index) => (
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
                              {log.action === "CREATE_USER" && "registró nuevo personal"}
                              {log.action === "UPDATE_USER" && "actualizó perfil"}
                              {log.action === "DELETE_USER" && "eliminó cuenta"}
                              {log.action === "UPDATE_SETTINGS" && "cambió configuración global"}
                            </span>
                          </div>
                          <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF] mt-1">
                            {new Date(log.created_at).toLocaleString("es-VE")}
                          </div>
                          {log.details && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-[#262626] rounded text-[10px] font-mono text-[#5C6178] line-clamp-1">
                              {JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#7B8198] text-sm italic">No hay actividad reciente registrada.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white">
                  Personal Médico y Soporte
                </h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2E39C9] dark:bg-[#4F46E5] text-white rounded-lg font-inter font-medium text-sm hover:bg-[#1E2A99] dark:hover:bg-[#4338CA] shadow-md transition-all"
                >
                  <UserPlus size={18} />
                  <span>Crear</span>
                </button>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] dark:border-[#374151] p-6 shadow-sm">
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
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] font-inter text-sm"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] font-inter text-sm"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="doctor">Médicos</option>
                    <option value="nurse">Enfermería</option>
                    <option value="administrator">Administrativos</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#ECEFF9] dark:border-[#374151]">
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">Personal</th>
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">Rol</th>
                        <th className="text-left font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">Especialidad / Equipo</th>
                        <th className="text-right font-poppins font-semibold text-sm text-[#1E2559] dark:text-white py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-[#ECEFF9] dark:border-[#374151] hover:bg-[#F9FAFF] dark:hover:bg-[#2D2D2D] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-inter font-medium text-sm text-[#1E2559] dark:text-white">{user.full_name}</div>
                              <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.role === 'doctor' ? (
                              <div className="text-xs font-medium text-indigo-600 flex items-center">
                                <Search size={12} className="mr-1" /> Ver equipo asignado
                              </div>
                            ) : (
                              <div className="text-xs text-[#7B8198]">
                                Asignado a: <span className="text-blue-600">{doctors.find(d => d.id === user.parent_doctor_id)?.full_name || 'Sin asignar'}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button onClick={() => handleEditClick(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
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

          {activeTab === "database" && (
            <div className="max-w-4xl mx-auto">
              <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-6">Mantenimiento de Datos</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-[#ECEFF9] shadow-sm flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Download className="text-blue-600" size={32} />
                  </div>
                  <h3 className="font-poppins font-bold text-lg mb-2">Respaldar Sistema</h3>
                  <p className="text-sm text-[#7B8198] mb-6">Descarga un archivo JSON con toda la información de usuarios, especialidades y configuraciones.</p>
                  <button
                    onClick={handleBackup}
                    disabled={backupLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {backupLoading ? "Generando..." : "Descargar Backup"}
                  </button>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-[#ECEFF9] shadow-sm flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="text-orange-600" size={32} />
                  </div>
                  <h3 className="font-poppins font-bold text-lg mb-2">Restaurar Sistema</h3>
                  <p className="text-sm text-[#7B8198] mb-6">Carga un archivo de respaldo previo para restaurar el estado del sistema. Esto sobrescribirá datos actuales.</p>
                  <label className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition cursor-pointer text-center">
                    Subir Archivo
                    <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-xl">
              <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-6">Preferencias Globales</h1>

              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] p-6 shadow-sm space-y-6">
                <div>
                  <label className="flex items-center text-sm font-bold text-[#1E2559] mb-3">
                    <Globe size={18} className="mr-2 text-blue-500" /> Idioma Predeterminado
                  </label>
                  <select
                    value={systemSettings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="es">Español (Castellano)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-bold text-[#1E2559] mb-3">
                    <Calendar size={18} className="mr-2 text-green-500" /> Formato de Fecha
                  </label>
                  <select
                    value={systemSettings.date_format}
                    onChange={(e) => updateSetting('date_format', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="MM/DD/YYYY">MM / DD / YYYY (Estándar)</option>
                    <option value="DD/MM/YYYY">DD / MM / YYYY (Europeo)</option>
                    <option value="YYYY-MM-DD">YYYY - MM - DD (ISO)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400 italic">
                  <Clock size={12} className="mr-1" /> Último cambio: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div>
              <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-6">Registro de Auditoría</h1>
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#ECEFF9] p-6 shadow-sm">
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-4 py-4 border-b last:border-0">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{log.full_name} <span className="font-normal text-gray-500">[{log.role}]</span></p>
                        <p className="text-sm text-gray-600">{log.action} en {log.entity_type}</p>
                        {log.details && (
                          <div className="mt-2 p-3 bg-[#F8FAFF] dark:bg-[#262626] border border-[#ECEFF9] dark:border-[#374151] rounded-lg">
                            <p className="text-[10px] font-bold text-[#7B8198] dark:text-[#9CA3AF] uppercase mb-1">Detalles del Cambio:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-[9px] text-[#A0A5BA] uppercase">{key}</span>
                                  <span className="text-xs font-medium text-[#1E2559] dark:text-white truncate" title={String(value)}>
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</p>
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
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#ECEFF9] dark:border-[#374151] p-8 max-w-2xl w-full">
            <h2 className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white mb-6">Crear Nuevo Personal</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                  <input type="text" required value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol en el Sistema</label>
                  <select required value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <option value="doctor">Médico</option>
                    <option value="nurse">Enfermería</option>
                    <option value="administrator">Administrativo</option>
                  </select>
                </div>
                {newUser.role !== 'doctor' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Asignar a Médico (Equipo)</label>
                    <select value={newUser.parent_doctor_id} onChange={e => setNewUser({ ...newUser, parent_doctor_id: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 border-blue-200">
                      <option value="">Seleccione un médico</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} ({d.specialty})</option>)}
                    </select>
                  </div>
                )}
                {newUser.role === 'doctor' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Especialidad</label>
                    <select value={newUser.specialty} onChange={e => setNewUser({ ...newUser, specialty: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <option value="">Seleccione</option>
                      {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 p-4 rounded-xl font-bold bg-gray-100">Cancelar</button>
                <button type="submit" className="flex-1 p-4 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#ECEFF9] dark:border-[#374151] p-8 max-w-2xl w-full">
            <h2 className="font-poppins font-bold text-2xl text-[#1E2559] dark:text-white mb-6">Editar Personal</h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                  <input type="text" required value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Correo Electrónico</label>
                  <input type="email" required disabled value={newUser.email} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-200 cursor-not-allowed" title="El email no puede ser modificado" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol en el Sistema</label>
                  <select required value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <option value="doctor">Médico</option>
                    <option value="nurse">Enfermería</option>
                    <option value="administrator">Administrativo</option>
                  </select>
                </div>
                {newUser.role !== 'doctor' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Asignar a Médico (Equipo)</label>
                    <select value={newUser.parent_doctor_id} onChange={e => setNewUser({ ...newUser, parent_doctor_id: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 border-blue-200">
                      <option value="">Seleccione un médico</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} ({d.specialty})</option>)}
                    </select>
                  </div>
                )}
                {newUser.role === 'doctor' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Especialidad</label>
                    <select value={newUser.specialty} onChange={e => setNewUser({ ...newUser, specialty: e.target.value })} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <option value="">Seleccione</option>
                      {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 p-4 rounded-xl font-bold bg-gray-100">Cancelar</button>
                <button type="submit" className="flex-1 p-4 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
