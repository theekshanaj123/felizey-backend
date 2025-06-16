const prisma = require("../config/db");
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const QRCode = require("qrcode");

exports.createOrder = async (req, res) => {
    try {

        const {userId, items, categories} = req.body;

        const lineItems = items.map((item) => ({
            price_data: {
                currency: item.currency,
                product_data: {
                    name: `Ticket: ${item.ticketId}`,
                },
                unit_amount: item.priceEach,
            },
            quantity: items?.length,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `https://yourfrontend.com/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://yourfrontend.com/cancel`,
            metadata: {
                userId,
                categories: categories,
                items: JSON.stringify(items),
            },
        });

        return res.status(200).json({id: session.id});

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}

exports.completePayment = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.log(`Webhook signature verification failed.`);
            return res.status(500).json({
                message: "Webhook signature verification failed."
            });
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const userId = session.metadata.userId;
            const categories = session.metadata.categories;
            const items = JSON.parse(session.metadata.items);

            const ticketcount = await prisma.ticket.findUnique({where: {id: item.ticketId}});

            if (ticketcount.quantity_available > 0) {
                const total = items.reduce((acc, cur) => acc + cur.priceEach * cur.quantity, 0);

                const order = await prisma.order.create({
                    data: {
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                        total_amount: total,
                        status: "Processing",
                        categories: categories,
                    },
                });

                for (const item of items) {
                    const now = new Date();
                    const timestamp = now.toISOString().slice(11, 23).replace(/[:.]/g, ''); // HHmmssSSS
                    const final_qr_id = item.ticketId + userId + order.id + timestamp;
                    const qrData = await QRCode.toDataURL(final_qr_id);

                    await prisma.order_Item.create({
                        data: {
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                            ticket: {
                                connect: {
                                    id: item.ticketId,
                                },
                            },
                            order: {
                                connect: {
                                    id: order.id,
                                },
                            },
                            price_each: item.priceEach,
                            currency: item.currency,
                            qr: qrData,
                            isScaned: false,
                        },
                    });

                    await prisma.ticket.update({
                        where: {
                            id: item.ticketId,
                        },
                        data: {
                            quantity_available: {
                                decrement: 1,
                            },
                        }
                    });

                }
            }else {
                return res.status(500).json({
                    message: "Tickets Not Available."
                });
            }

        }

        return res.status(200).json({
            status: true,
            message: "Complete Order.",
        }).end();

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}