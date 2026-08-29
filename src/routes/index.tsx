import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../app/layout/AppLayout";
import { HomePage } from "../app/pages/HomePage";
import { LoginPage, RegisterPage } from "../features/auth/pages";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <HomePage /> }],
  },
]);
