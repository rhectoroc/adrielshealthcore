import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFF] dark:bg-[#121212]">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#ECEFF9] dark:border-[#374151] p-8 shadow-xl">
        <div className="text-center mb-8">
          <img
            src="https://www.create.xyz/images/logoipsum/249"
            alt="Logo"
            className="w-12 h-12 mx-auto mb-4"
          />
          <h1 className="font-poppins font-semibold text-2xl text-[#1E2559] dark:text-white mb-2">
            Cerrar sesión
          </h1>
          <p className="font-inter text-sm text-[#7B8198] dark:text-[#9CA3AF]">
            ¿Está seguro que desea cerrar sesión?
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-[#2E39C9] dark:bg-[#4F46E5] px-4 py-3 font-poppins font-semibold text-base text-white transition-colors hover:bg-[#1E2A99] dark:hover:bg-[#4338CA] active:bg-[#1B2080] dark:active:bg-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#2E39C9] dark:focus:ring-[#4F46E5] focus:ring-offset-2"
        >
          Cerrar sesión
        </button>
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
