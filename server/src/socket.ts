import { Server } from 'socket.io';
import { votingQueue, votingQueueName } from './jobs/votingJobs.js';
import { commentQueue, commentQueueName } from './jobs/commentJobs.js';

export function setupSocket(io: Server) {
    io.on('connection', (socket) => {
        console.log('A user connected: ' + socket.id);

        io.on('disconnect', (socket) => {
            console.log('A user disconnected: ' + socket.id);
        });

        socket.onAny(async (eventName: string, data: any) => {
            if (eventName.startsWith('clashing-')) {
                await votingQueue.add(votingQueueName, data);
                socket.broadcast.emit(`clashing-${data.clashId}`, data);
            } else if (eventName.startsWith('commenting-')) {
                console.log('Received commenting event: ' + eventName, data);
                await commentQueue.add(commentQueueName, data);
                socket.broadcast.emit(`commenting-${data.id}`, data);
            }
        });
    });
}
