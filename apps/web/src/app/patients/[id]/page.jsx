import { useState, useEffect } from "react";
import { useParams } from "react-router";
import useUser from "@/utils/useUser";
import {
    Container,
    Spinner,
    Center,
    useToast,
    Box,
    Button,
    HStack,
    VStack,
    Heading,
    Text,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink
} from "@chakra-ui/react";
import { ArrowLeft, Home, User } from "lucide-react";
import MedicalActionPanel from "@/components/MedicalActionPanel";

export default function PatientDetailPage() {
    const { id } = useParams();
    const { data: authUser, loading: userLoading } = useUser();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await fetch(`/api/patients/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPatient(data.patient);
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo cargar la información del paciente.",
                        status: "error",
                        duration: 5000,
                    });
                }
            } catch (err) {
                console.error("Error fetching patient:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id && authUser && !userLoading) {
            fetchPatientData();
        } else if (!userLoading && !authUser) {
            // redirect handled by useUser or root
        }
    }, [id, authUser, userLoading]);

    if (userLoading || loading) {
        return (
            <Center h="100vh">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color="gray.500">Cargando Historia Médica...</Text>
                </VStack>
            </Center>
        );
    }

    if (!patient) {
        return (
            <Center h="100vh">
                <VStack spacing={4}>
                    <Heading size="md">Paciente no encontrado</Heading>
                    <Button leftIcon={<ArrowLeft size={18} />} onClick={() => window.location.href = "/"}>
                        Volver al Dashboard
                    </Button>
                </VStack>
            </Center>
        );
    }

    return (
        <Box bg="gray.50" minH="100vh">
            {/* Top Header / Breadcrumb */}
            <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={4} px={8}>
                <Container maxW="container.xl">
                    <HStack justify="space-between" mb={2}>
                        <Breadcrumb spacing="8px" fontSize="sm" color="gray.500">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/"><HStack spacing={1}><Home size={14} /><Text>Inicio</Text></HStack></BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink href="#"><HStack spacing={1}><User size={14} /><Text>Paciente</Text></HStack></BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                        <Button
                            size="sm"
                            leftIcon={<ArrowLeft size={16} />}
                            variant="outline"
                            onClick={() => window.location.href = "/"}
                        >
                            Cerrar Expediente
                        </Button>
                    </HStack>
                    <Heading size="lg" color="blue.800">Expediente Médico Digital</Heading>
                </Container>
            </Box>

            <Container maxW="container.xl" py={8}>
                <MedicalActionPanel patient={patient} />
            </Container>
        </Box>
    );
}
