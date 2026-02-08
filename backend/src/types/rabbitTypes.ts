import { Status } from "../../prisma/generated/prisma/enums.js";

export interface EnqueuedTask {
  id: string;
  status: Status;
  processing_time: number;
  priority: number;
}
