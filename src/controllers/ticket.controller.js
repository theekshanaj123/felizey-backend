const prisma = require("../config/db");
const ticketExpiryQueue = require('../queues/ticketQueue');
const {use} = require("express/lib/application");
const QRCode = require("qrcode");

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

        const {event_id, ticketData, price, currency} = req.body;

        const customer = await stripe.customers.create();
        const ephemeralKey = await stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2024-06-20'}
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

            const ticketD = await prisma.ticket.findMany(
                {
                    where: {
                        eventId: event_id,
                        type: ticket.type
                    }
                }
            );

            if (ticket.qty_available === 0) {
                return res.status(400).json({message: ticket.type + " Tickets Not Available. Please Try Again."});
            }

            if (ticket.qty_available < ticketD.quantity_available) {
                return res.status(400).json({message: ticket.type + " Tickets Quantity Not Available. Please Try Again."});
            }

            if (ticket.qty_available === 1 || ticket.qty_available === ticketD.quantity_available) {
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


        return res.json({
            status: true,
            message: "success",
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        });
    } catch (error) {
        console.error(error); // Log full error for debugging
        res.status(500).json({error: error.message});
    }
};

exports.bookTicket = async (req, res) => {
    try {

        const {tickets, event_id, total_amount, payment_status, currency} = req.body;

        let totqty = 0;

        const order = await prisma.order.create({
            data: {
                user: {
                    connect: {
                        id: req.user.id,
                    },
                },
                event: {
                    connect: {
                        id: event_id
                    }
                },
                total_amount: total_amount,
                status: payment_status,
                categories: tickets,
            },
        });

        for (const ticket of tickets) {

            const ticketD = await prisma.ticket.findFirst(
                {
                    where: {
                        eventId: event_id,
                        type: ticket.type
                    }
                }
            );

            const ticketId = ticketD.id;

            if (activeJobs[ticketId]) {
                const jobId = activeJobs[ticketId];
                const job = await ticketExpiryQueue.getJob(jobId);
                if (job) await job.remove();
                delete activeJobs[ticketId];
                console.log("Session Destroyed : " + ticketId);
            }

            // Update DB status

            totqty = ticket.quantity;

            await prisma.ticket.update({
                where: {id: ticketId},
                data: {
                    quantity_available: {
                        decrement: ticket.quantity
                    },
                    status: ''
                },
            });

            for (let i = 1; i <= ticket.quantity; i++) {

                const now = new Date();
                const timestamp = now.toISOString().slice(11, 23).replace(/[:.]/g, ''); // HHmmssSSS
                const final_qr_id = ticketD.id + req.user.id + order.id + timestamp;
                const qrData = await QRCode.toDataURL(final_qr_id);

                await prisma.order_Item.create({
                    data: {
                        user: {
                            connect: {
                                id: req.user.id,
                            },
                        },
                        ticket: {
                            connect: {
                                id: ticketD.id,
                            },
                        },
                        order: {
                            connect: {
                                id: order.id,
                            },
                        },
                        event: {
                            connect: {
                                id: event_id
                            }
                        },
                        price_each: ticket.ticket_price,
                        currency: currency,
                        qr: qrData,
                        isScaned: false,
                        status: "",
                    },
                });

            }

        }

        return res.status(200).json({
            status: true,
            message: "success",
            booking_id:order.id,
            total_tickets: totqty
        });


    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: e.message,
        });
    }
};
