import PageLayout from "../components/layout/PageLayout.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleEmailSignup = () => {
    navigate('/auth/register');
  };

  const loginWithGoogle = () => {
    navigate('/auth/google-login');
  };

  return (
    <PageLayout>
      <Navbar variant="landing" />
      <div className="relative flex flex-row items-center justify-center">
      <div className="relative bg-gradient-to-br from-[#d63f0a] via-[#334155] to-[#aeaeae] flex flex-col items-center text-center px-4 py-10 lg:px-20 md:rounded-full">
        <div className="content max-w-[700px] mb-12 animate-fadeIn">
          <h1 className="text-white text-4xl sm:text-5xl font-bold mb-4">
            Built for Collaboration.
          </h1>
          <h2 className="text-[#FFB409] text-3xl sm:text-4xl font-bold mb-8">
            Powered by Innovation.
          </h2>
          <p className="text-white text-lg sm:text-xl md:text-2xl font-medium tracking-wide">
          Nexus empowers your team with intelligent insights, streamlines data workflows, and transforms analytics into actionable results. Redefine productivity with AI-driven precision.
          </p>
        </div>

        <div className="signup_btns flex flex-col sm:flex-row gap-6 mt-8">
          <button
            className="overflow-hidden py-4 px-8 text-white font-bold rounded-full bg-gradient-to-r from-[#FFB409] to-[#FFA726] shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
            onClick={handleEmailSignup}
          >
            SIGN UP WITH EMAIL
          </button>
          <button
            className="flex items-center gap-3 py-4 px-8 text-white font-bold rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
            onClick={loginWithGoogle}
          >
            <img
              src="./images/google_icon.png"
              alt="Google"
              className="h-6 w-6 lg:h-8 lg:w-8"
            />
            SIGN UP WITH GOOGLE
          </button>
        </div>


        <div className="mt-12">
          <button
            className=" text-white underline hover:no-underline hover:text-[#FFB409] transition-colors"
            onClick={() => navigate('/features')}
          >
            Learn more about Nexus features →
          </button>
        </div>
      </div>
      </div>
      <footer className="absolute bottom-4 w-full text-center text-gray-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
  <p>Nexus © 2024 | Built for Productivity.</p>
</footer>

    </PageLayout>
  );
};

export default LandingPage;
