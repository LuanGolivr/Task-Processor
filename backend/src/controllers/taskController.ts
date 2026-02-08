import { type Request, type Response } from "express";
import { Prisma } from "../../prisma/generated/prisma/client.js";

import { databaseService } from "../services/databaseService.js";
import rabbitMQService, {
  RabbitMQService,
} from "../services/rabbitMQService.js";

import { type EnqueuedTask } from "../types/rabbitTypes.js";
import { type TaskFilters } from "../types/DbQueryType.js";
class TaskController {
  private rabbitService: RabbitMQService = rabbitMQService;
  constructor() {}

  private convertToDate(date: string) {
    return new Date(date);
  }

  private buildFilterQuery(req: Request): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};
    const {
      status,
      processing_time,
      priority,
      startDate,
      endDate,
      completedAfter,
      completedBefore,
      createdAfter,
      createdBefore,
    } = req.query as TaskFilters;

    if (status) {
      where.status = {
        in: status,
      };
    }

    if (priority) {
      const priorityNumbers = priority
        .map((value) => Number(value))
        .filter((value) => !isNaN(value));
      where.priority = {
        in: priorityNumbers,
      };
    }

    if (processing_time) {
      where.processing_time = {
        lte: this.convertToDate(processing_time),
      };
    }

    if (startDate) {
      where.started_at = {
        gte: this.convertToDate(startDate),
      };
    }

    if (endDate) {
      where.started_at = {
        lte: this.convertToDate(endDate),
      };
    }

    if (completedAfter) {
      where.completed_at = {
        gte: this.convertToDate(completedAfter),
      };
    }

    if (completedBefore) {
      where.completed_at = {
        lte: this.convertToDate(completedBefore),
      };
    }

    if (createdAfter) {
      where.completed_at = {
        gte: this.convertToDate(createdAfter),
      };
    }

    if (createdBefore) {
      where.completed_at = {
        lte: this.convertToDate(createdBefore),
      };
    }

    return where;
  }

  public getTasks = (req: Request, res: Response): void => {
    const take: number = req.query.take
      ? parseInt(req.query.take as string, 10)
      : 10;
    const skip: number = req.query.skip
      ? parseInt(req.query.skip as string, 10)
      : 0;
    const where: Prisma.TaskWhereInput = this.buildFilterQuery(req);

    try {
      const tasks = databaseService.getTasks(where, take, skip);
      res.status(200).json(tasks);
    } catch (error) {
      console.error("[Backend] Error fetching tasks: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  public getTaskById = (req: Request, res: Response): void => {
    const id: string = req.params.id as string;
    try {
      if (id) {
        const task = databaseService.getTaskById(id);
        res.status(200).json(task);
      } else {
        res.status(400).json({ message: "Task ID is required" });
      }
    } catch (error) {
      console.error("[Backend] Error fetching task by ID: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  public createTask = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as Prisma.TaskCreateInput;
    try {
      const task = await databaseService.createTask(data);

      if (task) {
        const enqueuedTask: EnqueuedTask = {
          id: task.id,
          status: task.status,
          processing_time: task.processing_time.getTime(),
          priority: task.priority,
        };

        await this.rabbitService.publishToQueue(null, enqueuedTask);
        res.status(201).json(task);
      } else {
        res.status(400).json({ message: "Failed to create task" });
      }
    } catch (error) {
      console.error("[Backend] Error creating task: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  public updateTask = (req: Request, res: Response): void => {
    const id: string = req.params.id as string;
    const data = req.body as Prisma.TaskUpdateInput;

    try {
      const task = databaseService.updateTask(id, data);
      res.status(200).json(task);
    } catch (error) {
      console.error("[Backend] Error updating task: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  public cancelTask = (req: Request, res: Response): void => {
    const id: string = req.params.id as string;
    try {
      const task = databaseService.cancelTask(id);
      res.status(200).json(task);
    } catch (error) {
      console.error("[Backend] Error canceling task: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  public deleteTask = (req: Request, res: Response): void => {
    const id: string = req.params.id as string;
    try {
      const task = databaseService.deleteTask(id);
      res.status(200).json(task);
    } catch (error) {
      console.error("[Backend] Error deleting task: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export default TaskController;
