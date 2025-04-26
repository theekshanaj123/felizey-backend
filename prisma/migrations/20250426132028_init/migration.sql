-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT,
    "price" INTEGER,
    "quantity_available" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "banner_video_url" TEXT,
    "address" TEXT,
    "location" TEXT,
    "country" TEXT,
    "region" JSONB,
    "marker" JSONB,
    "timezone" TEXT,
    "start_date" TIMESTAMP(3),
    "start_time" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "category" TEXT,
    "tags" JSONB,
    "external_link" TEXT,
    "attendees_count" INTEGER,
    "max_attendees" INTEGER,
    "is_online" BOOLEAN,
    "age_limit" TEXT,
    "parking" BOOLEAN,
    "language" TEXT,
    "ticket_categories" JSONB,
    "price" DECIMAL(10,2),
    "event_type" TEXT,
    "event_privacy" TEXT,
    "accessibility" JSONB,
    "view_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
