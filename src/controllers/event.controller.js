const prisma = require("../config/db");
const manageEvent = require('../services/manageEvent');
const getIp = require('../services/getIp');
const {startOfDay, endOfDay, startOfWeek, startOfMonth} = require("date-fns");

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
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(500).json({
                    message: `${field} is requird.`
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
            take: 5,
            skip: parseInt(skip),
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

exports.fetchEventsByTicketId = async (req, res) => {
    try {
        const {ticketId} = req.params;

        if (!ticketId) {
            return res.status(500).json({message: "Ticket ID is required."});
        }

        const events = await prisma.ticket.findUnique({
            where: {
                id: ticketId
            }
        });

        const eventsData = await prisma.event.findUnique({
            where: {
                id: events.eventId,
            }
        });

        return res.status(200).json({
            status: true,
            data: eventsData,
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

exports.fetchPopularEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            include: {
                tickets: true,
                User_View_Count: true,
                favorite: true,
            }
        });

        const eventsWithScore = events.map((event) => {
            const viewCount = event.User_View_Count.length; // total unique views
            const likeCount = event.favorite.length; // total favorites = likes
            const purchaseCount = event.tickets.filter(t => t.isPurchased).length; // assuming 'isPurchased' is a field

            const popularity_score = (viewCount * 0.5) + (likeCount * 2) + (purchaseCount * 1);

            return {
                ...event,
                popularity_score,
                analytics: {
                    views: viewCount,
                    likes: likeCount,
                    purchases: purchaseCount
                }
            };
        });

        const sortedEvents = eventsWithScore.sort((a, b) => b.popularity_score - a.popularity_score);

        // Limit to top 10
        const mostPopularEvents = sortedEvents.slice(0, 10);

        return res.status(200).json({
            status: true,
            message: "Success",
            data: mostPopularEvents
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            status: false,
            message: e.message
        });
    }

};

exports.addNewReview = async (req, res) => {

    try {

        const {event_id, review} = req.body;
        const user_id = req.user.id;

        const reqiredFields = [
            "event_id",
            "review"
        ];

        for (const field of reqiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                res.status(500).json({
                    message: `${field} is required.`
                });
            }
        }

        const userReview = await prisma.user_Review.create({
            data: {
                user: {
                    connect: {
                        id: user_id
                    }
                },
                event: {
                    connect: {
                        id: event_id
                    }
                },
                review: review
            }
        });

        return res.status(200).json({
            status: true,
            mesaage: "Review Added.",
            data: userReview
        });


    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
};

exports.fetchNearbyEvent = async (req, res) => {
    try {

        const userId = req.user.id;

        const events = await prisma.event.findMany({
            where: {user_id: userId}
        });

        const eventsWithDateTime = events.map(event => {
            const [year, month, day] = event.start_date.split('-');
            const [hours, minutes] = event.start_time.split(':');
            const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

            return {
                ...event,
                startDateTime: dateTime,
            };
        });

        const now = new Date();
        const upcomingEvents = eventsWithDateTime.filter(e => e.startDateTime > now);
        upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

        const ipDate = await getIp(req);
        const toCurrency = ipDate.data.currency;

        try {
            const processedEvents = await Promise.all(
                upcomingEvents.map(event => manageEvent(toCurrency, event))
            );

            return res.json({
                status: true,
                data: processedEvents
            });

        } catch (err) {
            console.error('Error processing events:', err.message);
            return res.status(500).json({
                status: false,
                error: 'Internal server error'
            });
        }

    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
};

exports.fetchTotalEarning = async (req, res) => {
    try {

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const weekStart = startOfWeek(new Date(), {weekStartsOn: 1});
        const monthStart = startOfMonth(new Date());

        const {userId} = req.params;

        if (!userId) {
            return res.status(500).json({message: 'User ID is required'});
        }

        const [todayTotal, weekTotal, monthTotal] = await Promise.all([
            prisma.order.aggregate({
                _sum: {
                    total_amount: true
                },
                where: {
                    user_id: userId,
                    created_at: {gte: todayStart, lte: todayEnd},
                },
            }),

            prisma.order.aggregate({
                _sum: {
                    total_amount: true
                },
                where: {
                    user_id: userId,
                    created_at: {gte: weekStart},
                },
            }),

            prisma.order.aggregate({
                _sum: {
                    total_amount: true
                },
                where: {
                    user_id: userId,
                    created_at: {gte: monthStart},
                },
            }),
        ]);

        return res.status(200).json({
            status: true,
            data: {
                today: todayTotal._sum.total_amount || 0,
                week: weekTotal._sum.total_amount || 0,
                month: monthTotal._sum.total_amount || 0,
            }
        });

    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
};

exports.fetchTotalCount = async (req, res) => {
    try {

        const {eventId} = req.params;

        const userId = req.user.id;

        if (!userId) {
            return res.status(500).json({message: 'User ID is required'});
        }

        if (!eventId) {
            return res.status(500).json({message: 'Event ID is required'});
        }

        const [allticketsCount, soldTickets, scanedTickets, refunds] = await Promise.all([

            prisma.ticket.aggregate({
                _sum: {
                    quantity_available: true
                },
                where: {
                    eventId: eventId
                }
            }),

            prisma.order_Item.aggregate({
                _count: true,
                where: {
                    user_id: userId,
                    event_id: eventId,
                    status: "Paid"
                },
            }),

            prisma.order_Item.aggregate({
                _count: true,
                where: {
                    user_id: userId,
                    event_id: eventId,
                    isScaned: true
                },
            }),

            prisma.order.aggregate({
                _count: true,
                where: {
                    user_id: userId,
                    event_id: eventId,
                    status: "refund"
                },
            }),
        ]);

        return res.status(200).json({
            status: true,
            data: {
                allTicketsCount: allticketsCount._sum.quantity_available || 0,
                soldTickets: soldTickets._count || 0,
                scanedTickets: scanedTickets._count || 0,
                refunds: refunds._count || 0,
            }
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}

exports.fetchSellingTicketsCountByCategory = async (req, res) => {
    try {

        const {eventId, category} = req.body;

        const userId = req.user.id;

        if (!userId) {
            return res.status(500).json({message: 'User ID is required'});
        }

        if (!eventId) {
            return res.status(500).json({message: 'Event ID is required'});
        }

        if (!Array.isArray(category)) {
            return res.status(500).json({message: 'category is not an array'});
        }

        const result = await Promise.all(
            category.map(async (cate) => {
                const count = await prisma.order_Item.aggregate({
                    _count: true,
                    where: {
                        event_id: eventId,
                        ticket: {
                            type: cate
                        }
                    }
                });

                return {
                    category: cate,
                    count: count._count
                };
            })
        );

        return res.status(200).json({
            status: true,
            data: result?.[0]
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}


