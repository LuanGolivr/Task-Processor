import { Status, type Task } from "../../prisma/generated/prisma/client.js";

export interface TaskFilters {
  status?: Status[];
  processing_time?: string;
  priority?: string[];
  startDate?: string;
  endDate?: string;
  completedAfter?: string;
  completedBefore?: string;
  createdAfter?: string;
  createdBefore?: string;
}
