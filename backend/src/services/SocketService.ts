import {Server as SocketIOServer} from "socket.io";
import {Server as HTTPServer} from "http";

export class SocketService{
    private static instance:SocketService;
    private io: SocketIOServer | null = null;

    private constructor(){}

    public static getInstance(): SocketService{
        if(!SocketService.instance){
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public init(httpServer: HTTPServer):void{
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on("connection", (socket) => {
            console.info(`[Socket] Client connected: ${socket.id}`);
            
            socket.on("disconnect", () => {
                console.info(`[Socket] Client disconnected: ${socket.id}`);
            });
        });
    }

    public emitTaskUpdate(taskId: string, status: string): void{
        if(!this.io){
            console.error("[Socket] socket.io server not initialized");
            return;
        }

        const payload = {
            id: taskId,
            status,
            message: `Task ${taskId} status updated to ${status}`,
            timestamp: Date.now()
        };

        this.io.emit("task_updated", payload);
        console.info(`[Socket] Emitted task update: Task ${taskId}`);
    }
}

const socketServer = SocketService.getInstance();
export default socketServer;