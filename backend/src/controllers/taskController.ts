import { type Request, type Response } from "express";
import { type Task } from  '../../prisma/generated/prisma/client.js';
import { databaseService } from "../services/databaseService.js";
import { type EnqueuedTask, type QueryTask } from "../types/index.js";
import rabbitMQService, { RabbitMQService } from "../services/rabbitMQService.js";

class TaskController{
    private rabbitService: RabbitMQService = rabbitMQService;
    constructor(){}

    private buildFilterQuery(req:Request){
        //const filter
    }

    public getTasks = (req:Request, res:Response):void => {
        const take:number = req.query.take ? parseInt(req.query.take as string, 10) : 10;
        const skip:number = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
        const data:any = req.query.data ? JSON.parse(req.query.data as string) : {};

        try{
            const tasks = databaseService.getTasks(data, take, skip);
            res.status(200).json(tasks);
        }catch(error){
            console.error("Error fetching tasks: ", error);
            res.status(500).json({message: "Internal server error"});
        }
    }

    public getTaskById = (req:Request, res:Response):void => {
        const id:string = req.params.id as string;
        try{
            if(id){
                const task = databaseService.getTaskById(id);
                res.status(200).json(task);
            }else{
                res.status(400).json({message: "Task ID is required"});
            }
        }catch(error){
            console.error("Error fetching task by ID: ", error);
            res.status(500).json({message: "Internal server error"});
        }
    }

    public createTask = async (req:Request, res:Response):Promise<void> => {
        const data:any = req.body;
        try{
            const task = await databaseService.createTask(data);

            if(task){
                const enqueuedTask: EnqueuedTask = {
                    id: task.id,
                    status: task.status,
                    processing_time: task.processing_time.getTime(),
                    priority: task.priority,
                }

                await this.rabbitService.publishToQueue(null, enqueuedTask);
                res.status(201).json(task);
            }else{
                res.status(400).json({message: "Failed to create task"});
            }
        }catch(error){
            console.error("Error creating task: ", error);
            res.status(500).json({message: "Internal server error"});
        }
    }

    public updateTask = (req: Request, res:Response):void => {
        const id:string = req.params.id as string;
        const data:any = req.body;
        
        try{
            const task = databaseService.updateTask(id, data);
            res.status(200).json(task);
        }catch(error){
            console.error("Error updating task: ", error);
            res.status(500).json({message: "Internal server error"});
        }
    }

    public cancelTask = (req:Request, res:Response):void => {
        const id:string = req.params.id as string;
        try{
            const task = databaseService.cancelTask(id);
            res.status(200).json(task);
        }catch(error){
            console.error("Error canceling task: ", error);
            res.status(500).json({message: "Internal server error"});
        }
    }

    public deleteTask = (req:Request, res:Response):void => {
        const id:string = req.params.id as string;
        try{
            const task = databaseService.deleteTask(id);
            res.status(200).json(task);
        }catch(error){
            console.error("Error deleting task: ", error);
            res.status(500).json({message: "Internal server error"});
        }
    }
}

export default TaskController;