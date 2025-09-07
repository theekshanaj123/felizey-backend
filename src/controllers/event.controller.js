const prisma = require("../config/db");
const manageEvent = require("../services/manageEvent");
const getIp = require("../services/getIp");
const { startOfDay, endOfDay, startOfWeek, startOfMonth } = require("date-fns");
const { convertEventResCurrency } = require("../services/currencyConverter");
const sendEmail = require("../services/emailSender");

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
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
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
      "ticket_status",
    ];

    for (const field of requiredFields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      ) {
        return res.status(500).json({
          message: `${field} is requird.`,
        });
      }
    }

    const userId = user.id;

    const eventData = await prisma.event.create({
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
              id: eventData.id,
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
      data: eventData,
      Ticketdata: createdTickets,
      message: `Event Created.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
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
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    const requiredFields = [
      "id",
      "title",
      "description",
      "image_url",
      // "banner_video_url",
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
      // "tags",
      // "external_link",
      "attendees_count",
      "max_attendees",
      "is_online",
      "visibility",
      "age_limit",
      "parking",
      // "language",
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
        return res.status(400).json({ message: `${field} is required.` });
      }
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
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
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Event ID is required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found." });
    }

    const event = await prisma.event.findFirst({
      where: {
        id: id,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event Not Found." });
    }

    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New Message 2</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.p {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.d {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
@media only screen and (max-width:600px) {.bg { padding-right:0px!important } .bf { padding-left:0px!important } .be { padding-left:5px!important }  *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important }  .bb p { } .ba p { }  h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left }       .b td a { font-size:12px!important }  .bb p, .bb a { font-size:16px!important } .ba p, .ba a { font-size:14px!important }  .w, .w h1, .w h2, .w h3, .w h4, .w h5, .w h6 { text-align:center!important }     .v .rollover:hover .rollover-second, .w .rollover:hover .rollover-second, .x .rollover:hover .rollover-second { display:inline!important }  .u { display:inline-table }    .o, .o .p, .q, .q td, .b.a { display:inline-block!important }  .i table, .j table, .k table, .i, .k, .j { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important }        .b td { width:1%!important } table.a, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#FAFAFA"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#fafafa"></v:fill>
			</v:background>
		<![endif]-->
   <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table cellpadding="0" cellspacing="0" align="center" class="i" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" class="bb" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr>
              <td align="left" style="Margin:0;padding-top:30px;padding-right:20px;padding-bottom:30px;padding-left:20px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://fbkkwiz.stripocdn.email/content/guids/CABINET_67e080d830d87c17802bd9b4fe1c0912/images/55191618237638326.png" alt="" width="100" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-bottom:10px"><h1 class="w" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:46px;font-style:normal;font-weight:bold;line-height:46px;color:#333333">Event Delete!.</h1></td>
                     </tr>
                     <tr>
                      <td align="center" class="bg bf" style="Margin:0;padding-top:5px;padding-right:40px;padding-bottom:5px;padding-left:40px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px">An event previously managed by an organizer has been removed from the Felizey Event Management System. This email serves to inform you of this action. If you have any questions or require further details, please reach out to Organizer for more details.</p></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:20px;Margin:0;font-size:0">
                       <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" class="u" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:none;height:0px;width:100%;margin:0px"></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="left" class="be" style="padding:0;Margin:0;padding-left:50px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:35px;letter-spacing:0;color:#333333;font-size:14px"><strong>Organizer - </strong>${
                        user.firstName
                      } ${
      user.lastName
    }</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:35px;letter-spacing:0;color:#333333;font-size:14px"><strong>Event - </strong>${
      event.title
    }*</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:35px;letter-spacing:0;color:#333333;font-size:14px"><strong>Deleted Date - </strong>${new Date().getDate()}</p></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:20px;Margin:0;font-size:0">
                       <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" class="u" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td style="padding:0;Margin:0;height:0px;width:100%;margin:0px;border-bottom:1px solid #cccccc;background:none"></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" align="center" class="k" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table align="center" cellpadding="0" cellspacing="0" class="ba" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:640px" role="none">
             <tr>
              <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:20px;padding-bottom:20px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:600px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px;font-size:0">
                       <table cellpadding="0" cellspacing="0" class="a q" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><img title="Facebook" src="https://fbkkwiz.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png" alt="Fb" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><img title="X" src="https://fbkkwiz.stripocdn.email/content/assets/img/social-icons/logo-black/x-logo-black.png" alt="X" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><img title="Instagram" src="https://fbkkwiz.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png" alt="Inst" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                          <td align="center" valign="top" style="padding:0;Margin:0"><img title="Youtube" src="https://fbkkwiz.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png" alt="Yt" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;margin:0"></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-bottom:35px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#333333;font-size:12px">Style Casual&nbsp;© 2021 Style Casual, Inc. All Rights Reserved.</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#333333;font-size:12px">4562 Hazy Panda Limits, Chair Crossing, Kentucky, US, 607898</p></td>
                     </tr>
                     <tr>
                      <td style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" width="100%" class="b" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr class="links">
                          <td align="center" valign="top" width="33.33%" style="Margin:0;border:0;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Visit Us </a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" style="Margin:0;border:0;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;border-left:1px solid #cccccc">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Privacy Policy</a>
                           </div></td>
                          <td align="center" valign="top" width="33.33%" style="Margin:0;border:0;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;border-left:1px solid #cccccc">
                           <div style="vertical-align:middle;display:block"><a target="_blank" href="" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#999999;font-size:12px">Terms of Use</a>
                           </div></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>`;

    const sendMail = await sendEmail(
      process.env.GMAIL_USER,
      "Event Delete",
      html
    );

    if (sendMail.error) {
      return res.status(400).json({ message: sendMail.message });
    }

    await prisma.event.update({
      where: { id: id },
      data: { status: "deactive" },
    });

    return res.status(200).json({
      status: true,
      message: "Event Deleted Successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchEventsByCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
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

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchRandomizedEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        visibility: true,
      },
    });

    for (let i = events.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [events[i], events[j]] = [events[j], events[i]];
    }

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchEventsAdvanced = async (req, res) => {
  try {
    const { title, category, country, skip } = req.query;

    const filters = {};

    if (title) {
      filters.title = { contains: title, mode: "insensitive" };
    }

    if (category) {
      filters.category = { equals: category, mode: "insensitive" };
    }

    if (country) {
      filters.country = { equals: country, mode: "insensitive" };
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
          { firstName: { contains: title, mode: "insensitive" } },
          { lastName: { contains: title, mode: "insensitive" } },
        ],
      },
      orderBy: {
        created_at: "desc",
      },
      take: 5,
      skip: parseInt(skip),
    });

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      event: processedEvents,
      user: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchEventsAdvancedByUser = async (req, res) => {
  try {
    const { title, skip } = req.query;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: title, mode: "insensitive" } },
          { lastName: { contains: title, mode: "insensitive" } },
        ],
      },
      orderBy: {
        created_at: "desc",
      },
      take: 5,
      skip: parseInt(skip),
    });

    return res.status(200).json({
      status: true,
      user: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const events = await prisma.event.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      events.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchFutureEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const events = await prisma.event.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchEventsById = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required." });
    }

    const events = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (events) {
      const isUserView = await prisma.user_View_Count.findFirst({
        where: {
          event_id: eventId,
          user_id: req.user.id,
        },
      });

      if (!isUserView) {
        await prisma.user_View_Count.create({
          data: {
            user: {
              connect: {
                id: req.user.id,
              },
            },
            event: {
              connect: {
                id: eventId,
              },
            },
          },
        });
      }

      const ipDate = await getIp(req);
      const toCurrency = ipDate?.data?.currency;

      const processedEvents = await manageEvent(toCurrency, events);

      return res.status(200).json({
        status: true,
        data: processedEvents,
      });
    } else {
      return res.status(500).json({ message: "Event Not Found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchEventsByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(500).json({ message: "Ticket ID is required." });
    }

    const events = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    const eventsData = await prisma.event.findUnique({
      where: {
        id: events.eventId,
      },
    });

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await manageEvent(toCurrency, eventsData);

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (e) {
    return res.status(500).json({
      error: e?.message,
    });
  }
};

exports.fetchLetestEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: e.message,
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
      },
    });

    const eventsWithScore = events.map((event) => {
      const viewCount = event.User_View_Count.length; // total unique views
      const likeCount = event.favorite.length; // total favorites = likes
      const purchaseCount = event.tickets.filter((t) => t.isPurchased).length; // assuming 'isPurchased' is a field

      const popularity_score =
        viewCount * 0.5 + likeCount * 2 + purchaseCount * 1;

      return {
        ...event,
        popularity_score,
        analytics: {
          views: viewCount,
          likes: likeCount,
          purchases: purchaseCount,
        },
      };
    });

    const sortedEvents = eventsWithScore.sort(
      (a, b) => b.popularity_score - a.popularity_score
    );

    // Limit to top 10
    const mostPopularEvents = sortedEvents.slice(0, 10);

    const eventsWithDateTime = mostPopularEvents.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    const processedEvents = await Promise.all(
      upcomingEvents.map((event) => manageEvent(toCurrency, event))
    );

    return res.status(200).json({
      status: true,
      data: processedEvents,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: false,
      message: e.message,
    });
  }
};

