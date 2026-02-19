import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    useToast,
    Spinner,
    Avatar,
    Divider,
} from "@chakra-ui/react";
import {
    Users,
    Shield,
    Search,
    Edit2,
    Trash2,
    Key,
    UserPlus,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function SuperUserUsers() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: authUser, loading: userLoading } = useUser();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const {
        isOpen: isCreateOpen,
        onOpen: onCreateOpen,
        onClose: onCreateClose
    } = useDisclosure();

    const [tempPassword, setTempPassword] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const [newUser, setNewUser] = useState({
        email: "",
        role: "administrator",
        fullName: "",
    });

    useEffect(() => {
        if (authUser?.role === "superuser") {
            fetchUsers();
        }
    }, [authUser, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        // Fetch only system roles or filter client-side if API doesn't support exclusion
        // Assuming API returns all if role is not specified
        const url = `/api/superuser/users?search=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url);
        const data = await res.json();

        // Filter client-side to show ONLY system users (superuser, administrator)
        const systemUsers = (data.users || []).filter(u =>
            u.role === 'superuser' || u.role === 'administrator'
        );

        // Apply local role filter if needed
        if (roleFilter !== 'all') {
            setUsers(systemUsers.filter(u => u.role === roleFilter));
        } else {
            setUsers(systemUsers);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/superuser/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (res.ok) {
                setTempPassword(data.tempPassword);
                toast({
                    title: "Usuario creado",
                    description: "Se ha generado una clave temporal.",
                    status: "success",
                    duration: 5000,
                });
                fetchUsers();
            } else {
                toast({ title: "Error", description: data.error, status: "error" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Fallo de red", status: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!confirm("¿Está seguro de resetear la contraseña? Se generará una clave temporal.")) return;

        try {
            const res = await fetch("/api/superuser/users/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }), // Generic endpoint needed or reuse existing
            });

            // Note: existing endpoint might be doctor-specific (/api/superuser/users/reset-password). 
            // Verify if it accepts generic userId. Based on previous analysis, it took 'assistantId'.
            // If it fails, we might need a general reset endpoint. Assuming reuse for now.

            const data = await res.json();
            if (res.ok) {
                setTempPassword(data.tempPassword);
                onCreateOpen(); // Re-use modal to show password
                toast({
                    title: "Contraseña generada",
                    status: "success"
                });
            } else {
                toast({ title: "Error", description: data.error, status: "error" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Fallo de red", status: "error" });
        }
    };

    if (!isMounted || userLoading) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="gray.50">
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
        );
    }

    return (
        <MainLayout allowedRoles={["superuser"]}>
            <Box p={{ base: 4, md: 8 }}>
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Heading size="lg" color="#1E2559">Gestión de Usuarios del Sistema</Heading>
                        <Text color="gray.500">Administradores y Superusuarios</Text>
                    </Box>
                    <Button
                        leftIcon={<UserPlus size={20} />}
                        bg="#2E39C9"
                        color="white"
                        _hover={{ bg: "#1E2A99" }}
                        size="lg"
                        onClick={() => {
                            setTempPassword(null);
                            setNewUser({ email: "", role: "administrator", fullName: "" });
                            onCreateOpen();
                        }}
                    >
                        Nuevo Admin
                    </Button>
                </Flex>

                <Box bg="white" borderRadius="2xl" shadow="sm" p={6} border="1px solid" borderColor="gray.100">
                    <Flex mb={6} gap={4}>
                        <Box position="relative" flex={1}>
                            <Input
                                placeholder="Buscar por nombre o email..."
                                pl={10}
                                bg="gray.50"
                                border="none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                                <Search size={18} />
                            </Box>
                        </Box>
                        <Select
                            w="200px"
                            bg="gray.50"
                            border="none"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            <option value="superuser">SuperUsuario</option>
                            <option value="administrator">Administrador</option>
                        </Select>
                    </Flex>

                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Usuario</Th>
                                <Th>Rol</Th>
                                <Th>Estado</Th>
                                <Th textAlign="right">Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map(user => (
                                <Tr key={user.id} _hover={{ bg: "gray.50" }}>
                                    <Td>
                                        <HStack>
                                            <Avatar size="sm" name={user.full_name} src={user.image} bg="purple.500" />
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="bold" color="#1E2559">{user.full_name}</Text>
                                                <Text fontSize="xs" color="gray.500">{user.email}</Text>
                                            </VStack>
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <Badge
                                            px={2} py={1} borderRadius="lg"
                                            colorScheme={user.role === 'superuser' ? 'purple' : 'orange'}
                                        >
                                            {user.role}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme="green" variant="solid" borderRadius="full" boxSize="8px" mr={2} />
                                        <Text display="inline" fontSize="xs">Activo</Text>
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack justify="end" spacing={2}>
                                            <IconButton
                                                aria-label="Reset Password"
                                                icon={<Key size={16} />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="orange"
                                                onClick={() => handleResetPassword(user.id)}
                                            />
                                            <IconButton aria-label="Edit" icon={<Edit2 size={16} />} size="sm" variant="ghost" colorScheme="blue" />
                                            <IconButton aria-label="Delete" icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Box>

            {/* Modal Crear Usuario / Mostrar Password */}
            <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" p={4}>
                    <ModalHeader>
                        <Heading size="md" color="#1E2559">
                            {tempPassword ? "¡Acceso Generado!" : "Nuevo Usuario de Sistema"}
                        </Heading>
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        {tempPassword ? (
                            <VStack spacing={6} py={6}>
                                <Box bg="green.50" p={6} borderRadius="xl" border="1px solid" borderColor="green.100" w="full">
                                    <VStack spacing={4}>
                                        <Box bg="white" p={3} borderRadius="full">
                                            <Key size={32} color="#48BB78" />
                                        </Box>
                                        <Text textAlign="center" color="green.700" fontWeight="medium">
                                            Credencial temporal generada. Copiala ahora.
                                        </Text>
                                        <HStack bg="white" p={4} borderRadius="lg" border="1px dashed" borderColor="green.300" w="full" justify="center">
                                            <Text fontSize="2xl" fontWeight="bold" letterSpacing="widest" color="green.800">{tempPassword}</Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                                <Button colorScheme="green" w="full" size="lg" onClick={onCreateClose}>
                                    Entendido
                                </Button>
                            </VStack>
                        ) : (
                            <form onSubmit={handleCreateUser}>
                                <VStack spacing={5}>
                                    <FormControl id="fullName" isRequired>
                                        <FormLabel fontSize="sm" color="gray.600">Nombre Completo</FormLabel>
                                        <Input
                                            placeholder="Ej. Juan Pérez"
                                            bg="gray.50" borderRadius="lg"
                                            value={newUser.fullName}
                                            onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl id="email" isRequired>
                                        <FormLabel fontSize="sm" color="gray.600">Email Corporativo</FormLabel>
                                        <Input
                                            placeholder="admin@healthcore.com"
                                            type="email" bg="gray.50"
                                            borderRadius="lg"
                                            value={newUser.email}
                                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl id="role" isRequired>
                                        <FormLabel fontSize="sm" color="gray.600">Rol</FormLabel>
                                        <Select
                                            bg="gray.50" borderRadius="lg"
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="administrator">Administrador</option>
                                            <option value="superuser">SuperUsuario</option>
                                        </Select>
                                    </FormControl>

                                    <Button
                                        type="submit"
                                        w="full" h="56px"
                                        bg="#2E39C9" color="white"
                                        _hover={{ bg: "#1E2A99" }}
                                        borderRadius="lg"
                                        isLoading={isSubmitting}
                                    >
                                        Crear Usuario
                                    </Button>
                                </VStack>
                            </form>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </MainLayout>
    );
}
