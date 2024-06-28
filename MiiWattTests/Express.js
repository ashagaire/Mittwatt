const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 4000;

// Connect to SQLite database
const db = new sqlite3.Database('D:/electricity-shoc/prisma/db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// API endpoint to fetch current data
app.get('/api/currentdata', (req, res) => {
  const query = 'select dateId,price,dateValue from HistoricalElectricityWeather,CalendarDate where HistoricalElectricityWeather.dateId =CalendarDate.id and dateValue like "2024-06-27%"';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API endpoint to fetch Yesterday data
app.get('/api/yesterdaydata', (req, res) => {
  const query_1 = 'select dateId,price,dateValue from HistoricalElectricityWeather,CalendarDate where HistoricalElectricityWeather.dateId =CalendarDate.id and dateValue like "2024-06-26%"';
  db.all(query_1, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API endpoint to fetch Tomorrow data
app.get('/api/tomorrowdata', (req, res) => {
  const query_2 = 'select dateId,price,dateValue from HistoricalElectricityWeather,CalendarDate where HistoricalElectricityWeather.dateId =CalendarDate.id and dateValue like "2024-06-28%"';
  db.all(query_2, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API endpoint to fetch past data
app.get('/api/pastdata', (req, res) => {
  const query_3 = ' SELECT dateId, price, dateValue FROM CalendarDate JOIN HistoricalElectricityWeather ON CalendarDate.id = HistoricalElectricityWeather.dateId WHERE dateValue BETWEEN  "2024-06-11%" AND "2024-06-25%";';
  db.all(query_3, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
