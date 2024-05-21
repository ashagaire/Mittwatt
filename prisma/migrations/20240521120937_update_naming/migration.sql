/*
  Warnings:

  - You are about to drop the `DateDimension` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Forecast` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscribeUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionTypeDimension` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeatherCodeDimension` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DateDimension";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Forecast";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "History";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscribeUser";
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
CREATE TABLE "HistoricalElectricityWeatherData" (
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
    CONSTRAINT "HistoricalElectricityWeatherData_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DatesDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricalElectricityWeatherData_weatherCodeId_fkey" FOREIGN KEY ("weatherCodeId") REFERENCES "WeatherCodesDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForecastElectricityPrices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForecastElectricityPrices_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DatesDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DatesDimension" (
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
CREATE TABLE "WeatherCodesDimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descriptionCode" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubscriptionUsers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionTypeId" INTEGER NOT NULL,
    "activeSubscription" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionUsers_subscriptionTypeId_fkey" FOREIGN KEY ("subscriptionTypeId") REFERENCES "SubscriptionTypesDimension" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionTypesDimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descriptionSubscription" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalElectricityWeatherData_dateId_key" ON "HistoricalElectricityWeatherData"("dateId");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastElectricityPrices_dateId_key" ON "ForecastElectricityPrices"("dateId");

-- CreateIndex
CREATE UNIQUE INDEX "DatesDimension_dateValue_key" ON "DatesDimension"("dateValue");
