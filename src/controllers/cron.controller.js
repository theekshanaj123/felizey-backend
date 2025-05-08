const { format, parse, isValid } = require("date-fns");
const prisma = require("../config/db");
exports.checkEvent = async (req, res) => {
  try {
    const now = new Date();
    console.log("Cron endpoint triggered at:", now);

    const events = await prisma.event.findMany({
      where: { visibility: true },
    });

    for (const event of events) {
      const endTimeString = `${event.end_date} ${event.end_time}`;
      const eventEndDateTime = parse(
        endTimeString,
        "yyyy-MM-dd HH:mm",
        new Date()
      );

      if (!isValid(eventEndDateTime)) {
        console.warn(`Invalid date for event ID ${event.id}:`, endTimeString);
        continue;
      }

      console.log(`Event ID: ${event.id}`);
      console.log(`Parsed end time: ${eventEndDateTime}`);
      console.log(`Is valid date? ${isValid(eventEndDateTime)}`);
      console.log(`Now: ${new Date()}`);
      console.log(`Is now > end time? ${new Date() > eventEndDateTime}`);

      if (new Date() > eventEndDateTime) {
        await prisma.event.update({
          where: { id: event.id },
          data: { visibility: false },
        });
        console.log(`Event ${event.id} hidden`);
      }
    }

    return res.status(200).json({ message: "Cron job executed successfully" });
  } catch (error) {
    console.error("Error in cron endpoint:", error.message || error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
