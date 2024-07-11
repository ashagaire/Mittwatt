/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "Post_name_idx";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Account";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VerificationToken";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForecastElectricityPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "price" REAL,
    "createdDate" DATETIME NOT NULL,
    "modifiedDate" DATETIME NOT NULL,
    CONSTRAINT "ForecastElectricityPrice_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "CalendarDate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ForecastElectricityPrice" ("createdDate", "dateId", "id", "modifiedDate", "price") SELECT "createdDate", "dateId", "id", "modifiedDate", "price" FROM "ForecastElectricityPrice";
DROP TABLE "ForecastElectricityPrice";
ALTER TABLE "new_ForecastElectricityPrice" RENAME TO "ForecastElectricityPrice";
CREATE UNIQUE INDEX "ForecastElectricityPrice_dateId_key" ON "ForecastElectricityPrice"("dateId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
