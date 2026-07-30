import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import Layout from '../components/layout/Layout';
import MetricsPage from '../pages/MetricsPage';
import SecurityPage from '../pages/SecurityPage';
import JenkinsPage from '../pages/JenkinsPage';
import ProfilePage from '../pages/ProfilePage';
import GrafanaPage from '../pages/GrafanaPage';
import DockerPage from '../pages/DockerPage';
import KubernetesPage from '../pages/KubernetesPage';
import NotFoundPage from '../pages/NotFoundPage';


const AuthRoute = ({ children }) => (
  <>
    <SignedIn>
      <Navigate to="/" replace />
    </SignedIn>
    <SignedOut>
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        {children}
      </div>
    </SignedOut>
  </>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/sign-in"
        element={
          <AuthRoute>
            <SignIn />
          </AuthRoute>
        }
      />
      <Route
        path="/sign-up"
        element={
          <AuthRoute>
            <SignUp />
          </AuthRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="metrics" element={<MetricsPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="jenkins" element={<JenkinsPage />} />
        <Route path="grafana" element={<GrafanaPage />} />
        <Route path="docker" element={<DockerPage />} />
        <Route path="kubernetes" element={<KubernetesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes;
