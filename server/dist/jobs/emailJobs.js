import { Queue, Worker } from "bullmq";
import { defaultJobOptions, redisConnection } from "../config/queue.js";
import { sendMail } from "../config/mail.js";
export const emailQueueName = "emailQueue";
export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultJobOptions
});
//worker
export const emailWorker = new Worker(emailQueueName, async (job) => {
    const data = job.data;
    // console.log(data);
    await sendMail(data.to, data.subject, data.html);
}, {
    connection: redisConnection
});
