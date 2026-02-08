import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { databaseService } from "./databaseService.js";
import socketServer from "./SocketService.js";
import { type StatusRequest, type StatusResponse } from "../types/grpcTypes.js";
import type { Status } from "../../prisma/generated/prisma/enums.js";

const PROTO_PATH = path.join(process.cwd(), "protos", "task.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const taskProto = grpc.loadPackageDefinition(packageDefinition) as any;

export class gRPCService {
  private databaseService = databaseService;
  private server: grpc.Server;

  constructor() {
    this.server = new grpc.Server();
    this.setupServices();
  }

  private setupServices(): void {
    this.server.addService(taskProto.task.TaskService.service, {
      updateTaskStatus: this.handleUpdateTaskStatus.bind(this),
    });
  }

  private async handleUpdateTaskStatus(
    call: grpc.ServerUnaryCall<StatusRequest, StatusResponse>,
    callback: grpc.sendUnaryData<StatusResponse>,
  ): Promise<void> {
    const id: string = call.request.id;
    const status: Status = call.request.status as Status;

    try {
      await this.databaseService.updateTask(id, { status });
      socketServer.emitTaskUpdate(id, status);
      callback(null, {
        sucess: true,
        message: `Task ${id} status updated to ${status}`,
      });
    } catch (error) {
      console.error("[gRPC Error]: ", error);
      callback({
        code: grpc.status.INTERNAL,
        details: "Internal error while updating task status",
      });
    }
  }

  public start(port: string = "50051"): void {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => {
        if (error) {
          console.error("[gRPC] Failed to start server: ", error.message);
          return;
        }

        this.server.start();
        console.log(`[gRPC] server running on port ${boundPort}`);
      },
    );
  }
}

const gRPCS = new gRPCService();
export default gRPCS;
