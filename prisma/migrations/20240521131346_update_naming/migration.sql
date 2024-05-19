/*
  Warnings:

  - You are about to drop the `DatesDimension` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ForecastElectricityPrices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionTypesDimension` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeatherCodesDimension` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "DatesDimension_dateValue_key";

-- DropIndex
DROP INDEX "ForecastElectricityPrices_dateId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DatesDimension";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ForecastElectricityPrices";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscriptionTypesDimension";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscriptionUsers";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WeatherCodesDimension";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ForecastElectricityPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForecastElectricityPrice_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DateDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DateDimension" (
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
CREATE TABLE "WeatherCodeDimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descriptionCode" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubscriptionUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionTypeId" INTEGER NOT NULL,
    "activeSubscription" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionUser_subscriptionTypeId_fkey" FOREIGN KEY ("subscriptionTypeId") REFERENCES "SubscriptionTypeDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionTypeDimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descriptionSubscription" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HistoricalElectricityWeatherData" (
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
    CONSTRAINT "HistoricalElectricityWeatherData_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DateDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricalElectricityWeatherData_weatherCodeId_fkey" FOREIGN KEY ("weatherCodeId") REFERENCES "WeatherCodeDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HistoricalElectricityWeatherData" ("cloudCover", "createdDate", "dateId", "id", "modifiedDate", "precipitation", "price", "shortwaveRadiation", "temperature", "weatherCodeId", "windSpeed10m") SELECT "cloudCover", "createdDate", "dateId", "id", "modifiedDate", "precipitation", "price", "shortwaveRadiation", "temperature", "weatherCodeId", "windSpeed10m" FROM "HistoricalElectricityWeatherData";
DROP TABLE "HistoricalElectricityWeatherData";
ALTER TABLE "new_HistoricalElectricityWeatherData" RENAME TO "HistoricalElectricityWeatherData";
CREATE UNIQUE INDEX "HistoricalElectricityWeatherData_dateId_key" ON "HistoricalElectricityWeatherData"("dateId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "ForecastElectricityPrice_dateId_key" ON "ForecastElectricityPrice"("dateId");

-- CreateIndex
CREATE UNIQUE INDEX "DateDimension_dateValue_key" ON "DateDimension"("dateValue");
