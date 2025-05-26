import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError, googleLogin } from "../../app/services/authSlice.js";
import {getUserInfo} from "../../app/services/userSlice.js"
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
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

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await dispatch(googleLogin(credentialResponse.credential)).unwrap();
      if (response.access_token) {
        const token = response.access_token;
        dispatch(getUserInfo(token));
        // dispatch(getAllChatHistory(token));
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google Sign In was unsuccessful.");
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
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              shape="pill"
              theme="filled_blue"
              text="signin_with"
              useOneTap
              width="300px"
            />
          </div>
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
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
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
