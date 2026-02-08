import express, { type Application, Router } from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer, Server } from "http";

import TaskRoutes from "./routes/taskRoutes.js";
import gRPCS from "./services/gRPCService.js";
import socketServer from "./services/SocketService.js";

class App {
  private port: number;
  private app: Application;
  private router: TaskRoutes;
  private httpServer: Server;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = process.env.SERVER_PORT
      ? parseInt(process.env.SERVER_PORT)
      : 3000;
    this.router = new TaskRoutes();

    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandling();
    this.initServices();
  }

  private initMiddlewares(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initRoutes(): void {
    this.app.use(this.router.getRouter());
  }

  private initErrorHandling(): void {}

  private initServices(): void {
    socketServer.init(this.httpServer);
    gRPCS.start();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.info(`Server is running on port ${this.port}`);
    });
  }
}

const app = new App();
app.listen();
