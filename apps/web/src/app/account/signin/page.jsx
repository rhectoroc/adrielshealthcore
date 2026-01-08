import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Por favor complete todos los campos");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = "Credenciales incorrectas. Verifique su email y contraseña.";

        switch (result.error) {
          case "UserNotFound":
            errorMessage = "No existe una cuenta con este correo electrónico.";
            break;
          case "InvalidPassword":
            errorMessage = "La contraseña es incorrecta.";
            break;
          case "AccountNotLinked":
            errorMessage = "La cuenta no está vinculada con credenciales. Intente otro método.";
            break;
          case "NoPasswordSet":
            errorMessage = "La cuenta no tiene contraseña configurada.";
            break;
        }

        // Often the error comes as "Configuration" or generic if thrown from authorize in some setups,
        // so we might need to inspect the URL or rely on the generic message if result.error is just "CredentialsSignin".
        // However, for recent Auth.js, custom errors might be wrapped.

        // If the error code matches what we threw:
        if (result.error.includes("UserNotFound")) errorMessage = "No existe una cuenta con este correo electrónico.";
        else if (result.error.includes("InvalidPassword")) errorMessage = "La contraseña es incorrecta.";

        setError(errorMessage);
        setLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        // Fallback for success without URL
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Ocurrió un error inesperado. Intente nuevamente.");
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
            Bienvenido
          </h1>
          <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            Inicie sesión en HealthCore
          </p>
        </div>

        <div className="space-y-6">
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
                placeholder="Ingrese su contraseña"
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
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
          <p className="text-center font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            ¿No tiene una cuenta?{" "}
            <a
              href={`/account/signup${typeof window !== "undefined" ? window.location.search : ""
                }`}
              className="text-[#2E39C9] dark:text-[#6366F1] hover:text-[#1E2A99] dark:hover:text-[#4F46E5] font-medium"
            >
              Regístrese
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
