-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HistoricalElectricityWeather" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "price" REAL,
    "temperature" REAL NOT NULL,
    "precipitation" REAL NOT NULL,
    "cloudCover" INTEGER NOT NULL,
    "windSpeed10m" INTEGER NOT NULL,
    "shortwaveRadiation" INTEGER NOT NULL,
    "weatherCodeId" INTEGER NOT NULL,
    "createdDate" DATETIME NOT NULL,
    "modifiedDate" DATETIME NOT NULL,
    CONSTRAINT "HistoricalElectricityWeather_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "CalendarDate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricalElectricityWeather_weatherCodeId_fkey" FOREIGN KEY ("weatherCodeId") REFERENCES "WeatherCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HistoricalElectricityWeather" ("cloudCover", "createdDate", "dateId", "id", "modifiedDate", "precipitation", "price", "shortwaveRadiation", "temperature", "weatherCodeId", "windSpeed10m") SELECT "cloudCover", "createdDate", "dateId", "id", "modifiedDate", "precipitation", "price", "shortwaveRadiation", "temperature", "weatherCodeId", "windSpeed10m" FROM "HistoricalElectricityWeather";
DROP TABLE "HistoricalElectricityWeather";
ALTER TABLE "new_HistoricalElectricityWeather" RENAME TO "HistoricalElectricityWeather";
CREATE UNIQUE INDEX "HistoricalElectricityWeather_dateId_key" ON "HistoricalElectricityWeather"("dateId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
