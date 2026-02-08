import { Router, type Request, type Response } from "express";
import TaskController from "../controllers/taskController.js";

class TaskRoutes {
  private router: Router;
  private taskController: TaskController;

  constructor() {
    this.router = Router();
    const controller = new TaskController();
    this.taskController = controller;
    this.setRoutes(this.taskController);
  }

  private setRoutes(controller: TaskController): void {
    this.router.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "OK, server is healthy" });
    });

    this.router.get("/task/:id", controller.getTaskById.bind(controller));

    this.router.get("/tasks", controller.getTasks.bind(controller));

    this.router.post("/task", controller.createTask.bind(controller));

    this.router.patch("/task/:id", controller.updateTask.bind(controller));

    this.router.patch(
      "/task/:id/cancel",
      controller.cancelTask.bind(controller),
    );

    this.router.delete("/task/:id", controller.deleteTask.bind(controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default TaskRoutes;
