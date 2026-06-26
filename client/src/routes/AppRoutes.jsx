import { SignIn, SignUp } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <h1>Welcome to the DevOps Pipeline Dashboard!</h1>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes;
