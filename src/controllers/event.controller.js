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
            // price,
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

        if (!title) return res.status(400).json({message: "Title is required."});
        if (!description)
            return res.status(400).json({message: "Description is required."});
        if (!image_url)
            return res.status(400).json({message: "Image URL is required."});
        // if (!banner_video_url)
        //   return res.status(400).json({ message: "Banner video URL is required." });
        if (!address)
            return res.status(400).json({message: "Address is required."});
        // if (!location)
        //   return res.status(400).json({ message: "Location is required." });
        if (!country)
            return res.status(400).json({message: "Country is required."});
        if (!region)
            return res.status(400).json({message: "Region is required."});
        if (!marker)
            return res.status(400).json({message: "Marker is required."});
        if (!timezone)
            return res.status(400).json({message: "Timezone is required."});
        if (!start_date)
            return res.status(400).json({message: "Start date is required."});
        if (!start_time)
            return res.status(400).json({message: "Start time is required."});
        if (!end_date)
            return res.status(400).json({message: "End date is required."});
        if (!end_time)
            return res.status(400).json({message: "End time is required."});
        if (!category)
            return res.status(400).json({message: "Category is required."});
        // if (!tags) return res.status(400).json({ message: "Tags are required." });
        // if (!external_link)
        //   return res.status(400).json({ message: "External link is required." });
        // if (attendees_count === undefined)
        //     return res.status(400).json({message: "Attendees count is required."});
        // if (max_attendees === undefined)
        //     return res.status(400).json({message: "Max attendees is required."});
        if (is_online === undefined)
            return res.status(400).json({message: "Online status is required."});
        if (visibility === undefined)
            return res.status(400).json({message: "Visibility is required."});
        if (!age_limit)
            return res.status(400).json({message: "Age limit is required."});
        if (parking === undefined)
            return res.status(400).json({message: "Parking info is required."});
        if (!language)
            return res.status(400).json({message: "Language is required."});
        if (!ticket_categories || ticket_categories.length === 0)
            return res
                .status(400)
                .json({message: "At least one ticket category is required."});
        // if (!price) return res.status(400).json({ message: "Price is required." });
        if (ticket_status === undefined)
            return res.status(400).json({message: "Ticket status is required."});
        if (!event_type)
            return res.status(400).json({message: "Event type is required."});
        if (!event_privacy)
            return res.status(400).json({message: "Event privacy is required."});
        // if (!accessibility)
        //   return res.status(400).json({ message: "Accessibility is required." });
        if (view_count === undefined)
            return res.status(400).json({message: "View count is required."});

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
                price,
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
            price,
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
            "price",
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
                price,
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
            filters.title = {equals: title, mode: "insensitive"};
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
            take: 5,
            skip: parseInt(skip),
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

        const events = await prisma.event.findMany({
            where: {
                id: eventId,
            }
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
