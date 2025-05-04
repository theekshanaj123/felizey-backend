const prisma = require("../config/db");

exports.scanTicket = async (req, res) => {
    try {

        const {code} = req.params;

        if(!code){
            return res.status(500).json({
                message : "QR Code Missing."
            });
        }

        const ticket = await prisma.order_Item.findUnique({where:{qr : code}});

        if(!ticket){
            return res.status(500).json({
                message: "Ticket Not Found."
            });
        }

        return res.status(200).json({
            status : true,
            message : "Success.",
            data : ticket
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}