// AuthPage.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import { useSelector } from 'react-redux';

const AuthPage = () => {
  const { token } = useSelector((state) => state.auth);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={ <Navigate to="/auth/login" replace />} />
      </Routes>
  );
};

export default AuthPage;
