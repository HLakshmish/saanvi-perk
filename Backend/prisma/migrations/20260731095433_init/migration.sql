-- CreateTable
CREATE TABLE "company_details" (
    "company_id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_code" TEXT NOT NULL,
    "company_logo" TEXT,
    "company_email" TEXT NOT NULL,
    "company_phone" TEXT,
    "website" TEXT,
    "gst_number" TEXT,
    "pan_number" TEXT,
    "cin_number" TEXT,
    "registration_number" TEXT,
    "industry_type" TEXT,
    "company_type" TEXT,
    "founded_date" TIMESTAMP(3),
    "employee_strength" INTEGER,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "timezone" TEXT,
    "currency" TEXT,
    "working_hours_per_day" DOUBLE PRECISION,
    "working_days_per_week" INTEGER,
    "office_start_time" TEXT,
    "office_end_time" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "allowed_radius" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_details_pkey" PRIMARY KEY ("company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_details_company_code_key" ON "company_details"("company_code");

-- CreateIndex
CREATE UNIQUE INDEX "company_details_company_email_key" ON "company_details"("company_email");
