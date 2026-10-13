import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import PagePlaceholder from "./pages/PagePlaceholder";
import Branches from "./pages/admin/Branches";   
import Sections from "./pages/admin/Sections";  
import Subjects from "@/pages/admin/Subjects"; 
import Home from "./pages/Home";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Home onSignIn={() => window.location.assign("/login")} />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="branches" element={<Branches />} />
            <Route path="sections" element={<Sections />} />
            <Route path="/admin/subjects" element={<Subjects />} />
            <Route path="faculty" element={<PagePlaceholder title="Faculty" />} />
            <Route path="rooms" element={<PagePlaceholder title="Rooms" />} />
            <Route path="generate" element={<PagePlaceholder title="Generate Timetable" />} />
          </Route>

          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <DashboardLayout
                  roleLabel="Faculty"
                  navItems={[{ path: "/faculty", label: "My Schedule", end: true }]}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<PagePlaceholder title="Faculty Dashboard" />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout
                  roleLabel="Student"
                  navItems={[{ path: "/student", label: "My Timetable", end: true }]}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<PagePlaceholder title="Student Dashboard" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}