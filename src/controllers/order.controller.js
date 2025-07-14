const prisma = require("../config/db");
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