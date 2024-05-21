/*
  Warnings:

  - You are about to drop the `DateDimension` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistoricalElectricityWeatherData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionTypeDimension` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeatherCodeDimension` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "DateDimension_dateValue_key";

-- DropIndex
DROP INDEX "HistoricalElectricityWeatherData_dateId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DateDimension";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HistoricalElectricityWeatherData";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscriptionTypeDimension";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WeatherCodeDimension";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "HistoricalElectricityWeather" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "temperature" REAL NOT NULL,
    "precipitation" REAL NOT NULL,
    "cloudCover" INTEGER NOT NULL,
    "windSpeed10m" INTEGER NOT NULL,
    "shortwaveRadiation" INTEGER NOT NULL,
    "weatherCodeId" INTEGER NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricalElectricityWeather_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "CalendarDate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricalElectricityWeather_weatherCodeId_fkey" FOREIGN KEY ("weatherCodeId") REFERENCES "WeatherCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalendarDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateValue" DATETIME NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "dayName" TEXT NOT NULL,
    "monthName" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WeatherCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descriptionCode" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubscriptionType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descriptionSubscription" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForecastElectricityPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForecastElectricityPrice_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "CalendarDate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ForecastElectricityPrice" ("createdDate", "dateId", "id", "modifiedDate", "price") SELECT "createdDate", "dateId", "id", "modifiedDate", "price" FROM "ForecastElectricityPrice";
DROP TABLE "ForecastElectricityPrice";
ALTER TABLE "new_ForecastElectricityPrice" RENAME TO "ForecastElectricityPrice";
CREATE UNIQUE INDEX "ForecastElectricityPrice_dateId_key" ON "ForecastElectricityPrice"("dateId");
CREATE TABLE "new_SubscriptionUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionTypeId" INTEGER NOT NULL,
    "activeSubscription" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionUser_subscriptionTypeId_fkey" FOREIGN KEY ("subscriptionTypeId") REFERENCES "SubscriptionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubscriptionUser" ("activeSubscription", "createdDate", "email", "id", "modifiedDate", "name", "subscriptionTypeId") SELECT "activeSubscription", "createdDate", "email", "id", "modifiedDate", "name", "subscriptionTypeId" FROM "SubscriptionUser";
DROP TABLE "SubscriptionUser";
ALTER TABLE "new_SubscriptionUser" RENAME TO "SubscriptionUser";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalElectricityWeather_dateId_key" ON "HistoricalElectricityWeather"("dateId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarDate_dateValue_key" ON "CalendarDate"("dateValue");
