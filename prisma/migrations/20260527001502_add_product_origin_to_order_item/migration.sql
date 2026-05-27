/*
  Warnings:

  - You are about to drop the column `originCity` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `originProvince` on the `Shipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productOriginAddress" TEXT;

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "originCity",
DROP COLUMN "originProvince";
