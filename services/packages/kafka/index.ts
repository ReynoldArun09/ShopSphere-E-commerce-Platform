import { getLogger } from "@shopsphere/logger";
import { Kafka, Partitioners, Producer } from "kafkajs";

const logger = getLogger("@shopSphere/kafka-client", "debug");

class KafkaClient {
  private producer: Producer;
  private isConnected = false;
  private readonly kafka: Kafka;

  constructor(
    clientId: string,
    brokers: string[],
    options = { allowAutoTopicCreation: true, createPartitioner: Partitioners.DefaultPartitioner }
  ) {
    this.kafka = new Kafka({
      clientId,
      brokers,
    });
    this.producer = this.kafka.producer(options);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.producer.on("producer.connect", () => {
      this.isConnected = true;
      logger.info("Kafka producer connected");
    });

    this.producer.on("producer.disconnect", () => {
      this.isConnected = false;
      logger.info("Kafka producer disconnect");
    });

    this.producer.on("producer.network.request_timeout", (payload) => {
      logger.error("Kafka producer network request timeout", payload);
    });
  }

  public getProducer(): Producer {
    return this.producer;
  }

  public createConsumer(groupId: string) {
    return this.kafka.consumer({ groupId });
  }

  public isReady(): boolean {
    return this.isConnected;
  }

  public async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = false;
    } catch (error) {
      logger.error("Failed to disconnect kafka producer", error);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
    } catch (error) {
      logger.error("Failed to disconnect kafka producer", error);
    }
  }
}

export default KafkaClient;

export interface KafkaMessage<T> {
  key: string;
  value: T;
}

export abstract class BaseProducer<T> {
  protected abstract readonly topic: string;
  private producer: Producer;

  constructor(producer: Producer) {
    this.producer = producer;
  }

  async publish(data: KafkaMessage<T>): Promise<void> {
    try {
      logger.info(`Publishing message to topic: ${this.topic} with message.`);

      await this.producer.send({
        topic: this.topic,
        messages: [{ key: data.key, value: JSON.stringify(data.value) }],
      });

      logger.debug(`message published successfully to topic: ${this.topic}`);
    } catch (error) {
      logger.error(`Failed to publish message to topic ${this.topic}: ${error}`);
      throw error;
    }
  }
}
