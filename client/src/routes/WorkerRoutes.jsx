import { WorkerLayout } from "@/components/layouts/worker-layout";
import WorkerDashboard from "@/pages/worker-page/dashboard";
import WorkerCompleted from "@/pages/worker-page/completed";
import CompletedTaskDetail from "@/pages/worker-page/completed/detail";
import TaskDetail from "@/pages/worker-page/dashboard/TaskDetail";

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
      path: "dashboard/:id",
      element: <TaskDetail />,
    },
    {
      path: "completed",
      element: <WorkerCompleted />,
    },
    {
      path: "completed/:id",
      element: <CompletedTaskDetail />,
    },
  ],
};
