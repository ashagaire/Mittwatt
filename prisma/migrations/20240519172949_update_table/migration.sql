/*
  Warnings:

  - Added the required column `hour` to the `DateDimension` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DateDimension" (
    "date_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_value" DATETIME NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "day_name" TEXT NOT NULL,
    "month_name" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    CONSTRAINT "DateDimension_date_value_fkey" FOREIGN KEY ("date_value") REFERENCES "History" ("datetime") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DateDimension_date_value_fkey" FOREIGN KEY ("date_value") REFERENCES "Forecast" ("datetime") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DateDimension" ("date_id", "date_value", "day", "day_name", "day_of_week", "month", "month_name", "quarter", "year", "year_month") SELECT "date_id", "date_value", "day", "day_name", "day_of_week", "month", "month_name", "quarter", "year", "year_month" FROM "DateDimension";
DROP TABLE "DateDimension";
ALTER TABLE "new_DateDimension" RENAME TO "DateDimension";
CREATE UNIQUE INDEX "DateDimension_date_value_key" ON "DateDimension"("date_value");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
