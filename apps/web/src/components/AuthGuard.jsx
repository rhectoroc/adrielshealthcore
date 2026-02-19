import { useEffect } from "react";
import { useNavigate } from "react-router";
import useUser from "@/utils/useUser";
import { Flex, Spinner } from "@chakra-ui/react";

const AuthGuard = ({ children, allowedRoles = [] }) => {
    const { data: user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/account/signin");
        } else if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            // Si el rol no coincide, redirigir al dashboard por defecto según su rol real
            if (user.role === "superuser") {
                navigate("/superuser/dashboard");
            } else if (user.role === "doctor") {
                navigate("/doctor/dashboard");
            } else {
                navigate("/");
            }
        }
    }, [user, loading, allowedRoles, navigate]);

    if (loading) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="#F8FAFF">
                <Spinner size="xl" color="#2E39C9" thickness="4px" />
            </Flex>
        );
    }

    if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
        return null;
    }

    return children;
};

export default AuthGuard;
