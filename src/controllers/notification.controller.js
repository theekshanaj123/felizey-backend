const prisma = require("../config/db");

const admin = require("firebase-admin");

exports.pushNotification = async (req, res) => {
  const messaging = admin.messaging();

  try {
    const userEmail = req.user.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    const { title, message } = req.body;

    if (!title) return res.status(400).json({ error: "title required" });

    if (!message) return res.status(400).json({ error: "message required" });

    const response = await messaging.send({
      token: user.firebaseToken,
      notification: { title, body: message },
    });

    res.json({ success: true, response });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
