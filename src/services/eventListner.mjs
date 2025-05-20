import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { format, parse, isValid } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const prisma = new PrismaClient();

export const checkEndedEvents = async () => {
    try {
        const start = new Date();

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

            for (const event of batch) {
                const endTimeString = `${event.end_date} ${event.end_time}`;
                const timezone = event.timezone || 'UTC';

                // Parse datetime assuming it's in event's timezone
                const naiveDateTime = parse(endTimeString, 'yyyy-MM-dd HH:mm', new Date());
                const zonedEventEnd = utcToZonedTime(naiveDateTime, timezone);
                const nowInZone = utcToZonedTime(new Date(), timezone);
                console.log('Cron job started at:', nowInZone);
                console.log('Event Date Time:', zonedEventEnd);

                if (!isValid(zonedEventEnd)) {
                    console.warn(`Invalid date for event ID ${event.id}:`, endTimeString);
                    continue;
                }

                if (nowInZone > zonedEventEnd) {
                    await prisma.event.update({
                        where: { id: event.id },
                        data: { visibility: false },
                    });
                    console.log(`Event ${event.id} hidden`);
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