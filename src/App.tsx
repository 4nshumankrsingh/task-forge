import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Team from "@/pages/Team";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes inside MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/team" element={<Team />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}