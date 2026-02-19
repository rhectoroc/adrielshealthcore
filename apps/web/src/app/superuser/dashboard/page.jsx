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
  ModalFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Avatar,
  Divider,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  Users,
  Shield,
  Activity,
  Database,
  Lock,
  Settings,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  LogOut,
  ChevronRight,
  UserPlus,
  Key,
} from "lucide-react";

export default function SuperUserDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: authUser, loading: userLoading } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose
  } = useDisclosure();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [newUser, setNewUser] = useState({
    email: "",
    role: "doctor",
    fullName: "",
    mppsNumber: "",
    colegioNumber: "",
    specialtyId: "",
    rif: "",
    parent_doctor_id: ""
  });

  useEffect(() => {
    if (authUser) {
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          setUserProfile(data.user);
          if (data.user?.role !== "superuser") window.location.href = "/";
        });
    }
  }, [authUser]);

  useEffect(() => {
    if (userProfile?.role === "superuser") {
      fetchUsers();
      fetchSpecialties();
    }
  }, [userProfile, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    const url = `/api/superuser/users?role=${roleFilter === 'all' ? '' : roleFilter}&search=${encodeURIComponent(searchTerm)}`;
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchSpecialties = async () => {
    const res = await fetch("/api/specialties");
    const data = await res.json();
    setSpecialties(data.specialties || []);
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
        // No cerramos el modal si hay tempPassword para que el admin la vea
      } else {
        toast({ title: "Error", description: data.error, status: "error" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Fallo de red", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTeam = (doctor) => {
    setSelectedDoctor(doctor);
    onDetailOpen();
  };

  const handleResetPassword = async (assistantId) => {
    if (!confirm("¿Está seguro de resetear la contraseña de este asistente? Se generará una clave temporal.")) return;

    try {
      const res = await fetch("/api/superuser/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assistantId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.tempPassword);
        toast({
          title: "Contraseña Reseteada",
          description: "Se ha generado una nueva clave temporal.",
          status: "success",
          duration: 5000,
        });
        // Si el modal de detalle está abierto, podemos mostrar la clave allí o usar una variable global
      } else {
        toast({ title: "Error", description: data.error, status: "error" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Fallo de red", status: "error" });
    }
  };

  if (!isMounted || userLoading || !userProfile) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="gray.50">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  const doctors = users.filter(u => u.role === 'doctor');
  const staff = users.filter(u => u.role === 'nurse' || u.role === 'administrator');

  return (
    <Flex minH="100vh" bg="#F8FAFF">
      {/* Sidebar - Personalizado con el Azul del sistema */}
      <Box
        w="260px"
        bgGradient="linear(to-b, #2E39C9, #1E2A99)"
        color="white"
        p={6}
        display={{ base: "none", lg: "block" }}
      >
        <Flex align="center" mb={10}>
          <Shield size={32} />
          <VStack align="start" spacing={0} ml={3}>
            <Text fontWeight="bold" fontSize="lg">HealthCore</Text>
            <Text fontSize="xs" opacity={0.7}>Administración</Text>
          </VStack>
        </Flex>

        <VStack align="stretch" spacing={2}>
          <NavItem icon={Users} label="Gestión Médica" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem icon={Activity} label="Auditoría" active={activeTab === "logs"} onClick={() => setActiveTab("logs")} />
          <NavItem icon={Database} label="Base de Datos" active={activeTab === "db"} onClick={() => setActiveTab("db")} />
          <NavItem icon={Settings} label="Configuración" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </VStack>

        <Box mt="auto" pt={10}>
          <Button
            leftIcon={<LogOut size={18} />}
            variant="ghost"
            colorScheme="whiteAlpha"
            w="full"
            justifyContent="start"
            onClick={() => window.location.href = "/account/logout"}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} p={{ base: 4, md: 8 }} overflowY="auto">
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="lg" color="#1E2559">Gestión de Unidades Médicas</Heading>
            <Text color="gray.500">Panel de control de especialistas y equipos</Text>
          </Box>
          <Button
            leftIcon={<UserPlus size={20} />}
            bg="#2E39C9"
            color="white"
            _hover={{ bg: "#1E2A99" }}
            size="lg"
            onClick={() => {
              setTempPassword(null);
              setNewUser({ email: "", role: "doctor", fullName: "", mppsNumber: "", colegioNumber: "", specialtyId: "", rif: "" });
              onCreateOpen();
            }}
          >
            Nuevo Médico
          </Button>
        </Flex>

        {activeTab === "users" && (
          <Box bg="white" borderRadius="2xl" shadow="sm" p={6} border="1px solid" borderColor="gray.100">
            <Flex mb={6} gap={4}>
              <Box position="relative" flex={1}>
                <Input
                  id="user-search"
                  name="user-search"
                  placeholder="Buscar especialistas por nombre o email..."
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
                id="role-filter"
                name="role-filter"
                w="200px"
                bg="gray.50"
                border="none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="doctor">Especialistas</option>
                <option value="nurse">Asistentes</option>
                <option value="administrator">Administradores</option>
              </Select>
            </Flex>

            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.400">Especialista</Th>
                  <Th color="gray.400">Rol</Th>
                  <Th color="gray.400">Especialidad / MPPS</Th>
                  <Th color="gray.400" textAlign="right">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map(user => (
                  <Tr key={user.id} _hover={{ bg: "gray.50" }} transition="0.2s">
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={user.full_name} bg="blue.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" color="#1E2559">{user.full_name}</Text>
                          <Text fontSize="xs" color="gray.500">{user.email}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        px={2} py={1} borderRadius="lg"
                        colorScheme={user.role === 'doctor' ? 'blue' : 'green'}
                        variant="subtle"
                      >
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      {user.role === 'doctor' ? (
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">{user.specialty_name || 'Gral.'}</Text>
                          <Text fontSize="xs" color="gray.400">MPPS: {user.mpps_number || '-'}</Text>
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.500">Miembro de Equipo</Text>
                      )}
                    </Td>
                    <Td textAlign="right">
                      <HStack justify="end" spacing={2}>
                        {user.role === 'doctor' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            colorScheme="indigo"
                            leftIcon={<Users size={14} />}
                            onClick={() => handleOpenTeam(user)}
                          >
                            Ver equipo
                          </Button>
                        )}
                        <IconButton aria-label="Edit" icon={<Edit2 size={16} />} size="sm" variant="ghost" colorScheme="blue" />
                        <IconButton aria-label="Delete" icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Modal Crear Usuario */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={4}>
          <ModalHeader>
            <Heading size="md" color="#1E2559">
              {tempPassword ? "¡Acceso Generado!" : "Registro de Personal"}
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
                      El usuario ha sido creado con éxito. Copia la siguiente contraseña temporal para entregársela. Solo podrá verla esta vez.
                    </Text>
                    <HStack bg="white" p={4} borderRadius="lg" border="1px dashed" borderColor="green.300" w="full" justify="center">
                      <Text fontSize="2xl" fontWeight="bold" letterSpacing="widest" color="green.800">{tempPassword}</Text>
                    </HStack>
                  </VStack>
                </Box>
                <Button colorScheme="green" w="full" size="lg" onClick={onCreateClose}>
                  Entendido, ya la copié
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleCreateUser}>
                <VStack spacing={5}>
                  <FormControl id="fullName" isRequired>
                    <FormLabel fontSize="sm" color="gray.600">Nombre Completo</FormLabel>
                    <Input
                      id="new-user-fullName"
                      name="fullName"
                      placeholder="Ej. Dr. Andrés Moreno"
                      bg="gray.50" borderRadius="lg"
                      value={newUser.fullName}
                      onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                  </FormControl>

                  <HStack w="full" gap={4}>
                    <FormControl id="email" isRequired>
                      <FormLabel fontSize="sm" color="gray.600">Email Corporativo</FormLabel>
                      <Input
                        id="new-user-email"
                        name="email"
                        placeholder="email@clinica.com"
                        type="email" bg="gray.50"
                        borderRadius="lg"
                        value={newUser.email}
                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </FormControl>
                    <FormControl id="role" isRequired>
                      <FormLabel fontSize="sm" color="gray.600">Rol</FormLabel>
                      <Select
                        id="new-user-role"
                        name="role"
                        bg="gray.50" borderRadius="lg"
                        value={newUser.role}
                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      >
                        <option value="doctor">Médico / Especialista</option>
                        <option value="nurse">Asistente de Consulta</option>
                        <option value="administrator">Administrativo</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  {newUser.role === 'doctor' && (
                    <>
                      <FormControl id="specialtyId">
                        <FormLabel fontSize="sm" color="gray.600">Especialidad</FormLabel>
                        <Select
                          id="new-user-specialty"
                          name="specialtyId"
                          placeholder="Seleccionar área" bg="gray.50" borderRadius="lg"
                          value={newUser.specialtyId}
                          onChange={e => setNewUser({ ...newUser, specialtyId: e.target.value })}
                        >
                          {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                      </FormControl>
                      <HStack w="full" gap={4}>
                        <FormControl id="mppsNumber">
                          <FormLabel fontSize="sm" color="gray.600">N° MPPS</FormLabel>
                          <Input
                            id="new-user-mppsNumber"
                            name="mppsNumber"
                            placeholder="00000" bg="gray.50" borderRadius="lg"
                            value={newUser.mppsNumber}
                            onChange={e => setNewUser({ ...newUser, mppsNumber: e.target.value })}
                          />
                        </FormControl>
                        <FormControl id="colegioNumber">
                          <FormLabel fontSize="sm" color="gray.600">N° Colegiado</FormLabel>
                          <Input
                            id="new-user-colegioNumber"
                            name="colegioNumber"
                            placeholder="00000" bg="gray.50" borderRadius="lg"
                            value={newUser.colegioNumber}
                            onChange={e => setNewUser({ ...newUser, colegioNumber: e.target.value })}
                          />
                        </FormControl>
                      </HStack>
                    </>
                  )}

                  <Button
                    type="submit"
                    w="full" h="56px"
                    bg="#2E39C9" color="white"
                    _hover={{ bg: "#1E2A99" }}
                    borderRadius="lg"
                    isLoading={isSubmitting}
                  >
                    Generar Acceso y Credenciales
                  </Button>
                </VStack>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Detalle Médico / Equipo */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <Box bgGradient="linear(to-r, #2E39C9, #1E2A99)" p={8} color="white">
            <HStack spacing={4} align="center">
              <Avatar size="xl" name={selectedDoctor?.full_name} border="4px solid white" />
              <VStack align="start" spacing={1}>
                <Heading size="lg">{selectedDoctor?.full_name}</Heading>
                <Tag colorScheme="whiteAlpha" variant="solid" borderRadius="full">
                  <TagLabel>{selectedDoctor?.specialty_name || 'Médico'}</TagLabel>
                </Tag>
              </VStack>
            </HStack>
          </Box>

          <ModalBody p={0}>
            <Tabs isFitted variant="line" colorScheme="blue">
              <TabList h="60px" borderTop="1px solid" borderColor="gray.100">
                <Tab fontWeight="bold" color="gray.500" _selected={{ color: "blue.600", borderBottom: "3px solid" }}>
                  Datos Personales
                </Tab>
                <Tab fontWeight="bold" color="gray.500" _selected={{ color: "blue.600", borderBottom: "3px solid" }}>
                  Mi Equipo (Asistentes)
                </Tab>
                <Tab fontWeight="bold" color="gray.500" _selected={{ color: "blue.600", borderBottom: "3_px solid" }}>
                  Historial de Accesos
                </Tab>
              </TabList>

              <TabPanels p={6} minH="400px">
                <TabPanel>
                  <VStack align="stretch" spacing={6}>
                    <SimpleField label="Email de contacto" value={selectedDoctor?.email} />
                    <Divider borderColor="gray.100" />
                    <HStack gap={10}>
                      <SimpleField label="Número MPPS" value={selectedDoctor?.mpps_number || 'No registrado'} />
                      <SimpleField label="Número de Colegiado" value={selectedDoctor?.colegio_number || 'No registrado'} />
                      <SimpleField label="RIF Profesional" value={selectedDoctor?.rif || 'No registrado'} />
                    </HStack>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Box>
                      <Heading size="sm">Usuarios Dependientes</Heading>
                      <Text fontSize="xs" color="gray.500">Personal con permisos heredados</Text>
                    </Box>
                    <Button leftIcon={<Plus size={16} />} size="sm" colorScheme="blue">Agregar Miembro</Button>
                  </Flex>

                  <Table variant="unstyled" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th borderRadius="lg 0 0 lg">Nombre</Th>
                        <Th>Rol</Th>
                        <Th>Estado</Th>
                        <Th borderRadius="0 lg lg 0" textAlign="right">Remover</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.filter(u => u.parent_doctor_id === selectedDoctor?.id).map(member => (
                        <Tr key={member.id}>
                          <Td py={4}>
                            <Text fontWeight="bold">{member.full_name}</Text>
                            <Text fontSize="10px" color="gray.400">{member.email}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="purple" variant="outline" fontSize="9px">
                              {member.role === 'nurse' ? 'ASISTENTE' : 'ADMIN'}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="green" variant="solid" borderRadius="full" boxSize="8px" mr={2} />
                            <Text display="inline" fontSize="xs">Activo</Text>
                          </Td>
                          <Td textAlign="right">
                            <HStack justify="end" spacing={1}>
                              <IconButton
                                icon={<Key size={14} />}
                                colorScheme="orange"
                                variant="ghost"
                                size="xs"
                                aria-label="Reset Password"
                                onClick={() => handleResetPassword(member.id)}
                              />
                              <IconButton
                                icon={<Trash2 size={14} />}
                                colorScheme="red"
                                variant="ghost"
                                size="xs"
                                aria-label="Remove"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {users.filter(u => u.parent_doctor_id === selectedDoctor?.id).length === 0 && (
                    <VStack py={10} opacity={0.5}>
                      <Users size={40} />
                      <Text fontSize="sm">Este médico no tiene equipo asignado actualmente.</Text>
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <Button
      leftIcon={<Icon size={18} />}
      variant={active ? "solid" : "ghost"}
      bg={active ? "white" : "transparent"}
      color={active ? "#2E39C9" : "whiteAlpha.800"}
      _hover={{ bg: active ? "white" : "whiteAlpha.100", color: active ? "#2E39C9" : "white" }}
      justifyContent="start"
      h="48px"
      borderRadius="xl"
      onClick={onClick}
    >
      <Text fontSize="sm" fontWeight={active ? "bold" : "medium"}>{label}</Text>
    </Button>
  );
}

function SimpleField({ label, value }) {
  return (
    <VStack align="start" spacing={0}>
      <Text fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">{label}</Text>
      <Text fontSize="md" color="#1E2559" fontWeight="medium">{value || '-'}</Text>
    </VStack>
  );
}
