const prisma = require("../config/db");
const sendEmail = require("../services/emailSender");

exports.updateUserEmailSend = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {email: req.user.email},
        });

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        const sendMail = await sendEmail(
            req.user.email,
            "Change of Email",
            req.user.email
        );

        if (sendMail.error) {
            return res.status(400).json({message: sendMail.message});
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
        return res.status(400).json({message: error.message});
    }
};

exports.updateEmail = async (req, res) => {
    try {
        const {newEmail} = req.body;

        const user = await prisma.user.findUnique({
            where: {email: req.user.email},
        });

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        if (!newEmail) {
            return res.status(400).json({message: "New Email Required."});
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
        return res.status(400).json({message: error.message});
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({where: {id: req.query.id}});

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        return res.status(200).json({
            status: true,
            data: user,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({message: error.message});
    }
};

exports.updateUser = async (req, res) => {
    try {
        const {
            id,
            firstName,
            lastName,
            role,
            avatar_url,
            email,
            phoneNumber,
            bio,
            country,
            instagram,
            tiktok,
        } = req.body;

        const user = await prisma.user.findUnique({where: {id: id}});

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        if (!firstName) {
            return res.status(400).json({message: "First Name is Required."});
        }
        if (!lastName) {
            return res.status(400).json({message: "Last Name is Required."});
        }
        if (!role) {
            return res.status(400).json({message: "Role is Required."});
        }
        if (!avatar_url) {
            return res.status(400).json({message: "Avatar URL is Required."});
        }
        if (!email) {
            return res.status(400).json({message: "Email is Required."});
        }
        if (!phoneNumber) {
            return res.status(400).json({message: "Phone Number is Required."});
        }
        if (!bio) {
            return res.status(400).json({message: "Bio is Required."});
        }
        if (!country) {
            return res.status(400).json({message: "Country is Required."});
        }
        if (!instagram) {
            return res
                .status(400)
                .json({message: "Instagram Username is Required."});
        }
        if (!tiktok) {
            return res.status(400).json({message: "Tiktok Username is Required."});
        }

        const updateUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                firstName: firstName,
                lastName: lastName,
                role: role,
                avatar_url: avatar_url,
                email: email,
                phoneNumber: phoneNumber,
                bio: bio,
                country: country,
                instagram: instagram,
                tiktok: tiktok,
            },
        });

        return res.status(200).json({
            status: true,
            data: updateUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({message: error.message});
    }
};

exports.getUserByToken = async (req, res) => {
    try {

        const email = req.user.email;

        const user = await prisma.user.findUnique({where: {email: email}});

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        res.status(200).json({
            status: true,
            user: {
                id: user?.id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                role: user?.role,
                created_at: user?.created_at,
                avatar_url: user?.avatar_url,
                email: user?.email,
                verified: user?.verified,
                phoneNumber: user?.phoneNumber,
                bio: user?.bio,
                isPrimium: user?.isPrimium,
                country: user?.country,
                instagram: user?.instagram,
                tiktok: user?.tiktok,
            }
        });

    } catch
        (e) {
        console.error(error);
        return res.status(400).json({message: error.message});
    }
}
