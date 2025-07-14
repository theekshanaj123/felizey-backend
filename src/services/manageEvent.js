const manageCurrency = require('./currencyConverter');
const prisma = require("../config/db");

async function filterEvent(toCurrency, event) {
    if (!event) return null;

    const parsePrice = (priceStr) => {
        const cleaned = priceStr?.toString().replace(/,/g, '') || '0';
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    };

    let ticketCategories = [];

    try {
        ticketCategories = await Promise.all(
            event.ticket_categories.map(async (category) => {
                if (!category || !category?.price || !category?.currency) {
                    console.warn('Invalid ticket category:', category);
                    return null;
                }

                const ticket = await prisma.ticket.findFirst(
                    {
                        where:{
                            eventId:event.id,
                            type:category.type
                        }
                    }
                )

                const originalPrice = parsePrice(category.price);

                try {
                    const result = await manageCurrency.convertEventResCurrency(
                        toCurrency,
                        category?.currency,
                        originalPrice
                    );

                    return {
                        type: category.type || '',
                        description: category.description || '',
                        qty: category.qty_available || 0,
                        qty_available: ticket.qty_available || 0,
                        original_price: category.price,
                        price: result.convertedAmount,
                        original_currency: category?.currency || "USD",
                        currency: result.to,
                        rate: result.rate,
                    };
                } catch (conversionError) {
                    console.error('Conversion error for category:', conversionError.message);
                    return {
                        conversionError: conversionError.message,
                    };
                }
            })
        );
    } catch (err) {
        console.error('Error processing ticket categories:', err.message);
    }

    return {
        id: event.id,
        user_id: event.user_id,
        title: event.title,
        description: event.description,
        image_url: event.image_url,
        banner_video_url: event.banner_video_url,
        address: event.address,
        location: event.location,
        country: event.country,
        region: event.region,
        marker: event.marker,
        timezone: event.timezone,
        start_date: event.start_date,
        start_time: event.start_time,
        end_date: event.end_date,
        end_time: event.end_time,
        category: event.category,
        tags: event.tags,
        external_link: event.external_link,
        attendees_count: event.attendees_count,
        max_attendees: event.max_attendees,
        is_online: event.is_online,
        visibility: event.visibility,
        age_limit: event.age_limit,
        parking: event.parking,
        language: event.language,
        ticket_categories: ticketCategories,
        ticket_status: event.ticket_status,
        event_type: event.event_type,
        event_privacy: event.event_privacy,
        accessibility: event.accessibility,
        view_count: event.view_count,
        created_at: event.created_at,
        startDateTime: event.startDateTime
    };
}

module.exports = filterEvent;