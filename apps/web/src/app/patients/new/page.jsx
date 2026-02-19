import { useState } from "react";
import {
    Box,
    VStack,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    HStack,
    Textarea,
    useToast,
    Container,
    SimpleGrid,
    Card,
    CardBody
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function NewPatientPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useState(() => {
        fetch("/api/profile")
            .then(res => res.json())
            .then(data => setUserProfile(data.user));
    }, []);

    const isAssistant = userProfile?.role === 'nurse';
    const isDoctor = userProfile?.role === 'doctor' || userProfile?.role === 'superuser';

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast({
                    title: "Paciente registrado",
                    description: "El paciente ha sido creado exitosamente.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                window.location.href = "/";
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.error || "No se pudo registrar al paciente.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            toast({
                title: "Error de conexión",
                description: "Inténtelo de nuevo más tarde.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch">
                <HStack justify="space-between">
                    <Button
                        leftIcon={<ArrowLeft size={18} />}
                        variant="ghost"
                        onClick={() => window.location.href = "/"}
                    >
                        Volver al Dashboard
                    </Button>
                    <Heading size="lg" color="blue.700">Registro de Paciente</Heading>
                </HStack>

                <Card variant="outline" boxShadow="sm">
                    <CardBody>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <VStack spacing={6}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired isInvalid={errors.cedula}>
                                        <FormLabel>Cédula</FormLabel>
                                        <Input
                                            placeholder="V12345678"
                                            {...register("cedula", { required: "La cédula es requerida" })}
                                        />
                                    </FormControl>

                                    <FormControl isRequired isInvalid={errors.fullName}>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <Input
                                            placeholder="Ej: Juan Pérez"
                                            {...register("fullName", { required: "El nombre es requerido" })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Fecha de Nacimiento</FormLabel>
                                        <Input type="date" {...register("dateOfBirth")} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Género</FormLabel>
                                        <Select placeholder="Seleccionar" {...register("gender")}>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="O">Otro</option>
                                        </Select>
                                    </FormControl>

                                    {isDoctor && (
                                        <FormControl>
                                            <FormLabel>Tipo de Sangre</FormLabel>
                                            <Select placeholder="Desconocido" {...register("bloodType")}>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </Select>
                                        </FormControl>
                                    )}

                                    <FormControl>
                                        <FormLabel>Teléfono</FormLabel>
                                        <Input placeholder="0414-0000000" {...register("phone")} />
                                    </FormControl>
                                </SimpleGrid>

                                {isDoctor && (
                                    <FormControl>
                                        <FormLabel>Alergias / Antecedentes</FormLabel>
                                        <Textarea
                                            placeholder="Liste alergias conocidas, medicamentos u otros..."
                                            {...register("allergies")}
                                        />
                                    </FormControl>
                                )}

                                <Divider />

                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    size="lg"
                                    w="full"
                                    leftIcon={<UserPlus size={20} />}
                                    isLoading={loading || isSubmitting}
                                    loadingText="Registrando..."
                                >
                                    Confirmar Registro
                                </Button>
                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
}
