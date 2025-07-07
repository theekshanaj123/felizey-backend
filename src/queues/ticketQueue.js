const { join } = require('path');
const { Worker, Queue } = require('bullmq');
const prisma = require("../config/db");

// Redis connection
const connection = {
    host: '127.0.0.1',
    port: 6379,
};

// Define the queue
const ticketExpiryQueue = new Queue('ticket-expiry', {
    connection,
});

// Define the worker
const worker = new Worker(
    'ticket-expiry',
    async (job) => {
        const { ticketId } = job.data;

        const ticket = await prisma.ticket.findUnique({
            where: { ticketId },
        });

        if (!ticket || ticket.status !== 'Pending') return;

        // Update to expired
        await prisma.ticket.update({
            where: { ticketId },
            data: { status: '' },
        });

        console.log(`Ticket ${ticketId} has been expired.`);
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

module.exports = ticketExpiryQueue;