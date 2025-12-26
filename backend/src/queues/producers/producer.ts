import { getChannel } from "../rabbitmq.js";

export const publishOtpMail = async (payload: {
  to: string;
  subject: string;
  body: string;
}) => {
  const queue = "send-otp";
  const channel = getChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
};
