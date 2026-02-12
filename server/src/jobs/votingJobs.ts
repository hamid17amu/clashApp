import { Job, Queue, Worker } from "bullmq";
import { defaultJobOptions, redisConnection } from "../config/queue.js";
import prisma from "../config/database.js";

export const votingQueueName = "votingQueue";

interface VotingJobDataType {
  clashId: number;
  clashItemId: number;
}

export const votingQueue = new Queue(votingQueueName, {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    delay: 500,
  },
});

//worker
export const votingWorker = new Worker(
  votingQueueName,
  async (job: Job) => {
    const data: VotingJobDataType = job.data;
    console.log("Processing voting job for clashItemId: " + data.clashItemId);
    await prisma.clashItem.update({
        where: {
            id: data.clashItemId
        },
        data: {
            count: {
                increment: 1
            }
        }
    })
  },
  {
    connection: redisConnection,
  }
);
