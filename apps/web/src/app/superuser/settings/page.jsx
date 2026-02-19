import { Box, Heading, Text, VStack, Icon, Button } from "@chakra-ui/react";
import { Settings, Hammer } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function SuperUserSettings() {
    return (
        <MainLayout allowedRoles={["superuser"]}>
            <Box p={{ base: 4, md: 8 }}>
                <Box mb={8}>
                    <Heading size="lg" color="#1E2559">Configuración Global</Heading>
                    <Text color="gray.500">Parámetros del sistema y preferencias</Text>
                </Box>

                <FlexCenterPlaceholder
                    icon={Settings}
                    title="Ajustes de Sistema Próximamente"
                    description="Podrás configurar variables globales, notificaciones de sistema y personalizar la apariencia."
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
            <Box bg="gray.100" p={6} borderRadius="full">
                <Icon as={icon} boxSize={12} color="gray.500" />
            </Box>
            <VStack spacing={2}>
                <Heading size="md" color="#1E2559">{title}</Heading>
                <Text color="gray.500">{description}</Text>
            </VStack>
            <Button leftIcon={<Hammer size={18} />} colorScheme="gray" variant="outline" size="sm">
                Notificarme cuando esté listo
            </Button>
        </VStack>
    );
}
