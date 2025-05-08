// controllers/cron.controller.js or routes/cron.routes.js

const { parse, isValid, zonedTimeToUtc } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz"); // For timezone support
const prisma = require("../config/db");

// Set your local timezone (e.g., Asia/Kolkata for IST)
const timeZone = "Asia/Kolkata"; // Change this to your actual timezone

exports.checkEvent = async (req, res) => {
  try {
    const nowUTC = new Date();
    const nowLocal = utcToZonedTime(nowUTC, timeZone);

    console.log("Cron endpoint triggered at (UTC):", nowUTC);
    console.log("Cron endpoint triggered at (Local):", nowLocal);

    const events = await prisma.event.findMany({
      where: { visibility: true },
    });

    for (const event of events) {
      const endTimeString = `${event.end_date} ${event.end_time}`;
      let eventEndDateTimeLocal;

      try {
        // Parse as local time
        eventEndDateTimeLocal = parse(endTimeString, "yyyy-MM-dd HH:mm", new Date());
      } catch (err) {
        console.warn(`Failed to parse date for event ID ${event.id}:`, endTimeString);
        continue;
      }

      if (!isValid(eventEndDateTimeLocal)) {
        console.warn(`Invalid date for event ID ${event.id}:`, endTimeString);
        continue;
      }

      // Convert parsed local time to UTC for safe storage/comparison
      const eventEndDateTimeUTC = zonedTimeToUtc(eventEndDateTimeLocal, timeZone);

      // Log for debugging
      console.log(`\n--- Event ID: ${event.id} ---`);
      console.log(`End time string: ${endTimeString}`);
      console.log(`Parsed end time (local): ${eventEndDateTimeLocal}`);
      console.log(`Parsed end time (UTC): ${eventEndDateTimeUTC}`);
      console.log(`Current time (local): ${nowLocal}`);
      console.log(`Current time (UTC): ${nowUTC}`);
      console.log(`Is now > end time? ${nowLocal > eventEndDateTimeLocal}`);

      // Compare in local time for clarity
      if (nowLocal > eventEndDateTimeLocal) {
        await prisma.event.update({
          where: { id: event.id },
          data: { visibility: false },
        });
        console.log(`✅ Event ${event.id} hidden`);
      }
    }

    return res.status(200).json({ message: "Cron job executed successfully" });

  } catch (error) {
    console.error("🚨 Error in cron endpoint:", error.message || error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};