// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store.js';
import AuthPage from './pages/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DatasourcePage from './pages/DatasourcePage.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Chat from './pages/Chat.jsx';
import "./App.css";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/*" element={<AuthPage />} />
            <Route path="/datasource" element={<PrivateRoute><DatasourcePage /></PrivateRoute>} />
            
            {/* DashboardLayout is used here to wrap the dashboard and chat routes */}
            <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/c/:chat_uuid" element={<Chat />} />
            </Route>
            
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;