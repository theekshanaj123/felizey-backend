const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

async function getCurrentZoneTime(timezone) {

    const currentTime = dayjs().tz('Asia/Tokyo');

    return {dateTime: currentTime.format()}
}

async function formatTimeWithZone(dateTime, timeZone, format) {
    const d = dayjs.tz(dateTime, timeZone);

    if (format === "ISO" || type == null) {
        return {dateTime: d.format()}
    } else if (format === "UTC") {
        return {dateTime: d.utc().format()}
    } else {
        return {dateTime: d.format(format)}
    }
}

module.exports = {
    getCurrentZoneTime,
    formatTimeWithZone,
};