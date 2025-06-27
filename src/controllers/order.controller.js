const prisma = require("../config/db");
// const Stripe = require('stripe');
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const QRCode = require("qrcode");

// exports.createOrder = async (req, res) => {
//     try {
//
//         const {userId, items, categories} = req.body;
//
//         const lineItems = items.map((item) => ({
//             price_data: {
//                 currency: item.currency,
//                 product_data: {
//                     name: `Ticket: ${item.ticketId}`,
//                 },
//                 unit_amount: item.priceEach,
//             },
//             quantity: items?.length,
//         }));
//
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             success_url: `https://yourfrontend.com/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `https://yourfrontend.com/cancel`,
//             metadata: {
//                 userId,
//                 categories: categories,
//                 items: JSON.stringify(items),
//             },
//         });
//
//         return res.status(200).json({id: session.id});
//
//     } catch (e) {
//         return res.status(500).json({
//             message: e.message
//         });
//     }
// }

exports.getOrders = async (req, res) => {
    try {

        const order = await prisma.order.findMany();

        return res.status(200).json(
            {
                status: true,
                order: order

            }
        );

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}