const axios = require("axios");

async function getIP(req) {

    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        req.ip;

    const cleanIp = ip.startsWith('::ffff:') ? ip.split(':').pop() : ip.split(',')[0].trim();

    try {
        const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`);
        const location = response.data;

        return {
            status: true,
            data:location
        };

    } catch (error) {
        return {status: false, error: "Could not determine location"};
    }
}

module.exports = getIP;