import * as React from 'react';
import { useSession } from "@auth/create/react";


const useUser = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = React.useState(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  const fetchProfile = React.useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        // Merge session data with profile data (profile takes precedence for role)
        setUser({ ...session.user, ...data.user });
      } else {
        // If profile fetch fails, fallback to session user but be aware it might lack role
        console.warn("Failed to fetch profile");
        setUser(session.user);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUser(session.user);
    } finally {
      setLoadingProfile(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setUser(null);
      setLoadingProfile(false);
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  return {
    user,
    data: user,
    loading: status === 'loading' || loadingProfile,
    refetch: fetchProfile
  };
};

export { useUser }

export default useUser;