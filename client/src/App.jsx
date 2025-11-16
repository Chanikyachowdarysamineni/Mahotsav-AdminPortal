import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Events from './pages/Events';
import Participants from './pages/Participants';
import Registrations from './pages/Registrations';
import Teams from './pages/Teams';
import Coordinators from './pages/Coordinators';
import EventRegistrations from './pages/EventRegistrations';
import Colleges from './pages/Colleges';
import Sports from './pages/Sports';
import Cultural from './pages/Cultural';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participants"
            element={
              <ProtectedRoute>
                <Participants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrations"
            element={
              <ProtectedRoute>
                <Registrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinators"
            element={
              <ProtectedRoute>
                <Coordinators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-registrations"
            element={
              <ProtectedRoute>
                <EventRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/colleges"
            element={
              <ProtectedRoute>
                <Colleges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sports"
            element={
              <ProtectedRoute>
                <Sports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cultural"
            element={
              <ProtectedRoute>
                <Cultural />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
