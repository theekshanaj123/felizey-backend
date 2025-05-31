const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require('../services/supabaseClient');

exports.register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name) {
            return res.status(400).json({message: "Name Is Required."});
        }
        if (!email) {
            return res.status(400).json({message: "Email Is Required."});
        }
        if (!password) {
            return res.status(400).json({message: "Password Is Required."});
        }

        const userExists = await prisma.user.findUnique({where: {email}});
        if (userExists) return res.status(400).json({message: "User already exists"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstName: name, email: email, password: hashedPassword, verified: false, isPrimium: false,
            },
        });

        const token = jwt.sign({
                id: user.id, email: user.email,
            }, process.env.JWT_SECRET, // { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "User created", user: {id: user.id, name: user.name, email: user.email, token: token},
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email) {
            return res.status(400).json({message: "Email is Required."});
        }

        if (!password) {
            return res.status(400).json({message: "Password is Required."});
        }

        const user = await prisma.user.findUnique({where: {email}});

        if (!user) {
            return res.status(400).json({message: "User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const token = jwt.sign({
                id: user.id, email: user.email,
            }, process.env.JWT_SECRET, // { expiresIn: "1h" }
        );

        return res.status(200).json({
            status: true, message: "Login successful", token: token, user: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.googleLogin = async (req, res) => {
    try {

        if (!req.body) {
            return res.status(500).json({
                message: `Somthing went wrong`
            });
        }

        const {googleId, email, givenName, name, photo} = req.body;

        const requiredData = ["googleId", "email", "givenName", "name", "photo"]

        for (const field of requiredData) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(500).json({
                    message: `${field} is required`
                });
            }
        }

        const googleUserExist = await prisma.google_Login.findUnique({where: {email: email}});

        if (!googleUserExist) {

            const user = await prisma.user.findUnique({where: {email: email}});

            if (!user) {

                const createUser = await prisma.user.create({
                    data: {
                        firstName: givenName, email: email, avatar_url: photo
                    }
                });

                const createGoogleUser = await prisma.google_Login.create({
                    data: {
                        googleId: googleId, user: {
                            connect: {
                                id: createUser.id
                            }
                        }, email: email, givenName: givenName, name: name, photo: photo
                    }
                });

                const token = jwt.sign({
                        id: createUser.id, email: createUser.email,
                    }, process.env.JWT_SECRET, // { expiresIn: "1h" }
                );

                return res.status(200).json({
                    status: true, message: "Success", user: createUser, token: token
                })

            }

            return res.status(500).json({
                message: "Email Already Registered."
            });

        }

        const user = await prisma.user.findUnique({where: {email: email}})

        const token = jwt.sign({
                id: user.id, email: user.email,
            }, process.env.JWT_SECRET, // { expiresIn: "1h" }
        );

        return res.status(200).json({
            status: true, message: "Login successful", token: token, user: user
        });

    } catch (e) {
        console.error(e)
        return res.status(500).json({
            message: e.message,
        });
    }
};