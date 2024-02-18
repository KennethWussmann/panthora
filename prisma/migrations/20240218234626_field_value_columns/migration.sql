/*
  Warnings:

  - You are about to drop the column `value` on the `FieldValue` table. All the data in the column will be lost.
  - Added the required column `type` to the `FieldValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FieldValue" DROP COLUMN "value",
ADD COLUMN     "booleanValue" BOOLEAN,
ADD COLUMN     "dateTimeValue" TIMESTAMP(3),
ADD COLUMN     "decimalValue" DECIMAL(65,30),
ADD COLUMN     "intValue" INTEGER,
ADD COLUMN     "stringValue" TEXT,
ADD COLUMN     "type" "FieldType" NOT NULL;
