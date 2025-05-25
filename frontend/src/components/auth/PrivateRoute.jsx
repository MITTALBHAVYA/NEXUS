import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isTokenValid } from "../../utils/TokenValidation.js";
import { getUserInfo, resetUserState } from "../../app/services/userSlice.js";
import { logout, refreshAccessToken } from "../../app/services/authSlice.js";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 font-medium">Loading...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { token, refreshToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const validateAndFetchProfile = async () => {
      try {
        if (!token || !isTokenValid(token)) {
          if (refreshToken) {
            const refreshedData = await dispatch(refreshAccessToken(refreshToken)).unwrap();
            await dispatch(getUserInfo(refreshedData.access_token)).unwrap();
          } else {
            throw new Error("No valid token available");
          }
        } else {
          await dispatch(getUserInfo(token)).unwrap();
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication failed: ", error);
        setAuthError(error.message || "Authentication failed");
        dispatch(resetUserState());
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };
    validateAndFetchProfile();
  }, [token, refreshToken, dispatch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ error: authError }} 
        replace 
      />
    );
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;