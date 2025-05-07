import cron from 'node-cron';
import { format, parse } from 'date-fns';

const prisma = require('../config/db');

// Run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running event visibility updater...');

    const now = new Date();

    // Get all visible events that may need to be hidden
    const events = await prisma.event.findMany({
        where: {
            isVisible: true,
        },
    });

    for (const event of events) {
        const endTimeString = `${format(event.end_date, 'yyyy-MM-dd')} ${event.end_time}`;
        const eventEndDateTime = parse(endTimeString, 'yyyy-MM-dd HH:mm', new Date());

        if (now > eventEndDateTime) {
            await prisma.event.update({
                where: { id: event.id },
                data: { isVisible: false },
            });
            console.log(`Event ${event.id} has ended.`);
        }
    }
});