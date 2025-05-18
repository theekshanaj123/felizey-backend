const prisma = require("../config/db");

exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            image_url,
            banner_video_url,
            address,
            location,
            country,
            region,
            marker,
            timezone,
            start_date,
            start_time,
            end_date,
            end_time,
            category,
            tags,
            external_link,
            attendees_count,
            max_attendees,
            is_online,
            visibility,
            age_limit,
            parking,
            language,
            ticket_categories,
            ticket_status,
            event_type,
            event_privacy,
            accessibility,
            view_count,
        } = req.body;

        const user = await prisma.user.findUnique({
            where: {email: req.user.email},
        });

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        const requiredFields = [
            "title",
            "description",
            "image_url",
            "start_date",
            "start_time",
            "end_date",
            "end_time",
            "category",
            "location",
            "country",
            "timezone",
            "is_online",
            "visibility",
            "event_type",
            "event_privacy",
            "accessibility",
            "ticket_status"
        ];

        for (const field of requiredFields) {
            if(req.body[field] === undefined || req.body[field] === null || req.body[field] === ""){
                return res.status(500).json({
                   message:`${field} is requird.`
                });
            }
        }

        const userId = user.id;

        const event = await prisma.event.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                title,
                description,
                image_url,
                banner_video_url,
                address,
                location,
                country,
                region,
                marker,
                timezone,
                start_date: start_date,
                start_time: start_time,
                end_date: end_date,
                end_time: end_time,
                category,
                tags,
                external_link,
                attendees_count,
                max_attendees,
                is_online,
                visibility,
                age_limit,
                parking,
                language,
                ticket_categories,
                ticket_status,
                event_type,
                event_privacy,
                accessibility,
                view_count,
            },
        });

        const createdTickets = [];

        for (const ticket of ticket_categories) {
            const newTicket = await prisma.ticket.create({
                data: {
                    event: {
                        connect: {
                            id: event.id,
                        },
                    },
                    type: ticket.type,
                    price: ticket.price,
                    quantity_available: parseInt(ticket.qty_available),
                },
            });

            createdTickets.push(newTicket);
        }

        return res.status(200).json({
            status: true,
            EventData: event,
            Ticketdata: createdTickets,
            message: `Event Created.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({message: error.message});
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const {
            id,
            title,
            description,
            image_url,
            banner_video_url,
            address,
            location,
            country,
            region,
            marker,
            timezone,
            start_date,
            start_time,
            end_date,
            end_time,
            category,
            tags,
            external_link,
            attendees_count,
            max_attendees,
            is_online,
            visibility,
            age_limit,
            parking,
            language,
            ticket_categories,
            ticket_status,
            event_type,
            event_privacy,
            accessibility,
            view_count,
        } = req.body;

        const user = await prisma.user.findUnique({
            where: {email: req.user.email},
        });

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        const requiredFields = [
            "id",
            "title",
            "description",
            "image_url",
            "banner_video_url",
            "address",
            "location",
            "country",
            "region",
            "marker",
            "timezone",
            "start_date",
            "start_time",
            "end_date",
            "end_time",
            "category",
            "tags",
            "external_link",
            "attendees_count",
            "max_attendees",
            "is_online",
            "visibility",
            "age_limit",
            "parking",
            "language",
            "ticket_categories",
            "ticket_status",
            "event_type",
            "event_privacy",
            "accessibility",
            "view_count",
        ];

        for (const field of requiredFields) {
            if (
                req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ""
            ) {
                return res.status(400).json({message: `${field} is required.`});
            }
        }

        // Update the event
        const updatedEvent = await prisma.event.update({
            where: {id},
            data: {
                title,
                description,
                image_url,
                banner_video_url,
                address,
                location,
                country,
                region,
                marker,
                timezone,
                start_date,
                start_time,
                end_date,
                end_time,
                category,
                tags,
                external_link,
                attendees_count,
                max_attendees,
                is_online,
                visibility,
                age_limit,
                parking,
                language,
                ticket_status,
                event_type,
                event_privacy,
                accessibility,
                view_count,
            },
        });

        // Delete existing tickets (optional: depends on your design)
        await prisma.ticket.deleteMany({
            where: {
                eventId: id,
            },
        });

        // Recreate ticket categories
        const createdTickets = [];
        for (const ticket of ticket_categories) {
            const newTicket = await prisma.ticket.create({
                data: {
                    event: {
                        connect: {
                            id: updatedEvent.id,
                        },
                    },
                    type: ticket.type,
                    price: ticket.price,
                    quantity_available: parseInt(ticket.qty_available),
                },
            });

            createdTickets.push(newTicket);
        }

        return res.status(200).json({
            status: true,
            EventData: updatedEvent,
            Ticketdata: createdTickets,
            message: "Event Updated Successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const {id} = req.body;

        if (!id) {
            return res.status(400).json({message: "Event ID is required."});
        }

        const user = await prisma.user.findUnique({
            where: {email: req.user.email},
        });

        if (!user) {
            return res.status(400).json({message: "User Not Found."});
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: {
                id: id, // Ensure the 'id' is passed here
            },
        });

        if (!event) {
            return res.status(404).json({message: "Event Not Found."});
        }

        // Delete associated tickets
        await prisma.ticket.deleteMany({
            where: {
                eventId: id,
            },
        });

        // Delete the event
        await prisma.event.delete({
            where: {
                id: id,
            },
        });

        return res.status(200).json({
            status: true,
            message: "Event Deleted Successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.fetchEventsByCategory = async (req, res) => {
    try {
        const {category} = req.body;

        if (!category) {
            return res.status(400).json({message: "Category is required."});
        }


        const events = await prisma.event.findMany({
            where: {
                category: {
                    equals: category,
                    mode: "insensitive",
                },
                visibility: true,
            },
        });

        return res.status(200).json({
            status: true,
            data: events,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.fetchRandomizedEvents = async (req, res) => {
    try {

        const events = await prisma.event.findMany({
            where: {
                visibility: true,
            }
        });

        for (let i = events.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [events[i], events[j]] = [events[j], events[i]];
        }

        return res.status(200).json({
            status: true,
            data: events,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.fetchEventsAdvanced = async (req, res) => {
    try {
        const {title, category, country, skip} = req.query;

        const filters = {};

        if (title) {
            filters.title = {contains: title, mode: "insensitive"};
        }

        if (category) {
            filters.category = {equals: category, mode: "insensitive"};
        }

        if (country) {
            filters.country = {equals: country, mode: "insensitive"};
        }

        filters.visibility = true;

        const events = await prisma.event.findMany({
            where: filters,
            orderBy: {
                created_at: "desc",
            },
            // take: 5,
            // skip: parseInt(skip),
        });

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {firstName: {contains: title, mode: "insensitive"}},
                    {lastName: {contains: title, mode: "insensitive"}}
                ]
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return res.status(200).json({
            status: true,
            data: {
                event: events,
                user: users
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.fetchEventsByUser = async (req, res) => {
    try {
        const {userId} = req.params;

        if (!userId) {
            return res.status(400).json({message: "User ID is required."});
        }

        const events = await prisma.event.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return res.status(200).json({
            status: true,
            data: events,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.fetchEventsById = async (req, res) => {
    try {
        const {eventId} = req.params;

        if (!eventId) {
            return res.status(400).json({message: "Event ID is required."});
        }

        const events = await prisma.event.findUnique({
            where: {
                id: eventId,
            }
        });

        const isUserView = await prisma.user_View_Count.findFirst({
            where: {
                event_id: eventId,
                user_id: req.user.id,
            }
        });

        if (!isUserView) {
            await prisma.user_View_Count.create({
                data: {
                    user: {
                        connect: {
                            id: req.user.id
                        }
                    },
                    event: {
                        connect: {
                            id: eventId
                        }
                    }
                }
            })
        }

        return res.status(200).json({
            status: true,
            data: events,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
};

exports.fetchAllEvents = async (req, res) => {
    try {

        const events = await prisma.event.findMany();

        return res.status(200).json({
            status: true,
            message: "Success",
            data: events,
        })

    } catch (e) {
        return res.status(500).json({
            error: e?.message,
        });
    }
}

exports.fetchLetestEvents = async (req, res) => {
    try {

        const events = await prisma.event.findMany({
            orderBy: {
                created_at: 'desc',
            }
        })

        return res.status(200).json({
            status: true,
            message: "Success",
            data: events
        })

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: e.message
        });
    }
};
