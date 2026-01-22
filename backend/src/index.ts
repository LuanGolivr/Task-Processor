import express, { type Application, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import TaskRoutes from './routes/taskRoutes.js';

class App{
    private port:number;
    private app:Application;
    private router:TaskRoutes;

    constructor(){
        this.app = express();
        this.port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;
        this.router = new TaskRoutes();

        this.initMiddlewares();
        this.initRoutes();
        this.initErrorHandling();
    }

    private initMiddlewares():void{
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true}));   
    }

    private initRoutes():void{
        this.app.use(this.router.getRouter());
    }

    private initErrorHandling():void{}

    public listen():void{
        this.app.listen(this.port, () => {
            console.info(`Server is running on port ${this.port}`);
        });
    }   

}

const app = new App();
app.listen();