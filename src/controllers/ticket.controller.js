const prisma = require("../config/db");
const ticketExpiryQueue = require('../queues/ticketQueue');
const {use} = require("express/lib/application");

const stripe = require('stripe')(process.env.STRIPE_SK_KEY);

exports.scanTicket = async (req, res) => {
    try {

        const {code} = req.params;

        if (!code) {
            return res.status(500).json({
                message: "QR Code Missing."
            });
        }

        const ticket = await prisma.order_Item.findUnique({where: {qr: code}});

        if (!ticket) {
            return res.status(500).json({
                message: "Ticket Not Found."
            });
        }

        if (ticket?.isScaned) {
            return res.status(500).json({
                status: false,
                message: "Ticket Already Scaned.",
                data: ticket
            });
        } else {

            const updateStatus = await prisma.order_Item.update(
                {
                    where: {
                        id: ticket.id
                    },
                    data: {
                        isScaned: true
                    }
                }
            );

            return res.status(200).json({
                status: true,
                message: "Success.",
                data: ticket
            });
        }

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

exports.scanTicketByEmailOrMobile = async (req, res) => {
    try {

        const {mobile, email, event_id} = req.body;

        if (!event_id) {
            return res.status(400).json({
                message: "Event Id Missing."
            });
        }

        if (mobile) {
            const user = await prisma.user.findFirst(
                {
                    where: {
                        phoneNumber: mobile
                    }
                }
            );

            if (user) {
                const ticket = await prisma.order_Item.findUnique({where: {user_id: user.id, event_id: event_id}});

                if (!ticket) {
                    return res.status(400).json({
                        message: "User doesn't have This Event Ticket."
                    });
                }

                if (ticket?.isScaned) {
                    return res.status(400).json({
                        status: false,
                        message: "Ticket Already Scaned.",
                        data: ticket
                    });
                } else {

                    const updateStatus = await prisma.order_Item.update(
                        {
                            where: {
                                id: ticket.id
                            },
                            data: {
                                isScaned: true
                            }
                        }
                    );

                    return res.status(200).json({
                        status: true,
                        message: "Success.",
                        data: ticket
                    });
                }
            } else {
                return res.status(400).json({
                    message: "Mobile Not Found.",
                });
            }
        }

        if (email) {
            const user = await prisma.user.findFirst(
                {
                    where: {
                        email: email
                    }
                }
            );

            if (user) {
                const ticket = await prisma.order_Item.findUnique({where: {user_id: user.id, event_id: event_id}});

                if (!ticket) {
                    return res.status(400).json({
                        message: "User doesn't have This Event Ticket."
                    });
                }

                if (ticket?.isScaned) {
                    return res.status(400).json({
                        status: false,
                        message: "Ticket Already Scaned.",
                        data: ticket
                    });
                } else {

                    const updateStatus = await prisma.order_Item.update(
                        {
                            where: {
                                id: ticket.id
                            },
                            data: {
                                isScaned: true
                            }
                        }
                    );

                    return res.status(200).json({
                        status: true,
                        message: "Success.",
                        data: ticket
                    });
                }
            } else {
                return res.status(400).json({
                    message: "Mobile Not Found.",
                });
            }
        }


    } catch (e) {
        return res.status(400).json({
            message: e.message,
        });
    }
}

exports.getTicketByEvent = async (req, res) => {
    try {

        const {eventId} = req.params;

        if (!eventId) {
            return res.status(500).json({error: "Event Id required."});
        }

        const tickets = await prisma.ticket.findMany({
            where: {
                event: {
                    id: eventId,
                }
            }
        });

        return res.status(200).json({
            status: true,
            data: tickets
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

let activeJobs = {};

exports.createPaymentSession = async (req, res) => {
    try {

        const {price , currency} = req.body;

        const {event_id, ticketData} = req.body;
        const userId = req.user.id;

        const customer = await stripe.customers.create();
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2024-06-20' }
        );
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price,
            currency: currency,
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        for (const ticket of ticketData) {
            if (ticket.qty_available === 0) {
                return res.status(400).json({message: ticket.type + " Tickets Not Available. Please Try Again."});
            }

            if (ticket.qty_available === 1) {
                const ticketStatus = await prisma.ticket.findFirst({
                    where: {
                        eventId: event_id,
                        type: ticket.type,
                    }
                });

                if (ticketStatus.status === "Pending") {
                    return res.status(400).json({message: ticket.type + " Tickets Not Available. Please Try Again."});
                }

                if (ticketStatus) {
                    const updateTicket = await prisma.ticket.update(
                        {
                            where: {
                                id: ticketStatus.id,
                            },
                            data: {
                                status: "Pending",
                            }
                        }
                    )

                    const ticketId = updateTicket.id;

                    const job = await ticketExpiryQueue.add(
                        {ticketId},
                        {delay: 5 * 60 * 1000} // 5 minutes
                    );

                    activeJobs[ticketId] = job.id;

                }
            }

            const ticketStatus = await prisma.ticket.findFirst({
                where: {
                    eventId: event_id,
                    type: ticket.type,
                }
            });

            if (ticketStatus.status === "Pending") {
                return res.status(400).json({message: ticket.type + " Tickets Not Available. Please Try Again."});
            }

        }


        return  res.json({
            status: true,
            message: "success",
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        });
    } catch (error) {
        console.error(error); // Log full error for debugging
        res.status(500).json({ error: error.message });
    }
};

exports.bookTicket = async (req, res) => {
    try {

        const {ticketId} = req.body;

        // Cancel expiry job if exists
        if (activeJobs[ticketId]) {
            const jobId = activeJobs[ticketId];
            const job = await ticketExpiryQueue.getJob(jobId);
            if (job) await job.remove();
            delete activeJobs[ticketId];
        }

        // Update DB status
        await prisma.ticket.update({
            where: {ticketId},
            data: {status: 'Paid'},
        });

        return res.status(200).json({
            status: true,
            message: "success",
        });


    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};
