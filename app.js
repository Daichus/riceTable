const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.resolve('C:\\Users\\CGI artifacts\\DataBase\\rice_price_database.db');

// 连接SQLite数据库
const db = new sqlite3.Database(dbPath, (err) => {
   if (err) {
      console.error('Failed to connect to the database:', err.message);
   } else {
      console.log('Connected to the SQLite database.');
   }
});

module.exports = app;

// 解析JSON文件
app.use(express.json());
// 解析网页表单数据，例如name=Alice&age=25
app.use(express.urlencoded({ extended: false }));

// 处理根路径请求，返回HTML表单
app.get('/', function (req, res) {
   console.log('Serving rice Test.html');
   res.sendFile(path.join(__dirname, 'riceTest.html'));
});

// 处理查询请求
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

      // 直接返回 HTML 表格
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

// 启动服务器并监听端口4000
const PORT = 3000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}.`);
});
