import { Server } from "socket.io";
import { votingQueue, votingQueueName } from "./jobs/votingJobs.js";

export function setupSocket(io:Server) {
    io.on('connection', (socket) => {
        console.log('A user connected: ' + socket.id); 

        io.on('disconnect', (socket) => {
            console.log('A user disconnected: ' + socket.id); 
        });

        socket.onAny(async(eventName:string, data:any)=>{
            console.log("Received event: " + eventName, data);
            if (eventName.startsWith("clashing-")) {
                console.log("Received clashing event: " + eventName, data);
                await votingQueue.add(votingQueueName,data);
                socket.broadcast.emit(`clashing-${data.clashId}`, data);
            }
        })

    });
}
 