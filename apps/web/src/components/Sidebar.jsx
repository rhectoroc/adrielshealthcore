import {
    Box,
    VStack,
    Text,
    Flex,
    Button,
    Icon,
    Divider,
    HStack,
    Avatar,
    BoxProps,
} from "@chakra-ui/react";
import {
    Users,
    Shield,
    Activity,
    Database,
    Settings,
    LogOut,
    LayoutDashboard,
    ClipboardList,
    UserCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const Sidebar = ({ role, userProfile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const superUserItems = [
        { icon: LayoutDashboard, label: "Dashboard Global", path: "/superuser/overview" },
        { icon: Users, label: "Usuarios", path: "/superuser/users" },
        { icon: Users, label: "Gestión Médica", path: "/superuser/dashboard" },
        { icon: Activity, label: "Auditoría", path: "/superuser/audit" },
        { icon: Database, label: "Base de Datos", path: "/superuser/database" },
        { icon: Settings, label: "Configuración", path: "/superuser/settings" },
    ];

    const doctorItems = [
        { icon: LayoutDashboard, label: "Dashboard Médico", path: "/doctor/dashboard" },
        { icon: UserCircle, label: "Mi Equipo", path: "/doctor/team" },
        { icon: Users, label: "Mis Pacientes", path: "/patients" },
        { icon: ClipboardList, label: "Consultas", path: "#" },
        { icon: Activity, label: "Reportes", path: "#" },
    ];

    const menuItems = role === "superuser" ? superUserItems : doctorItems;

    return (
        <Box
            w="260px"
            bgGradient="linear(to-b, #2E39C9, #1E2A99)"
            color="white"
            p={6}
            display={{ base: "none", lg: "flex" }}
            flexDirection="column"
            h="100vh"
            position="sticky"
            top={0}
            left={0}
        >
            <Flex align="center" mb={10}>
                <Shield size={32} />
                <VStack align="start" spacing={0} ml={3}>
                    <Text fontWeight="bold" fontSize="lg">HealthCore</Text>
                    <Text fontSize="xs" opacity={0.7}>
                        {role === "superuser" ? "Administración" : "Médico Especialista"}
                    </Text>
                </VStack>
            </Flex>

            <VStack align="stretch" spacing={2} flex={1}>
                {menuItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.path}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </VStack>

            <Box pt={10}>
                <HStack mb={6} spacing={3}>
                    <Avatar size="sm" name={userProfile?.full_name} src={userProfile?.image} />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{userProfile?.full_name}</Text>
                        <Text fontSize="xs" opacity={0.6} noOfLines={1}>{userProfile?.email}</Text>
                    </VStack>
                </HStack>
                <Divider mb={4} opacity={0.2} />
                <Button
                    leftIcon={<LogOut size={18} />}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    w="full"
                    justifyContent="start"
                    onClick={() => window.location.href = "/account/logout"}
                    h="48px"
                    borderRadius="xl"
                    _hover={{ bg: "whiteAlpha.200" }}
                >
                    Cerrar Sesión
                </Button>
            </Box>
        </Box>
    );
};

function NavItem({ icon: Icon, label, active, onClick }) {
    return (
        <Button
            leftIcon={<Icon size={18} />}
            variant={active ? "solid" : "ghost"}
            bg={active ? "white" : "transparent"}
            color={active ? "#2E39C9" : "whiteAlpha.800"}
            _hover={{ bg: active ? "white" : "whiteAlpha.200", color: active ? "#2E39C9" : "white" }}
            justifyContent="start"
            h="48px"
            borderRadius="xl"
            onClick={onClick}
        >
            <Text fontSize="sm" fontWeight={active ? "bold" : "medium"}>{label}</Text>
        </Button>
    );
}

export default Sidebar;
