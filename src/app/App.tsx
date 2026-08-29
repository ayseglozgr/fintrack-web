import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthProvider";
import { router } from "../routes";
import "./App.css";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
