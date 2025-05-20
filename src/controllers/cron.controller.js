const { parse } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const isValid = require('date-fns/isValid');
const prisma = require("../config/db");

exports.checkEvent = async () => {
  try {
    const nowUTC = new Date();
    console.log("Running cron job at UTC time:", nowUTC);

    const events = await prisma.event.findMany({
      where: { visibility: true },
    });

    for (const event of events) {
      const endTimeString = `${event.end_date} ${event.end_time}`;
      const eventTimezone = event.timezone || 'UTC';

      const naiveDateTime = parse(endTimeString, "yyyy-MM-dd HH:mm", new Date());
      const zonedEventEnd = utcToZonedTime(naiveDateTime, eventTimezone);

      if (!isValid(zonedEventEnd)) {
        console.warn(`Invalid date for event ID ${event.id}:`, endTimeString);
        continue;
      }

      const nowInZone = utcToZonedTime(nowUTC, eventTimezone);

      if (nowInZone > zonedEventEnd) {
        await prisma.event.update({
          where: { id: event.id },
          data: { visibility: false },
        });
        console.log(`[CRON] Event ${event.id} hidden (ended)`);
      }
    }

  } catch (error) {
    console.error("Error in cron job:", error.message || error);
  }
};