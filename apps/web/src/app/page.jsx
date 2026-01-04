import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Search,
  Bell,
  Menu,
  X,
  Home,
  Calendar,
  Users,
  Clipboard,
  Settings,
  FileText,
  DollarSign,
  UserPlus,
} from "lucide-react";

export default function HomePage() {
  const { data: authUser, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);

          // Redirect to superuser dashboard if user is superuser
          if (data.user && data.user.role === "superuser") {
            console.log("SuperUser detected, redirecting...");
            window.location.href = "/superuser/dashboard";
            return;
          }

          // Redirect to onboarding if profile not complete
          if (!data.user) {
            console.log("No profile found, redirecting to onboarding...");
            window.location.href = "/onboarding";
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
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const url = searchTerm
          ? `/api/patients?search=${encodeURIComponent(searchTerm)}`
          : "/api/patients";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients || []);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    if (userProfile) {
      fetchPatients();
    }
  }, [userProfile, searchTerm]);

  const navItems = [
    { icon: Home, label: "Dashboard", active: true, href: "/" },
    { icon: Users, label: "Pacientes", active: false, href: "/patients" },
    { icon: Calendar, label: "Citas", active: false, href: "/appointments" },
    { icon: Clipboard, label: "Historias", active: false, href: "/records" },
    { icon: FileText, label: "Documentos", active: false, href: "/documents" },
    { icon: DollarSign, label: "Facturación", active: false, href: "/billing" },
    {
      icon: Settings,
      label: "Configuración",
      active: false,
      href: "/settings",
    },
  ];

  if (userLoading) {
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

  if (!authUser) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

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
        className={`fixed left-0 top-0 h-full w-[280px] sm:w-[220px] bg-[#2E39C9] dark:bg-[#1F2937] z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-6">
          <img
            src="https://www.create.xyz/images/logoipsum/249"
            alt="HealthCore"
            className="w-8 h-8 mr-3 filter brightness-0 invert"
          />
          <span className="text-white font-poppins font-semibold text-lg">
            HealthCore
          </span>
        </div>

        {/* Navigation */}
        <nav className="px-4">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${item.active
                ? "bg-[#2E39C9] dark:bg-[#4F46E5] border-l-2 border-white text-white"
                : "text-white text-opacity-60 hover:text-opacity-80 hover:bg-white hover:bg-opacity-10 active:bg-opacity-15"
                }`}
            >
              <item.icon size={18} className="mr-3" />
              <span
                className={`${item.active ? "font-poppins font-semibold" : "font-inter"} text-sm`}
              >
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-4 text-white lg:hidden p-1 rounded hover:bg-white hover:bg-opacity-20 active:bg-opacity-30 transition-all duration-200"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[220px] min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#F8FAFF] dark:bg-[#121212] backdrop-blur-sm border-b border-[#ECEFF9] dark:border-[#374151] flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 lg:justify-end">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#1E2559] dark:text-white lg:hidden p-2 rounded hover:bg-[#F0F2FF] dark:hover:bg-[#374151] active:bg-[#E8EAFB] dark:active:bg-[#4B5563] transition-colors duration-200"
          >
            <Menu size={24} />
          </button>

          {/* Right Side Items */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notification Button */}
            <div className="relative">
              <button className="w-9 h-9 bg-[#EEF1FF] dark:bg-[#374151] rounded-full flex items-center justify-center hover:bg-[#E0E5FF] dark:hover:bg-[#4B5563] active:bg-[#D5DAF9] dark:active:bg-[#6B7280] transition-colors duration-200">
                <Bell
                  size={18}
                  className="text-[#2E39C9] dark:text-[#6366F1]"
                />
              </button>
            </div>

            {/* User Profile */}
            <a
              href="/account/logout"
              className="flex items-center space-x-3 cursor-pointer hover:bg-[#F0F2FF] dark:hover:bg-[#374151] active:bg-[#E8EAFB] dark:active:bg-[#4B5563] transition-colors duration-200 rounded-lg px-2 py-1"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
              <div className="hidden sm:block text-left">
                <div className="font-poppins font-semibold text-sm text-[#1E2559] dark:text-white">
                  {userProfile?.full_name || authUser?.name || "Usuario"}
                </div>
                <div className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                  {userProfile?.specialty || userProfile?.role || ""}
                </div>
              </div>
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-6">
          {/* Header */}
          <div className="mb-6">
            {!userProfile && !userLoading && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-800 font-semibold text-sm">Configuración Requerida</h3>
                  <p className="text-yellow-700 text-xs mt-1">
                    No se encontró un perfil para esta cuenta. Para configurar el sistema como administrador:
                  </p>
                </div>
                <a
                  href="/setup"
                  className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-bold rounded hover:bg-yellow-700 transition-colors"
                >
                  Ir a /setup
                </a>
              </div>
            )}

            {userProfile && userProfile.role === 'doctor' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-blue-800 font-semibold text-sm">Modo Doctor</h3>
                  <p className="text-blue-700 text-xs mt-1">
                    Usted tiene una cuenta de médico. Si cree que debería ser el administrador principal y el sistema aún no tiene uno:
                  </p>
                </div>
                <a
                  href="/setup"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                >
                  Verificar Setup
                </a>
              </div>
            )}

            <h1 className="font-poppins font-semibold text-3xl text-[#1E2559] dark:text-white mb-2">
              Bienvenido, {userProfile?.full_name?.split(" ")[0] || "Doctor"}
            </h1>
            <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
              Sistema de Gestión Clínica HealthCore
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#ECEFF9] dark:border-[#374151] p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="font-poppins font-semibold text-xl text-[#1E2559] dark:text-white mb-1">
                  Búsqueda de Pacientes
                </h2>
                <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                  Buscar por cédula o nombre
                </p>
              </div>
              <a
                href="/patients/new"
                className="flex items-center space-x-2 px-4 py-2 bg-[#2E39C9] dark:bg-[#4F46E5] text-white rounded-lg font-inter font-medium text-sm hover:bg-[#1E2A99] dark:hover:bg-[#4338CA] active:bg-[#1B2080] dark:active:bg-[#3730A3] transition-colors duration-200"
              >
                <UserPlus size={18} />
                <span>Nuevo Paciente</span>
              </a>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B8198] dark:text-[#9CA3AF]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cédula o nombre..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] font-inter text-[#1E2559] dark:text-white placeholder:text-[#7B8198] dark:placeholder:text-[#9CA3AF] outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5] transition-all duration-200"
              />
            </div>

            {/* Patient List */}
            {loadingPatients ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#2E39C9] dark:border-[#4F46E5] border-r-transparent"></div>
                <p className="mt-2 font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                  Buscando pacientes...
                </p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12">
                <Users
                  size={48}
                  className="text-[#7B8198] dark:text-[#9CA3AF] mx-auto mb-4"
                />
                <h3 className="font-poppins font-semibold text-lg text-[#1E2559] dark:text-white mb-2">
                  No se encontraron pacientes
                </h3>
                <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF] mb-6">
                  {searchTerm
                    ? "No hay pacientes que coincidan con su búsqueda"
                    : "Aún no hay pacientes registrados en el sistema"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.map((patient) => (
                  <a
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="block p-4 rounded-lg border border-[#ECEFF9] dark:border-[#374151] hover:bg-[#F9FAFF] dark:hover:bg-[#2D2D2D] hover:border-[#D5DAF9] dark:hover:border-[#4B5563] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <span className="font-poppins font-semibold text-white text-lg">
                            {patient.full_name?.charAt(0)?.toUpperCase() || "P"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-poppins font-semibold text-[#1E2559] dark:text-white">
                            {patient.full_name}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                              Cédula: {patient.cedula}
                            </span>
                            {patient.blood_type && (
                              <>
                                <span className="text-[#7B8198] dark:text-[#9CA3AF]">
                                  •
                                </span>
                                <span className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
                                  Tipo: {patient.blood_type}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#D5F7E8] dark:bg-[#065F46] text-[#1E9E63] dark:text-[#34D399] font-inter font-semibold text-xs">
                          Ver perfil
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        
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
