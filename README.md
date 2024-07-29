# MittWatt

MittWatt is a web application designed to provide insights into electricity prices in the Finnish market. It offers real-time data on current electricity prices, historical data for the past two weeks, and predictions for the next two weeks.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)

## Features

- **Current Prices**: View the current electricity prices in Finland.
- **Historical Data**: Access statistics on electricity prices for the past two weeks.
- **Future Predictions**: Get predictions for electricity prices for the next two weeks.

## Project Structure

The MittWatt project is divided into four main parts:

1. **Prediction Model**: Utilizes machine learning algorithms to forecast electricity prices for the next two weeks.
2. **Data Retrieval Script**: A Python script that fetches historical electricity prices for the past two years and the current prices.
3. **Web Application**: Developed using the T3 stack (TRPC, Tailwind CSS, Next.js) for a seamless user experience.
4. **API Tests**: Ensures the reliability and accuracy of the API endpoints.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (version 14.x or higher)
- PostgreSQL (version 12.x or higher)
- Python (version 3.7 or higher)

## Installation

To set up the project locally, follow these steps:

1. **Install pnpm**:

   ```bash
   npm install -g pnpm
   ```

2. **Clone the repository**:

   ```bash
   git clone https://github.com/[username]/mittwatt.git
   cd mittwatt
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Set up the database**:

   - Ensure you have PostgreSQL installed and running.
   - Create a new database and update the .env file with your database credentials as shown below:

   ```plaintext
   DATABASE_URL="postgresql://[username]:[password]@[host_name]:[port_number]/[database_name]"
   ```

   where

   - `[username]` is the username of the database user.
   - `[password]` is the password of the database user.
   - `[host_name]` is the host name of the database.
   - `[port_number]` is the port number of the database.
   - `[database_name]` is the name of the database.

5. **Run database migrations**:

   ```bash
   pnpm prisma migrate dev
   ```

6. **Run data retrieval script**:
   Run the scripts for the prediction model and historical data retrieval. Please check the README.md under the `prisma` folder and `ml_models` folder for more details.

7. **Start the development server**:
   ```bash
   pnpm dev
   ```

## Usage

Once the development server is running, you can access the web application at `http://localhost:3000`. The application consists of three main tabs:

- **Current**: Displays the current electricity prices.
- **Past**: Shows historical data for the past two weeks.
- **Future**: Provides predictions for the next two weeks.
