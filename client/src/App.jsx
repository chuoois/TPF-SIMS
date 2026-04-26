import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

export const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
};
