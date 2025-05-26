import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError, googleLogin } from "../../app/services/authSlice.js";
import { getUserInfo } from "../../app/services/userSlice.js";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import Navbar from "../layout/Navbar.jsx";
import PageLayout from "../layout/PageLayout.jsx";
import { MdOutlineMailOutline, MdErrorOutline, MdLock } from "react-icons/md";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

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
        const token = response.access_token;
        dispatch(getUserInfo(token));
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
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 py-6 px-8">
            <h1 className="text-white text-2xl font-medium">Welcome to Nexus</h1>
            <p className="text-blue-100 text-sm mt-1">Sign in to continue</p>
          </div>

          <div className="px-8 py-6">
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                shape="pill"
                theme="filled_blue"
                text="signin_with"
                useOneTap
              />
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-3 text-gray-500 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdOutlineMailOutline className="text-gray-400" size={20} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdLock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="flex items-center text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">
                  <MdErrorOutline className="flex-shrink-0 mr-2" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link to="/auth/register" className="text-blue-600 font-medium hover:text-blue-800">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
