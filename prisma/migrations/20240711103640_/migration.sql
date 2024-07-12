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
