import { PrismaClient, Prisma, type Task } from  '../../prisma/generated/prisma/client.js' //'../../generated/prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';

class DataBaseService {
    private prisma: PrismaClient;
    private adapter: PrismaPg;

    constructor(){
        this.adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });
        this.prisma = new PrismaClient({
            adapter: this.adapter
        });
    }


    public async getTaskById(id:string): Promise<Task | null>{
        let task = null;
        try{
            task = await this.prisma.task.findUnique({
                where: {id}
            });
        }catch(error){
            if(error instanceof Prisma.PrismaClientKnownRequestError){
                console.error("Prisma error: ", error.message);
            }

            console.error("Unknown error: ", error);
        }

        return task;
    }

    public async getTasks(data: any, take:number, skip:number): Promise<Task[]>{
        let tasks:Task[] = [];

        try{
            tasks = await this.prisma.task.findMany({
                where: data,
                take,
                skip
            });
        }catch(error){
            console.error("Error fetching tasks: ", error);
        }

        return tasks;
    }

    public async createTask(data:any): Promise<Task | null>{
        try{
            return await this.prisma.task.create({ data });
        }catch(error){
            console.error("Error creating task: ", error);
            return null;
        }
    }

    public async updateTask(id:string, data:any): Promise<Task | null>{
        let task: Task | null = null;
        try{
            task = await this.prisma.task.update({
                where: {id},
                data
            });
        }catch(error){
            console.error("Error updating task: ", error);
        }

        return task;
    }

    public async cancelTask(id:string): Promise<Task | null>{
        let task: Task | null = null;
        try{
            task = await this.prisma.task.update({
                where: {id},
                data: {status: "CANCELLED"}
            });
        }catch(error){
            console.error("Error canceling task: ", error);
        }

        return task;
    }

    public async deleteTask(id:string): Promise<Task | null>{
        let task: Task | null = null;
        try{
            task = await this.prisma.task.delete({
                where: {id}
            });
        }catch(error){
            console.error("Error deleting task: ", error);
        }

        return task;
    }
}


export const databaseService = new DataBaseService();