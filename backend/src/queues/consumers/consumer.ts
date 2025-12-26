import { env } from "../../config/env.js";
import { connectRabbitMQ } from "../rabbitmq.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const startSendOtpConsumer = async () => {
  const channel = await connectRabbitMQ();
  const queue = "send-otp";

  await channel.assertQueue(queue, { durable: true });

  console.log(" OTP Mail consumer running");

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const { to, subject, body } = JSON.parse(msg.content.toString());

      await transporter.sendMail({
        from: `"Tea" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: body,
      });
      console.log(" OTP mail sent to", to);

      channel.ack(msg);
    } catch (err) {
      console.error(" OTP mail failed", err);

      // retry once, then drop
      channel.nack(msg, false, false);
    }
  });
};
