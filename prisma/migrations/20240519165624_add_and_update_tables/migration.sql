-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "History" (
    "history_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datetime" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "temperature" REAL NOT NULL,
    "precipitation" REAL NOT NULL,
    "cloud_cover" INTEGER NOT NULL,
    "wind_speed_10m" INTEGER NOT NULL,
    "shortwave_radiation" INTEGER NOT NULL,
    "modified_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weather_code_id" INTEGER NOT NULL,
    CONSTRAINT "History_weather_code_id_fkey" FOREIGN KEY ("weather_code_id") REFERENCES "WeatherCodeDimension" ("weather_code_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Forecast" (
    "forecast_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datetime" DATETIME NOT NULL,
    "price" INTEGER NOT NULL,
    "modified_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DateDimension" (
    "date_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_value" DATETIME NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "day_name" TEXT NOT NULL,
    "month_name" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    CONSTRAINT "DateDimension_date_value_fkey" FOREIGN KEY ("date_value") REFERENCES "History" ("datetime") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DateDimension_date_value_fkey" FOREIGN KEY ("date_value") REFERENCES "Forecast" ("datetime") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeatherCodeDimension" (
    "weather_code_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description_code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SubscribeUser" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscription_type_id" INTEGER NOT NULL,
    "active_subscription" BOOLEAN NOT NULL DEFAULT true,
    "modified_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscribeUser_subscription_type_id_fkey" FOREIGN KEY ("subscription_type_id") REFERENCES "SubscriptionTypeDimension" ("subscription_type_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionTypeDimension" (
    "subscription_type_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description_subscription" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "History_datetime_key" ON "History"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "Forecast_datetime_key" ON "Forecast"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "DateDimension_date_value_key" ON "DateDimension"("date_value");
