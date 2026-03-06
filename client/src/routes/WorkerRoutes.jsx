import { WorkerLayout } from "@/layouts/worker-layout";
import WorkerDashboard from "@/pages/worker-page/dashboard";
import WorkerCompleted from "@/pages/worker-page/completed";

/**
 * Worker Routes
 * Định nghĩa đường dẫn riêng cho môi trường Xưởng (Worker)
 */
export const workerRoutes = {
  path: "worker",
  element: <WorkerLayout />,
  children: [
    {
      path: "dashboard",
      element: <WorkerDashboard />,
    },
    {
      path: "completed",
      element: <WorkerCompleted />,
    },
  ],
};
