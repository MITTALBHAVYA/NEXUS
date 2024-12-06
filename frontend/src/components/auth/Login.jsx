import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../app/services/authSlice.js";
import {getUserInfo} from "../../app/services/userSlice.js"
import { useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar.jsx";
import { MdOutlineMailOutline } from "react-icons/md";
import PageLayout from "../layout/PageLayout.jsx";
import { MdErrorOutline } from "react-icons/md";
// import { getAllChatHistory } from "../../app/services/chatSlice.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error} = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleAuthError = () => {
      navigate("/auth/login", { replace: true });
    };
    window.addEventListener("authError", handleAuthError);
    return () => {
      window.removeEventListener("authError", handleAuthError);
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      if (response.access_token) {
        const token = response.access_token
        dispatch(getUserInfo(token));
        // dispatch(getAllChatHistory(token));
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const loginWithGoogle = () => {
    navigate("/auth/google");
  };

  return (
    <PageLayout>
      <Navbar variant="signin" />
      <div className="relative flex flex-row items-center justify-center">
        <div className="centered-container relative bg-gradient-to-br from-[#d63f0a] via-[#334155] to-[#aeaeae] w-[32rem] rounded-none md:w-[45rem] md:rounded-[10rem] p-8">
          <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4">
            Welcome Back to Nexus
          </h1>
          <p className="text-[#FFB409] text-lg sm:text-xl font-medium mb-8">
            Sign in to unlock AI-driven insights and supercharge your workflow.
          </p>
          <button
            className="signin-ggl-btn flex items-center justify-center gap-3 py-3 px-6 text-white font-bold rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] shadow-md hover:shadow-lg hover:scale-105 transition-transform mb-4"
            onClick={loginWithGoogle}
          >
            <img src="/images/google_icon.png" alt="Google Icon" className="h-6 w-6" />
            <span>Sign in with Google</span>
          </button>
          <span className="or text-white font-medium text-sm">OR</span>
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="mb-4">
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="name@workemail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB409]"
              />
            </div>
            <div className="mb-6">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB409]"
              />
            </div>
            {error && (
              <div className="flex items-center justify-center text-red-700 text-sm border border-red-300 bg-red-100 rounded-lg px-4 py-3 mt-3 shadow-md">
                <MdErrorOutline className="text-white bg-red-500 rounded-full p-1 mr-2" size={30} />
                <span className="font-bold">{error}</span>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 text-white font-bold rounded-full bg-gradient-to-r from-[#FFB409] to-[#FFA726] shadow-md hover:shadow-lg hover:scale-105 transition-transform"
              >
                <MdOutlineMailOutline />
                <span>{isLoading ? "Signing in..." : "Sign in with Email"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
