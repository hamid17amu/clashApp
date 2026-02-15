import { Job, Queue, Worker } from 'bullmq';
import { defaultJobOptions, redisConnection } from '../config/queue.js';
import prisma from '../config/database.js';

export const commentQueueName = 'commentQueue';

interface CommentJobDataType {
    id: number;
    comment: string;
    created_at: Date;
}

export const commentQueue = new Queue(commentQueueName, {
    connection: redisConnection,
    defaultJobOptions: {
        ...defaultJobOptions,
        delay: 500,
    },
});

//worker
export const commentWorker = new Worker(
    commentQueueName,
    async (job: Job) => {
        const data: CommentJobDataType = job.data;
        console.log('Processing comment job: ' + JSON.stringify(data));
        await prisma.clashComments.create({
            data: {
                clash_id: data.id,
                comment: data.comment,
                created_at: data.created_at,
            },
        });
    },
    {
        connection: redisConnection,
    },
);
