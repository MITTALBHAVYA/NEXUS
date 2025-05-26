import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineMailOutline, MdOutlineInfo, MdKeyboardArrowDown } from "react-icons/md";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleEmailSignup = () => {
    navigate('/auth/register');
  };

  const loginWithGoogle = () => {
    navigate('/auth/google-login');
  };

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageLayout>
      <Navbar variant="landing" />
      
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800">
          <div className={`max-w-4xl mx-auto text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Built for <span className="text-blue-200">Collaboration</span>
            </h1>
            <h2 className="text-blue-100 text-2xl md:text-4xl font-bold mb-8">
              Powered by Innovation
            </h2>
            
            <p className="text-white text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-12">
              Nexus empowers your team with intelligent insights, streamlines data workflows, 
              and transforms analytics into actionable results.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-white rounded-lg text-indigo-600 font-medium hover:shadow-lg transition-all"
                onClick={handleEmailSignup}
              >
                <MdOutlineMailOutline size={20} />
                Sign up with email
              </button>
              
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-indigo-900 bg-opacity-40 border border-indigo-400 rounded-lg text-white font-medium hover:bg-opacity-60 transition-all"
                onClick={loginWithGoogle}
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>
            </div>
            
            <button
              onClick={scrollToFeatures}
              className="flex items-center justify-center mx-auto text-blue-100 hover:text-white transition-colors"
            >
              Learn more about features <MdKeyboardArrowDown size={20} className="ml-1 animate-bounce" />
            </button>
          </div>
        </section>
        
        {/* Feature Section Preview */}
        <section id="features" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
              Why teams choose <span className="text-indigo-600">Nexus</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">Advanced machine learning algorithms that deliver meaningful analytics.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Seamless Collaboration</h3>
                <p className="text-gray-600">Work together in real-time with smart sharing and permission controls.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Enterprise Security</h3>
                <p className="text-gray-600">Bank-level encryption and compliance with industry standards.</p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <button
                className="inline-flex items-center justify-center py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate('/features')}
              >
                <MdOutlineInfo size={20} className="mr-2" />
                Explore all features
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-50 py-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-[#0faab8] to-[#133044] bg-clip-text text-transparent">NEXUS</h3>
              <p className="text-gray-500 text-xs">Built for Productivity</p>
            </div>
            
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-[#0faab8] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          <p className="text-gray-400 text-xs mt-1">© {new Date().getFullYear()} Nexus | All rights reserved.</p>
        </div>
      </footer>
    </PageLayout>
  );
};

export default LandingPage;