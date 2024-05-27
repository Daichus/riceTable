const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.resolve(__dirname, 'rice_price_database.db'); // Fixed database path resolution

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
   if (err) {
      console.error('Failed to connect to the database:', err.message);
   } else {
      console.log('Connected to the SQLite database.');
   }
});

module.exports = app;

// Parse JSON files
app.use(express.json());
// Parse form data, e.g., name=Alice&age=25
app.use(express.urlencoded({ extended: false }));

// Handle root path request, return HTML form
app.get('/', function (req, res) {
   console.log('Serving riceTest.html');
   res.sendFile(path.join(__dirname, 'riceTest.html'));
});

// Handle query request
app.post('/query', function (req, res) {
   const { year, month, type } = req.body;

   console.log('Received query request:', req.body);

   if (!year || !type) {
      console.log('Missing required fields');
      return res.status(400).send('Missing required fields: year, type');
   }

   const query = month
       ? 'SELECT * FROM rice_prices WHERE year = ? AND month = ? AND type = ?'
       : 'SELECT * FROM rice_prices WHERE year = ? AND month IS NULL AND type = ?';

   console.log('Executing query:', query, [year, month, type]);

   db.get(query, [year, month, type], (err, row) => {
      if (err) {
         console.error('Failed to retrieve data from the database:', err.message);
         return res.status(500).send('Failed to retrieve data from the database');
      }
      if (!row) {
         console.log('No data found for the provided inputs');
         return res.status(404).send('No data found for the provided inputs');
      }
      console.log('Query result:', row);

      // Return HTML table directly
      const resultHtml = `
         <table border="1">
            <tr>
               <th>Year</th>
               <th>Month</th>
               <th>Type</th>
               <th>Price</th>
            </tr>
            <tr>
               <td>${row.year}</td>
               <td>${row.month || 'Yearly Average'}</td>
               <td>${row.type}</td>
               <td>${row.price}</td>
            </tr>
         </table>
      `;
      res.send(resultHtml);
   });
});

// Start the server and listen on port 4000
const PORT = 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}.`);
});
