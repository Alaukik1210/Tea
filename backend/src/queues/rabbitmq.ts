import amqp, { Channel } from "amqplib";

let channel: Channel;

export const connectRabbitMQ = async () => {
  if (channel) return channel;

  const connection = await amqp.connect({
    protocol: "amqp",
    hostname: process.env.RABBITMQ_HOST,
    port: 5672,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });

  channel = await connection.createChannel();
  console.log(" RabbitMQ connected");

  return channel;
};

export const getChannel = () => {
  if (!channel) throw new Error("RabbitMQ not initialized");
  return channel;
};
