import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { format, parse, isValid } from 'date-fns';

const prisma = new PrismaClient();

cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        console.log('Cron job started at:', now);

        const events = await prisma.event.findMany({
            where: { visibility: true },
        });

        for (const event of events) {
            const endTimeString = `${event.end_date} ${event.end_time}`;
            const eventEndDateTime = parse(endTimeString, 'yyyy-MM-dd HH:mm', new Date());

            if (!isValid(eventEndDateTime)) {
                console.warn(`Invalid date for event ID ${event.id}:`, endTimeString);
                continue;
            }

            if (new Date() > eventEndDateTime) {
                await prisma.event.update({
                    where: { id: event.id },
                    data: { visibility: false },
                });
                console.log(`Event ${event.id} hidden`);
            }
        }

    } catch (error) {
        console.error('Error in cron job:', error.message || error);
    }
});