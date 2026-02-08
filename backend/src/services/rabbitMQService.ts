import { connect, type Channel, type ChannelModel } from "amqplib";
import { type EnqueuedTask } from "../types/rabbitTypes.js";

export class RabbitMQService {
  public connection: ChannelModel | null = null;
  public channel: Channel | null = null;
  private standardQueuename: string = "task_queue";
  private connected = false;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    if (this.connected && this.channel) return;

    try {
      this.connection = await connect("amqp://guest:guest@rabbitmq:5672");
      this.channel = await this.connection.createChannel();
      this.channel.assertQueue("task_queue", {
        durable: true,
      });
      this.connected = true;
      console.info("[RabbitMQ] connected");
    } catch (error) {
      console.error("[RabbitMQ] Connection error", error);
      throw error;
    }
  }

  public async publishToQueue(
    queueName: string | null = null,
    message: EnqueuedTask,
    attempts: number = 3,
  ): Promise<void> {
    let attempt = 0;
    while (attempt < attempts) {
      try {
        if (!this.channel) await this.connect();

        if (this.channel) {
          const sucess = this.channel.sendToQueue(
            queueName ? queueName : this.standardQueuename,
            Buffer.from(JSON.stringify(message)),
            { persistent: true },
          );

          if (sucess) {
            console.info(
              `[RabbitMQ] Message sent to queue: ${queueName ? queueName : this.standardQueuename}`,
            );
            return;
          }

          throw new Error("[RabbitMQ] Channel buffer full");
        } else {
          throw new Error("[RabbitMQ] Channel is not established");
        }
      } catch (error) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `[RabbitMQ] [Retry ${attempt}/${attempts}] Failed to publish.Retraying in ${delay}ms....`,
        );

        if (attempt >= attempts) {
          console.error("[RabbitMQ] Max retries reached. Message lost.");
          throw error;
        }

        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
}

const rabbitMQService = new RabbitMQService();
export default rabbitMQService;
