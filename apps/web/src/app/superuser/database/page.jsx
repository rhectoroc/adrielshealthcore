import { Box, Heading, Text, VStack, Icon, Button } from "@chakra-ui/react";
import { Database, Hammer } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function SuperUserDatabase() {
    return (
        <MainLayout allowedRoles={["superuser"]}>
            <Box p={{ base: 4, md: 8 }}>
                <Box mb={8}>
                    <Heading size="lg" color="#1E2559">Gestión de Base de Datos</Heading>
                    <Text color="gray.500">Administración directa y backups</Text>
                </Box>

                <FlexCenterPlaceholder
                    icon={Database}
                    title="Panel de Base de Datos en Desarrollo"
                    description="Aquí podrás realizar backups manuales, visualizar el estado del almacenamiento y optimizar consultas."
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
            <Box bg="purple.50" p={6} borderRadius="full">
                <Icon as={icon} boxSize={12} color="purple.500" />
            </Box>
            <VStack spacing={2}>
                <Heading size="md" color="#1E2559">{title}</Heading>
                <Text color="gray.500">{description}</Text>
            </VStack>
            <Button leftIcon={<Hammer size={18} />} colorScheme="purple" variant="outline" size="sm">
                Notificarme cuando esté listo
            </Button>
        </VStack>
    );
}
