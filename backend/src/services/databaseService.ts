import {
  PrismaClient,
  Prisma,
  type Task,
} from "../../prisma/generated/prisma/client.js"; //'../../generated/prisma-client';
import { PrismaPg } from "@prisma/adapter-pg";

class DataBaseService {
  private prisma: PrismaClient;
  private adapter: PrismaPg;

  constructor() {
    this.adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    this.prisma = new PrismaClient({
      adapter: this.adapter,
    });
  }

  public async getTaskById(id: string): Promise<Task | null> {
    let task = null;
    try {
      task = await this.prisma.task.findUnique({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("[Prisma] Prisma error: ", error.message);
      }

      console.error("[Prisma] Unknown error: ", error);
    }

    return task;
  }

  public async getTasks(
    where: Prisma.TaskWhereInput,
    take: number,
    skip: number,
  ): Promise<Task[]> {
    let tasks: Task[] = [];

    try {
      tasks = await this.prisma.task.findMany({
        where,
        take,
        skip,
        orderBy: {
          created_at: "desc",
        },
      });
    } catch (error) {
      console.error("[Prisma] Error fetching tasks: ", error);
    }

    return tasks;
  }

  public async createTask(data: Prisma.TaskCreateInput): Promise<Task | null> {
    try {
      return await this.prisma.task.create({ data });
    } catch (error) {
      console.error("[Prisma] Error creating task: ", error);
      return null;
    }
  }

  public async updateTask(
    id: string,
    data: Prisma.TaskUpdateInput,
  ): Promise<Task | null> {
    let task: Task | null = null;
    try {
      task = await this.prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("[Prisma] Error updating task: ", error);
    }

    return task;
  }

  public async cancelTask(id: string): Promise<Task | null> {
    let task: Task | null = null;
    try {
      task = await this.prisma.task.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
    } catch (error) {
      console.error("[Prisma] Error canceling task: ", error);
    }

    return task;
  }

  public async deleteTask(id: string): Promise<Task | null> {
    let task: Task | null = null;
    try {
      task = await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      console.error("[Prisma] Error deleting task: ", error);
    }

    return task;
  }
}

export const databaseService = new DataBaseService();
