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
import {
  Box,
  Flex,
  Select,
  Text
} from "@chakra-ui/react";
import PatientSearch from "@/components/PatientSearch";

export default function HomePage() {
  const { data: authUser, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [associatedDoctors, setAssociatedDoctors] = useState([]);
  const [currentContextDoctor, setCurrentContextDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
          setAssociatedDoctors(data.associatedDoctors || []);

          // Si es asistente, usar el primer doctor como contexto por defecto o el guardado
          if (data.user?.role === 'nurse' || data.user?.role === 'administrator') {
            const savedContextId = localStorage.getItem("healthcore_doctor_context");
            const defaultDoctor = data.associatedDoctors?.find(d => d.uuid === savedContextId) || data.associatedDoctors?.[0];
            if (defaultDoctor) {
              setCurrentContextDoctor(defaultDoctor);
              if (!savedContextId) localStorage.setItem("healthcore_doctor_context", defaultDoctor.uuid);
            }
          }

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
            return;
          }

          setLoadingProfile(false);
        } else {
          // Handle fetch error
          setLoadingProfile(false);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoadingProfile(false);
      }
    };

    if (authUser && !userLoading) {
      fetchProfile();
    } else if (!userLoading && !authUser) {
      // If not logged in, let the next check handle redirect
      setLoadingProfile(false);
    }
  }, [authUser, userLoading]);

  // Items de navegación (sidebar)
  const navItems = [
    { icon: Home, label: "Panel Principal", href: "/", active: true },
    { icon: Calendar, label: "Agenda Médica", href: "/agenda" },
    { icon: Users, label: "Mis Pacientes", href: "/patients" },
    { icon: Clipboard, label: "Consultas Pendientes", href: "/consultations" },
    { icon: FileText, label: "Reportes", href: "/reports" },
    { icon: DollarSign, label: "Honorarios y Pagos", href: "/billing" },
    { icon: Settings, label: "Configuración", href: "/settings" },
  ];

  if (userLoading || loadingProfile) {
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

            {/* Selector de Contexto para Asistentes */}
            {associatedDoctors.length > 0 && (
              <Box mr={4}>
                <Select
                  size="sm"
                  bg="white"
                  borderRadius="md"
                  value={currentContextDoctor?.uuid || ""}
                  onChange={(e) => {
                    const doc = associatedDoctors.find(d => d.uuid === e.target.value);
                    setCurrentContextDoctor(doc);
                    localStorage.setItem("healthcore_doctor_context", e.target.value);
                    window.location.reload(); // Recargar para aplicar filtros globales
                  }}
                >
                  {associatedDoctors.map(doc => (
                    <option key={doc.uuid} value={doc.uuid}>
                      {doc.full_name} ({doc.specialty || "Médico"})
                    </option>
                  ))}
                </Select>
              </Box>
            )}

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
              {currentContextDoctor ? ` | Unidad de ${currentContextDoctor.specialty}` : ""}
            </p>
          </div>

          {/* Tools por Especialidad */}
          {currentContextDoctor?.specialty === 'Cardiología' && (
            <Flex gap={4} mb={6}>
              <Box p={4} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.100" flex={1}>
                <Text fontWeight="bold" color="red.700" size="xs">Calculadora de Riesgo CV</Text>
                <Text fontSize="xs" color="red.600">Herramienta de Especialidad Activa</Text>
              </Box>
              <Box p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100" flex={1}>
                <Text fontWeight="bold" color="blue.700" size="xs">Visor de ECG</Text>
                <Text fontSize="xs" color="blue.600">Acceso rápido a telemetría</Text>
              </Box>
            </Flex>
          )}

          {currentContextDoctor?.specialty === 'Pediatría' && (
            <Flex gap={4} mb={6}>
              <Box p={4} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100" flex={1}>
                <Text fontWeight="bold" color="green.700" size="xs">Curvas de Crecimiento</Text>
                <Text fontSize="xs" color="green.600">Percentiles OMS v2026</Text>
              </Box>
              <Box p={4} bg="yellow.50" borderRadius="xl" border="1px solid" borderColor="yellow.100" flex={1}>
                <Text fontWeight="bold" color="yellow.700" size="xs">Esquema Vacunación</Text>
                <Text fontSize="xs" color="yellow.600">Control de dosis pendientes</Text>
              </Box>
            </Flex>
          )}

          {/* Search Section */}
          <Box bg="white" _dark={{ bg: "#1E1E1E", borderColor: "#374151" }} borderRadius="2xl" border="1px solid" borderColor="#ECEFF9" p={6} mb={6}>
            <PatientSearch
              onPatientSelect={(patient) => {
                console.log("Paciente seleccionado:", patient);
                // Aquí se activará el Paso 3: MedicalActionPanel
                window.location.href = `/patients/${patient.id}`;
              }}
            />
          </Box>
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
