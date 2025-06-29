const axios = require("axios");

async function getIP(req) {

    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        req.ip;

    console.log("ip address : ", ip)

    // const cleanIp = ip.startsWith('::ffff:') ? ip.split(':').pop() : ip.split(',')[0].trim();

    const cleanIp = ip.replace(/^::ffff:/, '').trim();

    console.log("clean ip : ", cleanIp)

    try {
        const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`);
        return {
            status: true,
            data: response.data
        };

    } catch (error) {
        return {status: false, error: "Could not determine location"};
    }
}

module.exports = getIP;