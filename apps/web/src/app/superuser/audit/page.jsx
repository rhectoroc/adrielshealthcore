import { Box, Heading, Text, VStack, Icon, Button } from "@chakra-ui/react";
import { ShieldCheck, Hammer } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function SuperUserAudit() {
    return (
        <MainLayout allowedRoles={["superuser"]}>
            <Box p={{ base: 4, md: 8 }} h="full">
                <Box mb={8}>
                    <Heading size="lg" color="#1E2559">Auditoría del Sistema</Heading>
                    <Text color="gray.500">Registro de acciones y seguridad</Text>
                </Box>

                <FlexCenterPlaceholder
                    icon={ShieldCheck}
                    title="Módulo de Auditoría en Construcción"
                    description="Pronto podrás ver logs de acceso, cambios de configuración y alertas de seguridad aquí."
                />
            </Box>
        </MainLayout>
    );
}

function FlexCenterPlaceholder({ icon, title, description }) {
    return (
        <VStack
            bg="white"
            p={12}
            borderRadius="2xl"
            shadow="sm"
            border="1px solid" borderColor="gray.100"
            spacing={6}
            maxW="2xl"
            mx="auto"
            mt={10}
            textAlign="center"
        >
            <Box bg="orange.50" p={6} borderRadius="full">
                <Icon as={icon} boxSize={12} color="orange.500" />
            </Box>
            <VStack spacing={2}>
                <Heading size="md" color="#1E2559">{title}</Heading>
                <Text color="gray.500">{description}</Text>
            </VStack>
            <Button leftIcon={<Hammer size={18} />} colorScheme="orange" variant="outline" size="sm">
                Notificarme cuando esté listo
            </Button>
        </VStack>
    );
}
