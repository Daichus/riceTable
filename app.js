const express = require('express');
//創建一個用於管理路由，請求何回應的express實例(等同於創建伺服器架構)
const app = express();
//導入處理database的工具包
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
//(optional)導入處理資料路徑的工具包
const path = require('path');
//(optional)導入處理瀏覽器cookie的工具包
const  cookieParser = require('cookie-parser');
const logger = require('morgan');
// 数据库文件路径
const dbPath = path.resolve('rice_price_database.db');
const htmlPath = path.resolve(__dirname,'views','riceTest.html');
// 连接SQLite数据库，(error) =>等同於java中的try catch中的catch
const db = new sqlite3.Database(dbPath, (error) => {
   if (error) {
      console.error('Failed to connect to the database:', error.message);
   } else {
      console.log('Connected to the  Database.');
   }
});
// 使用解析JSON文件的工具
app.use(express.json());
// 使用解析网页表单数据，例如name=Alice&age=25
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//將app變數導出
module.exports = app;


// 創建一個具備req與res功能的方法以處理根路径请求，返回HTML表单
app.get('/', (req, res)=> {
   console.log('Success.');
   res.sendFile(htmlPath);
});

app.post('/', (req, res) => {
   const { year, month, type } = req.body;

   console.log('Received query request:', req.body); // 打印接收到的请求数据

   if (!year || !month || !type) {
      return res.status(400).json({ error: 'Missing required fields: year, month, type' });
   }

   // 定义查询语句
   const query = 'SELECT * FROM rice_prices WHERE year = ? AND month = ? AND type = ?';
   const params = [year, month, type];

   db.get(query, params, (err, row) => {
      if (err) {
         console.error('Failed to retrieve data from the database:', err.message); // 打印错误信息
         return res.status(500).json({ error: 'Failed to retrieve data from the database' });
      }
      if (!row) {
         console.log('No data found for the provided inputs'); // 打印未找到数据的信息
         return res.status(404).json({ error: 'No data found for the provided inputs' });
      }

      // 读取现有的 HTML 文件
      fs.readFile(htmlPath, 'utf8', (err, htmlData) => {
         if (err) {
            console.error('Failed to read HTML file:', err.message);
            return res.status(500).send('Failed to read HTML file');
         }

            // 插入查询结果到表格中
            const resultTable = `
        <tr>
          <td>${row.year}</td>
          <td>${row.month || '年平均'}</td>
          <td>${row.type}</td>
          <td>${row.price}</td>
        </tr>
      `;

            // 查找表格的起始位置并插入结果
            const updatedHtml = htmlData.replace('</tbody>', resultTable + '</tbody>');

            // 返回更新后的 HTML 文件
            res.send(updatedHtml);
         });
      });
});
// 启动服务器并监听端口4000
const PORT = 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}.`);
});
