import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: authUser, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  const [formData, setFormData] = useState({
    role: "doctor",
    fullName: "",
    mppsNumber: "",
    colegioNumber: "",
    specialty: "",
    rif: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingName = localStorage.getItem("pendingFullName");
      if (pendingName && !formData.fullName) {
        setFormData((prev) => ({ ...prev, fullName: pendingName }));
      }
    }
  }, [formData.fullName]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch("/api/specialties");
        if (res.ok) {
          const data = await res.json();
          setSpecialties(data.specialties || []);
        }
      } catch (err) {
        console.error("Error fetching specialties:", err);
      }
    };
    fetchSpecialties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Error al guardar perfil");
      }

      setSuccess(true);
      localStorage.removeItem("pendingFullName");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFF] dark:bg-[#121212]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2E39C9] dark:border-[#4F46E5] border-r-transparent"></div>
          <p className="mt-4 font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#121212] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#ECEFF9] dark:border-[#374151] p-8 shadow-xl">
          <div className="text-center mb-8">
            <img
              src="https://www.create.xyz/images/logoipsum/249"
              alt="Logo"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h1 className="font-poppins font-semibold text-3xl text-[#1E2559] dark:text-white mb-2">
              Complete su perfil profesional
            </h1>
            <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
              Ingrese su información profesional para activar su cuenta
            </p>
          </div>

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 mb-6">
              <p className="font-inter text-sm text-green-600 dark:text-green-400 text-center">
                ¡Perfil completado! Redirigiendo...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Enfermera</option>
                <option value="administrator">Administrador</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                placeholder="Ej: Dr. Carlos Pérez"
              />
            </div>

            {formData.role === "doctor" && (
              <>
                <div className="space-y-2">
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                    Matrícula MPPS *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mppsNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mppsNumber: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                    placeholder="Ej: MPPS-12345"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                    Colegio de Médicos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.colegioNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colegioNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                    placeholder="Ej: CM-67890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                    Especialidad *
                  </label>
                  <select
                    required
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                  >
                    <option value="">Seleccione una especialidad</option>
                    {specialties.map((spec) => (
                      <option key={spec.id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-inter font-medium text-sm text-[#1E2559] dark:text-white">
                    RIF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rif}
                    onChange={(e) =>
                      setFormData({ ...formData, rif: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#ECEFF9] dark:border-[#374151] bg-white dark:bg-[#262626] px-4 py-3 font-inter text-[#1E2559] dark:text-white outline-none focus:border-[#2E39C9] dark:focus:border-[#4F46E5] focus:ring-1 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5]"
                    placeholder="Ej: V-12345678-9"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 font-inter">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-lg bg-[#2E39C9] dark:bg-[#4F46E5] px-4 py-3 font-poppins font-semibold text-base text-white transition-colors hover:bg-[#1E2A99] dark:hover:bg-[#4338CA] active:bg-[#1B2080] dark:active:bg-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Completar perfil"}
            </button>
          </form>
        </div>
      </div>

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
