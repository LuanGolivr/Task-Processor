//import * as amqp from "amqplib";
import { connect, type Channel, type ChannelModel } from "amqplib";
import type { EnqueuedTask } from "../types/index.js";

export class RabbitMQService {
    public connection: ChannelModel | null = null;
    public channel: Channel | null = null;
    private standardQueuename: string = 'task_queue';
    private connected = false;

    constructor(){
        this.connect();
    }

    private async connect(): Promise<void> {
        if (this.connected && this.channel) return;

        try {
            this.connection = await connect("amqp://guest:guest@rabbitmq:5672");
            this.channel = await this.connection.createChannel();
            this.channel.assertQueue('task_queue', {
                durable: true,
            });
            this.connected = true;
            console.log("RabbitMQ connected");
        } catch (error) {
            console.error("Connection error", error);
            throw error;
        }
    }

    public async publishToQueue(queueName: string | null, message:EnqueuedTask): Promise<void>{
        try{
            if(this.channel){
                this.channel.sendToQueue(
                    queueName? queueName : this.standardQueuename,
                    Buffer.from(JSON.stringify(message)),
                    { persistent: true }
                );
            }else{
                throw new Error("Channel is not established");
            }
        }catch(error){
            console.error("Error publishing to queue: ", error);
            throw error;
        }
    }
}

const rabbitMQService = new RabbitMQService();
export default rabbitMQService;