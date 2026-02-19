import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";
import { useUser } from "@/utils/useUser";

const MainLayout = ({ children, allowedRoles = [] }) => {
    const { data: user } = useUser();

    return (
        <AuthGuard allowedRoles={allowedRoles}>
            <Flex minH="100vh" bg="#F8FAFF">
                <Sidebar role={user?.role} userProfile={user} />
                <Box flex={1} overflowY="auto">
                    {children}
                </Box>
            </Flex>
        </AuthGuard>
    );
};

export default MainLayout;
