import {Router, type Request, type Response} from 'express';
import TaskController from '../controllers/taskController';

class TaskRoutes{
    private router:Router;
    private taskController: TaskController;

    constructor(){
        this.router = Router();
        this.setRoutes();
        this.taskController = new TaskController();
    }

    private setRoutes():void{
        this.router.get("/health", (req: Request, res:Response) =>{
            res.status(200).json({status: "OK, server is healthy"});
        });

        this.router.get("/task/:id", this.taskController.getTaskById.bind(this.taskController));
    
        this.router.get("/tasks", this.taskController.getTasks.bind(this.taskController));
    
        this.router.post("/task", this.taskController.createTask.bind(this.taskController));
    
        this.router.delete("/task/:id", this.taskController.deleteTask.bind(this.taskController));
    }

    public getRouter():Router{
        return this.router;
    }
}

export default TaskRoutes;