import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Admin from "./pages/admin/Admin";
import Dashboard from "./pages/dashboard/Dashboard";
import Appointments from "./pages/appointments/Appointments";
import AppointmentBooking from "./pages/appointments/AppointmentBooking";
import Doctors from "./pages/doctors/Doctors";
import Patients from "./pages/patients/Patients";
import Schedule from "./pages/doctors/Schedule";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "super_admin",
                "doctor",
                "receptionist",
                "patient",
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute
              allowedRoles={[
                "super_admin",
                "doctor",
                "receptionist",
                "patient",
              ]}
            >
              <Appointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute allowedRoles={["receptionist", "patient","super_admin"]}>
              <AppointmentBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin", "receptionist", "patient"]}
            >
              <Doctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin", "doctor", "receptionist"]}
            >
              <Patients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <a
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;
