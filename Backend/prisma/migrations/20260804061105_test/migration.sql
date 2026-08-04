-- DropForeignKey
ALTER TABLE "address_information" DROP CONSTRAINT "address_information_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bank_details" DROP CONSTRAINT "bank_details_user_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_company_id_fkey";

-- DropForeignKey
ALTER TABLE "employee_documents" DROP CONSTRAINT "employee_documents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "parents_information" DROP CONSTRAINT "parents_information_user_id_fkey";

-- DropForeignKey
ALTER TABLE "personal_information" DROP CONSTRAINT "personal_information_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_fkey";

-- CreateTable
CREATE TABLE "super_admins" (
    "super_admin_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "phone_number" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("super_admin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_company_id_key" ON "super_admins"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- AddForeignKey
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_details"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_details"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_details"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_information" ADD CONSTRAINT "personal_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents_information" ADD CONSTRAINT "parents_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_information" ADD CONSTRAINT "address_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
