import { useEffect } from "react";
import { useNavigate } from "react-router";
import useUser from "@/utils/useUser";
import { Flex, Spinner } from "@chakra-ui/react";

export default function HomePage() {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/account/signin");
      } else if (user.role === "superuser") {
        navigate("/superuser/dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        // Patients or other roles could go to a separate dashboard or landing
        navigate("/onboarding");
      }
    }
  }, [user, loading, navigate]);

  return (
    <Flex h="100vh" align="center" justify="center" bg="#F8FAFF">
      <Spinner size="xl" color="#2E39C9" thickness="4px" />
    </Flex>
  );
}
  );
}
