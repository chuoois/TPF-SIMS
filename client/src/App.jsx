import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index";
import { Toaster } from "react-hot-toast";

export const App = () => {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
};
