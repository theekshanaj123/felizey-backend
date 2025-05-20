import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { parse, isValid } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const prisma = new PrismaClient();

export const checkEndedEvents = async () => {
    try {
        const start = new Date();
        console.log('Cron job started at (UTC):', start);

        let hiddenCount = 0;
        const BATCH_SIZE = 50;
        let skip = 0;

        while (true) {
            const batch = await prisma.event.findMany({
                where: { visibility: true },
                skip,
                take: BATCH_SIZE,
            });

            if (batch.length === 0) break;

            const nowUTC = new Date(); // Only one now() call per batch

            for (const event of batch) {
                const endTimeString = `${event.end_date} ${event.end_time}`;
                const timezone = event.timezone || 'UTC';

                // Parse datetime assuming it's in event's timezone
                const naiveDateTime = parse(endTimeString, 'yyyy-MM-dd HH:mm', new Date());
                const zonedEventEnd = utcToZonedTime(naiveDateTime, timezone);
                const nowInZone = utcToZonedTime(nowUTC, timezone);

                if (!isValid(zonedEventEnd)) {
                    console.warn(`Invalid date for event ID ${event.id}:`, endTimeString);
                    continue;
                }

                if (nowInZone > zonedEventEnd) {
                    await prisma.event.update({
                        where: { id: event.id },
                        data: { visibility: false },
                    });
                    console.log(`[CRON] Event ${event.id} hidden`);
                    hiddenCount++;
                }
            }

            skip += BATCH_SIZE;
        }

        const end = new Date();
        console.log(`Processed ${skip} events`);
        console.log(`Hidden ${hiddenCount} ended events`);
        console.log(`Duration: ${end - start} ms`);

    } catch (error) {
        console.error('Error in cron job:', error.message || error);
    }
};

// Run every minute
cron.schedule('* * * * *', async () => {
    console.log('Scheduled cron job triggered...');
    await checkEndedEvents();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});