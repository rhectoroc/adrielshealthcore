import { useState, useEffect } from "react";
import {
    Box,
    Input,
    Button,
    VStack,
    Text,
    Card,
    CardBody,
    Badge,
    Spinner,
    InputGroup,
    InputLeftElement,
    Heading,
    HStack,
    Divider
} from "@chakra-ui/react";
import { Search, UserPlus, AlertCircle, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, parseISO } from "date-fns";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function PatientSearch({ onPatientSelect }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { register, watch } = useForm({
        defaultValues: {
            cedula: ""
        }
    });

    const watchedCedula = watch("cedula");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (watchedCedula && watchedCedula.length > 3) {
                searchPatient(watchedCedula);
            } else {
                setPatient(null);
                setError(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [watchedCedula]);

    const searchPatient = async (cedula) => {
        setLoading(true);
        setError(null);
        try {
            const contextDoctorUuid = localStorage.getItem("healthcore_doctor_context");
            const headers = contextDoctorUuid ? { "x-doctor-context": contextDoctorUuid } : {};

            const response = await fetch(`/api/patients/cedula/${cedula}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setPatient(data.patient);
            } else if (response.status === 404) {
                setPatient(null);
                setError("Paciente no encontrado");
            } else {
                setError("Error al buscar el paciente");
            }
        } catch (err) {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return "N/A";
        return differenceInYears(new Date(), parseISO(dob));
    };

    return (
        <VStack spacing={6} align="stretch" w="full">
            <Box>
                <Heading size="md" mb={4} color="gray.700">Búsqueda de Paciente</Heading>
                <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                        <Search color="#718096" size={20} />
                    </InputLeftElement>
                    <Input
                        placeholder="Ingrese Cédula (ej: V12345678)"
                        {...register("cedula", { required: true })}
                        bg="white"
                        boxShadow="sm"
                        _focus={{ boxShadow: "outline", borderColor: "blue.400" }}
                    />
                </InputGroup>
            </Box>

            <AnimatePresence mode="wait">
                {loading && (
                    <MotionBox
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        textAlign="center"
                        py={8}
                    >
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text mt={4} color="gray.500" fontWeight="medium">Buscando en la base de datos...</Text>
                    </MotionBox>
                )}

                {!loading && patient && (
                    <MotionCard
                        key="patient-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        variant="outline"
                        borderColor="blue.100"
                        bg="white"
                        overflow="hidden"
                        boxShadow="md"
                        cursor="pointer"
                        onClick={() => onPatientSelect(patient)}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <CardBody p={6}>
                            <HStack spacing={4} align="start">
                                <Box
                                    p={3}
                                    bg="blue.50"
                                    borderRadius="full"
                                    color="blue.500"
                                >
                                    <User size={32} />
                                </Box>
                                <VStack align="start" spacing={1} flex={1}>
                                    <Heading size="md" color="gray.800">{patient.full_name}</Heading>
                                    <Text color="gray.500" fontSize="sm">Cédula: {patient.cedula}</Text>

                                    <HStack spacing={4} mt={2}>
                                        <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md">
                                            Edad: {calculateAge(patient.date_of_birth)} años
                                        </Badge>
                                        <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="md">
                                            Sangre: {patient.blood_type || "N/A"}
                                        </Badge>
                                    </HStack>

                                    {patient.allergies && (
                                        <Box mt={3} p={3} bg="red.50" borderRadius="lg" w="full" borderLeft="4px solid" borderColor="red.400">
                                            <HStack>
                                                <AlertCircle size={16} color="#E53E3E" />
                                                <Text color="red.700" fontWeight="bold" fontSize="xs">ALERGIAS:</Text>
                                            </HStack>
                                            <Text color="red.600" fontSize="sm" mt={1}>{patient.allergies}</Text>
                                        </Box>
                                    )}
                                </VStack>
                                <Button
                                    colorScheme="blue"
                                    size="sm"
                                    rightIcon={<Search size={14} />}
                                    variant="ghost"
                                >
                                    Ver Perfil
                                </Button>
                            </HStack>
                        </CardBody>
                    </MotionCard>
                )}

                {!loading && error === "Paciente no encontrado" && (
                    <MotionBox
                        key="not-found"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        p={8}
                        textAlign="center"
                        bg="orange.50"
                        borderRadius="xl"
                        border="1px dashed"
                        borderColor="orange.200"
                    >
                        <VStack spacing={4}>
                            <Box p={3} bg="orange.100" borderRadius="full" color="orange.600">
                                <AlertCircle size={32} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold" color="orange.800">No se encontró ningún paciente</Text>
                                <Text fontSize="sm" color="orange.700">La cédula ingresada no está registrada en el sistema.</Text>
                            </Box>
                            <Button
                                as="a"
                                href="/patients/new"
                                leftIcon={<UserPlus size={18} />}
                                colorScheme="orange"
                                size="md"
                            >
                                Registrar Nuevo Paciente
                            </Button>
                        </VStack>
                    </MotionBox>
                )}
            </AnimatePresence>
        </VStack>
    );
}
