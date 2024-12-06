//PrivateRoute.jsx
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isTokenValid } from "../../utils/TokenValidation.js";
import { getUserInfo , resetUserState} from "../../app/services/userSlice.js";
import { logout, refreshAccessToken } from "../../app/services/authSlice.js";

const PrivateRoute = ({ children }) => {
    const { token, refreshToken } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const validateAndFetchProfile = async () => {
            try {
                if (!token || !isTokenValid(token)) {
                    if (refreshToken) {
                        const refreshedData = await dispatch(refreshAccessToken(refreshToken)).unwrap();
                        dispatch(getUserInfo(refreshedData.access_token));
                    } else {
                        throw new Error("No valid token available");
                    }
                } else {
                    await dispatch(getUserInfo(token)).unwrap();
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Authentication failed: ", error);
                dispatch(resetUserState());
                dispatch(logout());
            } finally {
                setIsLoading(false);
            }
        };
        validateAndFetchProfile();
    }, [token, refreshToken, dispatch]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/auth/login" />;
};
PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;
