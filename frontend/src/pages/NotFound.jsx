import PageLayout from '../components/layout/PageLayout.jsx';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#d63f0a] via-[#a6a6a6] to-[#d63f0a] text-white">
        <div className="text-center ">
          {/* 404 Text with Image */}
          <div className="flex items-center justify-center gap-4 bg-gradient-to-br from-[#334155] via-[#334155] to-[#d63f0a] rounded-tl-[10rem] rounded-br-[10rem]">
            <h1 className="text-[12rem] md:text-[16rem] font-extrabold tracking-tight animate-pulse">
              4
            </h1>
            <img
              src="/images/Nexus_logo_white1.png"
              alt="Logo"
              className="w-[10rem] h-[10rem] md:w-[12rem] md:h-[12rem] lg:w-[14rem] lg:h-[14rem] animate-spin-slow shadow-xl rounded-full border-4 border-[#f15626] hover:scale-110 transition-transform duration-500 ease-in-out"
              style={{
                animation: "spin-smooth 4s linear infinite",
              }}
            />

            <h1 className="text-[12rem] md:text-[16rem] font-extrabold tracking-tight animate-pulse">
              4
            </h1>

          </div>

          {/* Error Message */}
          <p className="mt-8 text-xl md:text-2xl lg:text-3xl text-gray-800">
            Oops! The page you’re looking for doesn’t exist.
          </p>

          {/* Back to Home Button */}
          <Link
            to="/"
            className="flex items-center justify-center w-full h-[5rem] mb-2 text-lg text-white font-bold rounded-lg border border-[#f15626] bg-[#ad2701] transition-all duration-300 ease-in-out hover:bg-[#0f172a] hover:text-wheat hover:border-[#f15626] shadow-lg"
          >
            <span className="ml-6 text-base font-medium uppercase text-shadow">
              Go Back to Home
            </span>
          </Link>

        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
