import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    VStack,
    HStack,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Avatar,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Spinner,
} from "@chakra-ui/react";
import {
    Users,
    ClipboardList,
    Calendar,
    UserPlus,
    ArrowRight,
    Plus,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import useUser from "@/utils/useUser";

export default function DoctorDashboard() {
    const { data: user } = useUser();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAssistant, setNewAssistant] = useState({
        email: "",
        fullName: "",
        role: "nurse",
    });

    useEffect(() => {
        if (user?.id) {
            fetchTeam();
        }
    }, [user]);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`/api/superuser/users?search=${user.id}`); // This needs to be a specific endpoint for doctor's team
            // For now, let's assume we filter in the frontend or we adapt the API
            const res2 = await fetch(`/api/superuser/users`);
            const data = await res2.json();
            const myTeam = data.users.filter(u => u.parent_doctor_id === user.id);
            setTeam(myTeam);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAssistant = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/superuser/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newAssistant,
                    parent_doctor_id: user.id
                }),
            });
            if (res.ok) {
                toast({ title: "Asistente agregado", status: "success" });
                fetchTeam();
                onClose();
            } else {
                const data = await res.json();
                toast({ title: "Error", description: data.error, status: "error" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Fallo de red", status: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout allowedRoles={["doctor"]}>
            <Box p={{ base: 4, md: 8 }}>
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Heading size="lg" color="#1E2559">Dashboard Médico</Heading>
                        <Text color="gray.500">Bienvenido de nuevo, {user?.full_name}</Text>
                    </Box>
                    <HStack spacing={4}>
                        <Button leftIcon={<Calendar size={20} />} variant="outline" colorScheme="blue">
                            Agenda
                        </Button>
                        <Button leftIcon={<Plus size={20} />} bg="#2E39C9" color="white" _hover={{ bg: "#1E2A99" }}>
                            Nueva Consulta
                        </Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                    <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
                        <Stat>
                            <StatLabel color="gray.500">Pacientes Totales</StatLabel>
                            <StatNumber fontSize="3xl" color="#1E2559">128</StatNumber>
                            <StatHelpText color="green.500">+12% este mes</StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
                        <Stat>
                            <StatLabel color="gray.500">Consultas hoy</StatLabel>
                            <StatNumber fontSize="3xl" color="#1E2559">8</StatNumber>
                            <StatHelpText>3 pendientes</StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
                        <Stat>
                            <StatLabel color="gray.500">Recetas emitidas</StatLabel>
                            <StatNumber fontSize="3xl" color="#1E2559">45</StatNumber>
                            <StatHelpText>Últimos 7 días</StatHelpText>
                        </Stat>
                    </Box>
                </SimpleGrid>

                <Box bg="white" borderRadius="2xl" shadow="sm" p={6} mb={8}>
                    <Flex justify="space-between" align="center" mb={6}>
                        <Heading size="md" color="#1E2559">Mi Equipo</Heading>
                        <Button
                            size="sm"
                            leftIcon={<UserPlus size={16} />}
                            colorScheme="blue"
                            onClick={onOpen}
                        >
                            Agregar Asistente
                        </Button>
                    </Flex>

                    {loading ? (
                        <Flex justify="center" py={10}><Spinner color="blue.500" /></Flex>
                    ) : team.length > 0 ? (
                        <Table variant="simple">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Nombre</Th>
                                    <Th>Rol</Th>
                                    <Th>Estado</Th>
                                    <Th textAlign="right">Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {team.map(member => (
                                    <Tr key={member.id}>
                                        <Td>
                                            <HStack>
                                                <Avatar size="xs" name={member.full_name} />
                                                <Text fontWeight="medium">{member.full_name}</Text>
                                            </HStack>
                                        </Td>
                                        <Td><Badge colorScheme="purple">{member.role}</Badge></Td>
                                        <Td><Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>Activo</Badge></Td>
                                        <Td textAlign="right">
                                            <Button size="xs" variant="ghost">Gestionar</Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    ) : (
                        <VStack py={10} spacing={4} opacity={0.5}>
                            <Users size={40} />
                            <Text>No tienes asistentes registrados aún.</Text>
                        </VStack>
                    )}
                </Box>
            </Box>

            {/* Modal Agregar Asistente */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Agregar Miembro al Equipo</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <form onSubmit={handleAddAssistant}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <Input
                                        placeholder="Nombre del asistente"
                                        value={newAssistant.fullName}
                                        onChange={e => setNewAssistant({ ...newAssistant, fullName: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="email@ejemplo.com"
                                        value={newAssistant.email}
                                        onChange={e => setNewAssistant({ ...newAssistant, email: e.target.value })}
                                    />
                                </FormControl>
                                <Button
                                    type="submit"
                                    w="full"
                                    colorScheme="blue"
                                    isLoading={isSubmitting}
                                >
                                    Confirmar Registro
                                </Button>
                            </VStack>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </MainLayout>
    );
}
