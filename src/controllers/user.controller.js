const prisma = require("../config/db");
const sendEmail = require("../services/emailSender");

exports.updateUserEmailSend = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    const sendMail = await sendEmail(
      req.user.email,
      "Change of Email",
      req.user.email
    );

    if (sendMail.error) {
      return res.status(400).json({ message: sendMail.message });
    }

    // const { error } = await supabase.auth.updateUser({
    //   email: "kavishkachathumal276@gmail.com",
    // });

    // if (error) {
    //   console.error("Email change error:", error.message);
    //   return res.status(400).json({ message: error.message });
    // } else {
    //   console.log("Confirmation email sent to the new address.");
    //   return res.status(200).json({
    //     status: true,
    //     message: `Email update request sent to ${req.user.email}. Verify using the confirmation email.`,
    //   });
    // }

    return res.status(200).json({
      status: true,
      message: `Email update request sent to ${req.user.email}. Verify using the confirmation email.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    if (!newEmail) {
      return res.status(400).json({ message: "New Email Required." });
    }

    const updatedUser = await prisma.user.update({
      where: {
        email: req.user.email,
      },
      data: {
        email: newEmail,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Email Change Successfull",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.query.id } });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    return res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};
