import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function SetupPage() {
  const { data: authUser, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [superuserExists, setSuperuserExists] = useState(null);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
  });

  useEffect(() => {
    const checkSuperuser = async () => {
      try {
        const res = await fetch("/api/superuser/check");
        if (res.ok) {
          const data = await res.json();
          setSuperuserExists(data.exists);

          // If superuser already exists, redirect to home
          if (data.exists) {
            window.location.href = "/";
          }
        }
      } catch (err) {
        console.error("Error checking superuser:", err);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkSuperuser();
  }, []);

  useEffect(() => {
    if (authUser && authUser.name) {
      setFormData((prev) => ({ ...prev, fullName: authUser.name }));
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "superuser",
          fullName: formData.fullName,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al crear el SuperUsuario");
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/superuser/dashboard";
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (userLoading || checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFF] dark:bg-[#121212]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2E39C9] dark:border-[#4F46E5] border-r-transparent"></div>
          <p className="mt-4 font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            Verificando sistema...
          </p>
        </div>
      </div>
    );
  }

  if (superuserExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFF] dark:bg-[#121212]">
        <div className="text-center">
          <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            Redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signup?callbackUrl=/setup";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E39C9] to-[#1E2A99] dark:from-[#1F2937] dark:to-[#111827] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#ECEFF9] dark:border-[#374151] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2E39C9] to-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="font-poppins font-bold text-3xl text-[#1E2559] dark:text-white mb-2">
              Configuración Inicial
            </h1>
            <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
              Cree la cuenta de SuperUsuario para HealthCore
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-poppins font-semibold text-sm text-blue-900 dark:text-blue-200 mb-1">
                  Primera Configuración
                </h3>
                <p className="font-inter text-xs text-blue-700 dark:text-blue-300">
                  Esta cuenta tendrá acceso total al sistema: gestión de
                  médicos, logs de auditoría, backups y configuraciones
                  globales. Solo debe crearse una vez.
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 mb-6">
              <p className="font-inter text-sm text-green-600 dark:text-green-400 text-center">
                ✓ SuperUsuario creado exitosamente! Redirigiendo al panel...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                Nombre completo del SuperUsuario
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                placeholder="Ej: Adriel Rodriguez"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                Email de acceso
              </label>
              <input
                type="email"
                disabled
                value={authUser?.email || ""}
                className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-gray-50 dark:bg-[#1A1A1A] px-4 py-3 font-inter text-[#7B8198] dark:text-[#9CA3AF] outline-none cursor-not-allowed"
              />
              <p className="font-inter text-xs text-[#7B8198] dark:text-[#9CA3AF]">
                Este será el correo para iniciar sesión como SuperUsuario
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="font-poppins font-semibold text-sm text-yellow-900 dark:text-yellow-200 mb-1">
                    Guarde sus credenciales
                  </h3>
                  <p className="font-inter text-xs text-yellow-700 dark:text-yellow-300">
                    Asegúrese de recordar su email y contraseña. Como
                    SuperUsuario, tendrá control total sobre el sistema.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 font-inter">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-lg bg-gradient-to-r from-[#2E39C9] to-[#4F46E5] dark:from-[#4F46E5] dark:to-[#6366F1] px-4 py-4 font-poppins font-bold text-base text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#2E39C9]/50 dark:hover:shadow-[#4F46E5]/50 focus:outline-none focus:ring-2 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading
                ? "Creando SuperUsuario..."
                : "Crear SuperUsuario y Acceder"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-inter text-sm text-white text-opacity-80">
          Adriel's HealthCore © 2026 - Sistema de Gestión Clínica
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
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
