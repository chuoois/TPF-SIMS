import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

export const App = () => {
  return (
    <>
      <Toaster />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
};
