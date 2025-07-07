const prisma = require("../config/db");
const sendEmail = require("../services/emailSender");
const sanitizeUser = require('../services/sanitizerUser');
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
            data: sanitizeUser(updatedUser),
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
            data: sanitizeUser(user),
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
            data: sanitizeUser(updateUser),
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
            user: sanitizeUser(user),
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message});
    }
}

exports.deleteUserById = async (req, res) => {
    try {

        // const {id} = req.query;
        //
        // if (!id) {
        //     return res.status(500).json({
        //         message: "User Id Required.",
        //     });
        // }
        //
        // await prisma.user.delete({where: {id: id}});

        return res.status(200).json({
            status: true,
            // message : "User Deleted.",
            message: "Under Maintaining. Service Coming Soon.",
        });


    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message});
    }
}

exports.addNewRole = async (req, res) => {
    try {

        const {
            user_id,
            role,
            event_id,
        } = req.body;

        const asignerId = req.user.id;

        const resquredFields = [
            "user_id",
            "role",
            "event_id"
        ]

        for (const field of resquredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(400).json({
                    message: field + " is missing."
                });
            }
        }

        const isExist = await prisma.user_Role.findFirst(
            {
                where: {
                    user_id: user_id,
                    assigned_by: asignerId,
                    event_id: event_id
                }
            }
        )

        if (isExist) {
            return res.status(400).json({
                message: "This user already has a role in this event."
            });
        }

        const data = await prisma.user_Role.create(
            {
                data: {
                    user: {
                        connect: {
                            id: user_id
                        }
                    },
                    assigner: {
                        connect: {
                            id: asignerId
                        }
                    },
                    role: role,
                    event: {
                        connect: {
                            id: event_id
                        }
                    }
                }
            }
        );

        return res.status(200).json({
            status: true,
            message: "success",
        })

    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message});
    }
}

exports.getAllRoleByEventId = async (req, res) => {
    try {

        const {
            event_id,
        } = req.query;

        const resquredFields = [
            "event_id"
        ]

        for (const field of resquredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(400).json({
                    message: field + " is missing."
                });
            }
        }

        const isExist = await prisma.user_Role.findFirst(
            {
                where: {
                    event_id: event_id
                }
            }
        )

        if (isExist) {
            return res.status(200).json({
                status: true,
                message: "success",
                data: isExist
            })

        }
        return res.status(400).json({
            message: "User Roles Not Found!."
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message});
    }
}

exports.getUserRoleByEventId = async (req, res) => {
    try {

        const {
            event_id,
            user_id
        } = req.body;

        const resquredFields = [
            "event_id",
            "user_id"
        ]

        for (const field of resquredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(400).json({
                    message: field + " is missing."
                });
            }
        }

        const isExist = await prisma.user_Role.findFirst(
            {
                where: {
                    event_id: event_id,
                    user_id: user_id
                }
            }
        )

        if (isExist) {
            return res.status(200).json({
                status: true,
                message: "success",
                data: isExist
            })

        }
        return res.status(400).json({
            message: "User Roles Not Found!."
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message});
    }
}


exports.removeUserRoleByEventId = async (req, res) => {
    try {

        const {
            event_id,
            user_id
        } = req.query;

        const resquredFields = [
            "event_id",
            "user_id"
        ]

        for (const field of resquredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(400).json({
                    message: field + " is missing."
                });
            }
        }

        const isExist = await prisma.user_Role.findFirst(
            {
                where: {
                    event_id: event_id,
                    user_id: user_id
                }
            }
        )

        if (isExist) {

            // const data = await prisma.user_Role.delete(
            //     {
            //         where: {
            //             user_id: user_id,
            //             event_id: event_id
            //         }
            //     }
            // )

            return res.status(200).json({
                status: true,
                message: "In Progres..",
            })

        }
        return res.status(400).json({
            message: "User Roles Not Found!."
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({message: e.message});
    }
}