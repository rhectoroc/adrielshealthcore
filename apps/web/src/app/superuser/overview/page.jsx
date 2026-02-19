import { Box, Heading, Text, Flex, SimpleGrid, Icon, VStack } from "@chakra-ui/react";
import { Users, Activity, TrendingUp, AlertCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function SuperUserOverview() {
    // Datos mock hasta que tengamos endpoints reales
    const stats = [
        { label: "Total Médicos", value: "48", icon: Users, color: "blue.500", bg: "blue.50" },
        { label: "Consultas Hoy", value: "156", icon: Activity, color: "green.500", bg: "green.50" },
        { label: "Nuevos Pacientes", value: "+12%", icon: TrendingUp, color: "purple.500", bg: "purple.50" },
        { label: "Alertas Activas", value: "3", icon: AlertCircle, color: "red.500", bg: "red.50" },
    ];

    return (
        <MainLayout allowedRoles={["superuser"]}>
            <Box p={{ base: 4, md: 8 }}>
                <Box mb={8}>
                    <Heading size="lg" color="#1E2559">Dashboard Global</Heading>
                    <Text color="gray.500">Visión general de la actividad de la clínica</Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                    {stats.map((stat, index) => (
                        <Box key={index} bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="start" mb={4}>
                                <Box bg={stat.bg} p={3} borderRadius="xl">
                                    <Icon as={stat.icon} boxSize={6} color={stat.color} />
                                </Box>
                                {stat.label === "Nuevos Pacientes" && (
                                    <Text fontSize="xs" color="green.600" bg="green.50" px={2} py={1} borderRadius="full" fontWeight="bold">
                                        +2.4% vs ayer
                                    </Text>
                                )}
                            </Flex>
                            <VStack align="start" spacing={0}>
                                <Text fontSize="3xl" fontWeight="bold" color="#1E2559">{stat.value}</Text>
                                <Text fontSize="sm" color="gray.500" fontWeight="medium">{stat.label}</Text>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>

                <Box bg="white" p={8} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" minH="400px" display="flex" alignItems="center" justifyContent="center">
                    <VStack spacing={4}>
                        <Activity size={48} color="#CBD5E0" />
                        <Text color="gray.500" fontWeight="medium">Gráficos de actividad próximamente...</Text>
                    </VStack>
                </Box>
            </Box>
        </MainLayout>
    );
}
