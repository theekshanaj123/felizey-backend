const prisma = require("../config/db");

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

exports.updateStatus = async (req, res) => {
    try {

        const {event_id, ticketData} = req.body;
        const userId = req.user.id;

        for (const ticket of ticketData) {
            if (ticket.qty_available < 0) {
                return res.status(400).json({message: ticket.type + " Tickets Not Available. Please Try Again."});
            } else {
                if(ticket.qty_available === 1){
                    const ticketStatus = await prisma.ticket.findUnique()
                }
            }
        }


    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
};