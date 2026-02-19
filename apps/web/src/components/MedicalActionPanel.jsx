import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    FormControl,
    FormLabel,
    Textarea,
    Button,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Text,
    Badge,
    HStack,
    useToast,
    Divider,
    Icon
} from "@chakra-ui/react";
import { FileText, PlusCircle, History, Save, Printer, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { generateMedicalPDF } from "@/utils/pdfGenerator";

export default function MedicalActionPanel({ patient }) {
    const [activeTab, setActiveTab] = useState(0);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const toast = useToast();
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setDoctorProfile(data.user);
                }
            } catch (err) {
                console.error("Error fetching doctor profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const onSaveConsultation = async (data) => {
        try {
            const response = await fetch("/api/consultations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    patientId: patient.id
                }),
            });

            if (response.ok) {
                toast({
                    title: "Consulta guardada",
                    description: "La información médica se ha registrado correctamente.",
                    status: "success",
                    duration: 3000,
                });

                // Generar PDF
                generateMedicalPDF(patient, { ...data, created_at: new Date().toISOString() }, doctorProfile);

                reset();
                // Recargar para ver la nueva consulta en la historia
                setTimeout(() => window.location.reload(), 2000);
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.error || "No se pudo guardar la consulta.",
                    status: "error",
                });
            }
        } catch (err) {
            toast({ title: "Error de conexión", status: "error" });
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden" border="1px solid" borderColor="gray.100">
            <Box bg="blue.600" p={4} color="white">
                <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                        <Heading size="md">{patient.full_name}</Heading>
                        <Text fontSize="sm" opacity={0.8}>Cédula: {patient.cedula} | {patient.blood_type || "S/T"}</Text>
                    </VStack>
                    <Badge colorScheme="red" p={2} borderRadius="lg">
                        ALERGIAS: {patient.allergies || "Ninguna conocida"}
                    </Badge>
                </HStack>
            </Box>

            <Tabs isFitted variant="enclosed" index={activeTab} onChange={(index) => setActiveTab(index)}>
                <TabList mb="1em" bg="gray.50">
                    <Tab _selected={{ bg: "white", color: "blue.600", borderTop: "3px solid" }}>
                        <HStack><Icon as={History} size={16} /><Text>Historia</Text></HStack>
                    </Tab>
                    <Tab _selected={{ bg: "white", color: "blue.600", borderTop: "3px solid" }}>
                        <HStack><Icon as={PlusCircle} size={16} /><Text>Nueva Consulta</Text></HStack>
                    </Tab>
                    <Tab _selected={{ bg: "white", color: "blue.600", borderTop: "3px solid" }}>
                        <HStack><Icon as={FileText} size={16} /><Text>Recetas/Reposos</Text></HStack>
                    </Tab>
                </TabList>

                <TabPanels p={4}>
                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            <Heading size="sm" color="gray.600">Historial de Consultas</Heading>
                            {patient.history && patient.history.length > 0 ? (
                                <Accordion allowMultiple>
                                    {patient.history.map((item) => (
                                        <AccordionItem key={item.id} border="1px solid" borderColor="gray.100" borderRadius="md" mb={2}>
                                            <h2>
                                                <AccordionButton _expanded={{ bg: "blue.50" }}>
                                                    <Box flex="1" textAlign="left">
                                                        <HStack>
                                                            <Text fontWeight="bold">{formatDate(item.created_at)}</Text>
                                                            <Badge colorScheme="blue">Diagnóstico: {item.diagnosis.substring(0, 30)}...</Badge>
                                                        </HStack>
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                <VStack align="start" spacing={3}>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="xs" color="gray.500">MOTIVO:</Text>
                                                        <Text>{item.reason}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="xs" color="gray.500">DIAGNÓSTICO:</Text>
                                                        <Text fontWeight="medium" color="blue.700">{item.diagnosis}</Text>
                                                    </Box>
                                                    {item.prescriptions && (
                                                        <Box p={3} bg="green.50" borderRadius="md" w="full">
                                                            <Text fontWeight="bold" fontSize="xs" color="green.600">TRATAMIENTO:</Text>
                                                            <Text whiteSpace="pre-wrap">{item.prescriptions}</Text>
                                                        </Box>
                                                    )}
                                                    <Button
                                                        leftIcon={<Printer size={14} />}
                                                        size="xs"
                                                        variant="outline"
                                                        mt={2}
                                                        onClick={() => generateMedicalPDF(patient, item, doctorProfile)}
                                                    >
                                                        Reimprimir Receta
                                                    </Button>
                                                </VStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <Box textAlign="center" py={10} color="gray.400">
                                    <Icon as={History} size={40} mb={3} />
                                    <Text>No hay consultas previas registradas.</Text>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>

                    <TabPanel>
                        <form id="consultation-form" onSubmit={handleSubmit(onSaveConsultation)}>
                            <VStack spacing={5} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Motivo de la Consulta</FormLabel>
                                    <Textarea
                                        placeholder="Ej: Fiebre alta, dolor muscular..."
                                        {...register("reason", { required: true })}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontWeight="bold">Examen Físico</FormLabel>
                                    <Textarea
                                        placeholder="Signos vitales, hallazgos, etc."
                                        {...register("physicalExam")}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Diagnóstico</FormLabel>
                                    <Textarea
                                        placeholder="Conclusión médica del cuadro..."
                                        {...register("diagnosis", { required: true })}
                                    />
                                </FormControl>

                                <Button
                                    colorScheme="blue"
                                    onClick={() => setActiveTab(2)}
                                    rightIcon={<ArrowRight size={18} />}
                                >
                                    Continuar a Recetas
                                </Button>
                            </VStack>
                        </form>
                    </TabPanel>

                    <TabPanel>
                        <VStack spacing={5} align="stretch">
                            <FormControl>
                                <FormLabel fontWeight="bold">Receta Médica (Medicamentos y Dosis)</FormLabel>
                                <Textarea
                                    placeholder="Ej: Amoxicilina 500mg, 1 cada 8 horas por 7 días."
                                    minH="150px"
                                    {...register("prescriptions")}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="bold">Reposo (Si aplica)</FormLabel>
                                <Textarea
                                    placeholder="Días de reposo y condiciones..."
                                    {...register("sickLeave")}
                                />
                            </FormControl>

                            <Divider />

                            <Button
                                form="consultation-form"
                                type="submit"
                                colorScheme="green"
                                size="lg"
                                w="full"
                                leftIcon={<Save size={20} />}
                                isLoading={isSubmitting}
                            >
                                Guardar y Generar PDF
                            </Button>
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}
