import { SignIn, SignUp } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <h1>Welcome to the DevOps Pipeline Dashboard!</h1>
            </ProtectedRoute>
          }
        />
        {/* Clerk Pages */}
        <Route
          path="/sign-in"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <SignIn />
            </div>
          }
        />
        <Route
          path="/sign-up"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <SignUp />
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