exports.addNewReview = async (req, res) => {
  try {
    const { event_id, review } = req.body;
    const user_id = req.user.id;

    const reqiredFields = ["event_id", "review"];

    for (const field of reqiredFields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      ) {
        res.status(500).json({
          message: `${field} is required.`,
        });
      }
    }

    const userReview = await prisma.user_Review.create({
      data: {
        user: {
          connect: {
            id: user_id,
          },
        },
        event: {
          connect: {
            id: event_id,
          },
        },
        review: review,
      },
    });

    return res.status(200).json({
      status: true,
      mesaage: "Review Added.",
      data: userReview,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

exports.fetchNearbyEvent = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await prisma.event.findMany({
      where: { user_id: userId },
    });

    const eventsWithDateTime = events.map((event) => {
      const [year, month, day] = event.start_date.split("-");
      const [hours, minutes] = event.start_time.split(":");
      const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      return {
        ...event,
        startDateTime: dateTime,
      };
    });

    const now = new Date();
    const upcomingEvents = eventsWithDateTime.filter(
      (e) => e.startDateTime > now
    );
    upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

    const ipDate = await getIp(req);
    const toCurrency = ipDate?.data?.currency;

    try {
      const processedEvents = await Promise.all(
        upcomingEvents.map((event) => manageEvent(toCurrency, event))
      );

      return res.status(200).json({
        status: true,
        data: processedEvents,
      });
    } catch (err) {
      console.error("Error processing events:", err.message);
      return res.status(500).json({
        status: false,
        error: "Internal server error",
      });
    }
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

exports.fetchTotalEarning = async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const monthStart = startOfMonth(new Date());

    const userId = req.user.id;
    let eventId = req.params.eventId;

    if (!eventId) {
      const events = await prisma.event.findMany({
        where: { user_id: userId },
      });

      const eventsWithDateTime = events.map((event) => {
        const [year, month, day] = event.start_date.split("-");
        const [hours, minutes] = event.start_time.split(":");
        const dateTime = new Date(
          Date.UTC(year, month - 1, day, hours, minutes)
        );

        return {
          ...event,
          startDateTime: dateTime,
        };
      });

      const now = new Date();
      const upcomingEvents = eventsWithDateTime.filter(
        (e) => e.startDateTime > now
      );
      upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

      eventId = upcomingEvents[0]?.id;
    }

    if (!userId) {
      return res.status(500).json({ message: "User ID is required" });
    }

    const [todayTotal, weekTotal, monthTotal] = await Promise.all([
      // Today
      prisma.$queryRaw`
                SELECT SUM(NULLIF(total_amount, '')::NUMERIC) AS total
                FROM "Order"
                WHERE user_id = ${userId}
                  AND event_id = ${eventId}
                  AND created_at BETWEEN ${todayStart} AND ${todayEnd}
            `,

      // Week
      prisma.$queryRaw`
                SELECT SUM(NULLIF(total_amount, '')::NUMERIC) AS total
                FROM "Order"
                WHERE user_id = ${userId}
                  AND event_id = ${eventId}
                  AND created_at >= ${weekStart}
            `,

      // Month
      prisma.$queryRaw`
                SELECT SUM(NULLIF(total_amount, '')::NUMERIC) AS total
                FROM "Order"
                WHERE user_id = ${userId}
                  AND event_id = ${eventId}
                  AND created_at >= ${monthStart}
            `,
    ]);

    return res.json({
      status: true,
      data: {
        today: Number(todayTotal[0]?.total) || 0,
        week: Number(weekTotal[0]?.total) || 0,
        month: Number(monthTotal[0]?.total) || 0,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: e.message,
    });
  }
};

exports.fetchTotalEventEarning = async (req, res) => {
  try {
    const userId = req.user.id;
    let eventId = req.params.eventId;

    if (!eventId) {
      const events = await prisma.event.findMany({
        where: { user_id: userId },
      });

      const eventsWithDateTime = events.map((event) => {
        const [year, month, day] = event.start_date.split("-");
        const [hours, minutes] = event.start_time.split(":");
        const dateTime = new Date(
          Date.UTC(year, month - 1, day, hours, minutes)
        );

        return {
          ...event,
          startDateTime: dateTime,
        };
      });

      const now = new Date();
      const upcomingEvents = eventsWithDateTime.filter(
        (e) => e.startDateTime > now
      );
      upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

      eventId = upcomingEvents[0]?.id;
    }

    if (!userId) {
      return res.status(500).json({ message: "User ID is required" });
    }

    const event = await prisma.event.findFirst({ where: { id: eventId } });

    const finalTicketData = [];

    for (const data of event.ticket_categories) {
      const json = {
        type: data.type,
        price: data.price,
        currency: data.currency,
        description: data.description,
        qty_available: data.qty_available,
        totalPrice: parseFloat(
          parseFloat(data.price) * parseFloat(data.qty_available)
        ),
      };
      finalTicketData.push(json);
    }

    return res.json({
      status: true,
      data: finalTicketData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: e.message,
    });
  }
};

// exports.fetchTotalEarning = async (req, res) => {
//     try {
//
//         const todayStart = startOfDay(new Date());
//         const todayEnd = endOfDay(new Date());
//         const weekStart = startOfWeek(new Date(), {weekStartsOn: 1});
//         const monthStart = startOfMonth(new Date());
//
//         const userId = req.user.id;
//         let eventId = req.params.eventId;
//
//         if (!eventId) {
//             const events = await prisma.event.findMany({
//                 where: {user_id: userId}
//             });
//
//             const eventsWithDateTime = events.map(event => {
//                 const [year, month, day] = event.start_date.split('-');
//                 const [hours, minutes] = event.start_time.split(':');
//                 const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
//
//                 return {
//                     ...event,
//                     startDateTime: dateTime,
//                 };
//             });
//
//             const now = new Date();
//             const upcomingEvents = eventsWithDateTime.filter(e => e.startDateTime > now);
//             upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);
//
//             eventId = upcomingEvents[0]?.id;
//
//         }
//
//         if (!userId) {
//             return res.status(500).json({message: 'User ID is required'});
//         }
//
//         const [todayTotal, weekTotal, monthTotal] = await Promise.all([
//             prisma.order.aggregate({
//                 _sum: {
//                     total_amount: true
//                 },
//                 where: {
//                     user_id: userId,
//                     event_id: eventId,
//                     created_at: {gte: todayStart, lte: todayEnd},
//                 },
//             }),
//
//             prisma.order.aggregate({
//                 _sum: {
//                     total_amount: true
//                 },
//                 where: {
//                     user_id: userId,
//                     event_id: eventId,
//                     created_at: {gte: weekStart},
//                 },
//             }),
//
//             prisma.order.aggregate({
//                 _sum: {
//                     total_amount: true
//                 },
//                 where: {
//                     user_id: userId,
//                     event_id: eventId,
//                     created_at: {gte: monthStart},
//                 },
//             }),
//         ]);
//
//         return res.status(200).json({
//             status: true,
//             data: {
//                 today: todayTotal._sum.total_amount || 0,
//                 week: weekTotal._sum.total_amount || 0,
//                 month: monthTotal._sum.total_amount || 0,
//             }
//         });
//
//     } catch (e) {
//         res.status(500).json({
//             message: e.message
//         });
//     }
// };

exports.fetchTotalCount = async (req, res) => {
  try {
    let eventId = req.params.eventId;

    const userId = req.user.id;

    if (!userId) {
      return res.status(500).json({ message: "User ID is required" });
    }

    if (!eventId) {
      const events = await prisma.event.findMany({
        where: { user_id: userId },
      });

      const eventsWithDateTime = events.map((event) => {
        const [year, month, day] = event.start_date.split("-");
        const [hours, minutes] = event.start_time.split(":");
        const dateTime = new Date(
          Date.UTC(year, month - 1, day, hours, minutes)
        );

        return {
          ...event,
          startDateTime: dateTime,
        };
      });

      const now = new Date();
      const upcomingEvents = eventsWithDateTime.filter(
        (e) => e.startDateTime > now
      );
      upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

      eventId = upcomingEvents[0]?.id;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        ticket_categories: true,
      },
    });

    let totalQty = 0;

    event.ticket_categories.forEach((category) => {
      if (category.qty_available) {
        totalQty += parseInt(category.qty_available, 10);
      }
    });

    const [soldTickets, scanedTickets, refunds] = await Promise.all([
      prisma.order_Item.aggregate({
        _count: true,
        where: {
          user_id: userId,
          event_id: eventId,
          status: "Paid",
        },
      }),

      prisma.order_Item.aggregate({
        _count: true,
        where: {
          user_id: userId,
          event_id: eventId,
          isScaned: true,
        },
      }),

      prisma.order.aggregate({
        _count: true,
        where: {
          user_id: userId,
          event_id: eventId,
          status: "refund",
        },
      }),
    ]);

    return res.status(200).json({
      status: true,
      data: [
        {
          label: "Generated Count",
          count: totalQty || 0,
          percentage: parseFloat(parseFloat((totalQty || 0) / totalQty) * 100),
          color: "#4F46E5",
        },
        {
          label: "Sold Count",
          count: soldTickets._count || 0,
          percentage: parseFloat(
            parseFloat((soldTickets._count || 0) / totalQty) * 100
          ),
          color: "#10B981",
        },
        {
          label: "Scanned Count",
          count: scanedTickets._count || 0,
          percentage: parseFloat(
            parseFloat((scanedTickets._count || 0) / totalQty) * 100
          ),
          color: "#EC4899",
        },
        {
          label: "Refunds",
          count: refunds._count || 0,
          percentage: parseFloat(
            parseFloat((refunds._count || 0) / totalQty) * 100
          ),
          color: "#0EA5E9",
        },
      ],
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.fetchSellingTicketsCountByCategory = async (req, res) => {
  try {
    let eventId = req.body.eventId;

    const userId = req.user.id;

    if (!eventId) {
      const events = await prisma.event.findMany({
        where: { user_id: userId },
      });

      const eventsWithDateTime = events.map((event) => {
        const [year, month, day] = event.start_date.split("-");
        const [hours, minutes] = event.start_time.split(":");
        const dateTime = new Date(
          Date.UTC(year, month - 1, day, hours, minutes)
        );

        return {
          ...event,
          startDateTime: dateTime,
        };
      });

      const now = new Date();
      const upcomingEvents = eventsWithDateTime.filter(
        (e) => e.startDateTime > now
      );
      upcomingEvents.sort((a, b) => a.startDateTime - b.startDateTime);

      eventId = upcomingEvents[0]?.id;
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId },
    });

    if (!userId) {
      return res.status(500).json({ message: "User ID is required" });
    }

    const result = await Promise.all(
      event.ticket_categories.map(async (cate) => {
        const count = await prisma.order_Item.aggregate({
          _count: true,
          where: {
            event_id: eventId,
            ticket: {
              type: cate?.type,
            },
          },
        });

        return {
          category: cate?.type,
          count: count._count,
        };
      })
    );

    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.fetchAllEventByUserTicket = async (req, res) => {
  try {
    const userId = req.user.id;

    const orderData = await prisma.order.findMany({
      where: { user_id: userId },
    });

    if (orderData) {
      const events = [];

      for (const ord of orderData) {
        const eventData = await prisma.event.findFirst({
          where: { id: ord.event_id },
        });

        if (!eventData) continue;

        const existingEventIndex = events.findIndex(
          (e) => e.id === eventData.id
        );

        const ticketData = ord.categories;

        if (existingEventIndex > -1) {
          events[existingEventIndex].ticket = [
            ...events[existingEventIndex].ticket,
            ...ticketData,
          ];
        } else {
          const j = {
            id: eventData.id,
            title: eventData.title,
            date: eventData.start_date,
            image: eventData.image_url,
            time: eventData.start_time,
            ticket: Array.isArray(ticketData) ? [...ticketData] : [ticketData],
          };
          events.push(j);
        }
      }

      return res.status(200).json({
        status: true,
        data: events,
      });
    } else {
      return res.status(400).json({
        message: "Orders Not Found.",
      });
    }
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required." });
    }
    const event = await prisma.event.findFirst({
      where: { id: eventId },
    });
    if (!event) {
      return res.status(404).json({ message: "Event Not Found." });
    }
    if (event.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this event." });
    }
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: event.status === "active" ? "deactive" : "active" },
    });

    return res.status(200).json({
      status: true,
      message: "Event status updated successfully.",
      data: updatedEvent,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
