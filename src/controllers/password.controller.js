const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const sendEmail = require("../services/emailSender");
const supabase = require("../services/supabaseClient");

exports.sendPasswordResetEmail = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(req.user.email);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // const sendMail = await sendEmail(
    //   req.user.email,
    //   "Change of Password",
    //   req.user.email
    // );

    // if (sendMail.error) {
    //   return res.status(400).json({ message: sendMail.message });
    // }

    return res.status(200).json({
      status: true,
      message: `Password reset email sent to ${req.user.email}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is Required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatePassword = await prisma.user.update({
      where: {
        email: req.user.email,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Password Update Successfull.",
      data: updatePassword,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};
