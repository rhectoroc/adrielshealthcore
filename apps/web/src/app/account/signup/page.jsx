import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [checkingSuperuser, setCheckingSuperuser] = useState(true);

  // Check if superuser exists on mount
  useEffect(() => {
    const checkSuperuser = async () => {
      try {
        const res = await fetch("/api/superuser/check");
        if (res.ok) {
          const data = await res.json();

          // If no superuser exists, redirect to setup after signup
          if (!data.exists) {
            // Will redirect to setup after signup instead of onboarding
          }
        }
      } catch (err) {
        console.error("Error checking superuser:", err);
      } finally {
        setCheckingSuperuser(false);
      }
    };

    checkSuperuser();
  }, []);

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !fullName) {
      setError("Por favor complete todos los campos");
      setLoading(false);
      return;
    }

    try {
      // Store additional data in localStorage for onboarding
      localStorage.setItem("pendingFullName", fullName);

      // Check if this should redirect to setup (first user) or onboarding
      const superuserCheck = await fetch("/api/superuser/check");
      let callbackUrl = "/onboarding";

      if (superuserCheck.ok) {
        const data = await superuserCheck.json();
        if (!data.exists) {
          callbackUrl = "/setup";
        }
      }

      await signUpWithCredentials({
        email,
        password,
        name: fullName,
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError(
        "No se pudo crear la cuenta. Este email ya puede estar registrado.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFF] dark:bg-[#121212]">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#ECEFF9] dark:border-[#374151] p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <img
            src="https://www.create.xyz/images/logoipsum/249"
            alt="Logo"
            className="w-12 h-12 mx-auto mb-4"
          />
          <h1 className="font-poppins font-semibold text-3xl text-[#1E2559] dark:text-white mb-2">
            Crear cuenta
          </h1>
          <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            Únase a HealthCore
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
              Nombre completo
            </label>
            <div className="overflow-hidden rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 focus-within:border-[#2E39C9] dark:focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#2E39C9] dark:focus-within:ring-[#4F46E5]">
              <input
                required
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="w-full bg-transparent text-[#1E2559] dark:text-white outline-none font-inter"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
              Correo electrónico
            </label>
            <div className="overflow-hidden rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 focus-within:border-[#2E39C9] dark:focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#2E39C9] dark:focus-within:ring-[#4F46E5]">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="su@email.com"
                className="w-full bg-transparent text-[#1E2559] dark:text-white outline-none font-inter"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
              Contraseña
            </label>
            <div className="overflow-hidden rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 focus-within:border-[#2E39C9] dark:focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#2E39C9] dark:focus-within:ring-[#4F46E5]">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[#1E2559] dark:text-white outline-none font-inter"
                placeholder="Cree una contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 font-inter">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#2E39C9] dark:bg-[#4F46E5] px-4 py-3 font-poppins font-semibold text-base text-white transition-colors hover:bg-[#1E2A99] dark:hover:bg-[#4338CA] active:bg-[#1B2080] dark:active:bg-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
          <p className="text-center font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            ¿Ya tiene una cuenta?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="text-[#2E39C9] dark:text-[#6366F1] hover:text-[#1E2A99] dark:hover:text-[#4F46E5] font-medium"
            >
              Inicie sesión
            </a>
          </p>
        </div>
      </form>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
