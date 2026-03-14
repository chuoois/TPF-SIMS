import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const App = () => {
  return (
    <AuthProvider>
      <Toaster />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};
