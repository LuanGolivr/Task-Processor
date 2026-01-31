import { type Request, type Response } from "express";
import { type Task } from  '../../prisma/generated/prisma/client.js';
import { databaseService } from "../services/databaseService.js";

class TaskController{
    constructor(){}

    public getTasks = (req:Request, res:Response):void => {
        const take:number = req.query.take ? parseInt(req.query.take as string, 10) : 10;
        const skip:number = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
        const data:any = req.query.data ? JSON.parse(req.query.data as string) : {};

        try{
            const tasks: Promise<Task[]> = databaseService.getTasks(data, take, skip);
            res.status(200).json(tasks);
        }catch(error){
            console.error("Error fetching tasks: ", error);
        }
    }

    public getTaskById = (req:Request, res:Response):void => {
        const id:string = req.params.id as string;
        try{
            if(id){
                const task: Promise<Task | null> = databaseService.getTaskById(id);
                res.status(200).json(task);
            }else{
                res.status(400).json({message: "Task ID is required"});
            }
        }catch(error){
            console.error("Error fetching task by ID: ", error);
        }
    }

    public createTask = (req:Request, res:Response):void => {
        const data:any = req.body;
        try{
            const task: Promise<Task | null> = databaseService.createTask(data);
            res.status(201).json(task);
        }catch(error){
            console.error("Error creating task: ", error);
        }
    }

    public updateTask = (req: Request, res:Response):void => {
        const id:string = req.params.id as string;
        const data:any = req.body;
        
        try{
            const task: Promise<Task | null> = databaseService.updateTask(id, data);
            res.status(200).json(task);
        }catch(error){
            console.error("Error updating task: ", error);
        }
    }

    public cancelTask = (req:Request, res:Response):void => {
        const id:string = req.params.id as string;
        try{
            const task: Promise<Task | null> = databaseService.cancelTask(id);
            res.status(200).json(task);
        }catch(error){
            console.error("Error canceling task: ", error);
        }
    }

    public deleteTask = (req:Request, res:Response):void => {
        const id:string = req.params.id as string;
        try{
            const task: Promise<Task | null> = databaseService.deleteTask(id);
            res.status(200).json(task);
        }catch(error){
            console.error("Error deleting task: ", error);
        }
    }
}

export default TaskController;