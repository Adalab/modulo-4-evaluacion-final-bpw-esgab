// my Express server 

// import libraries
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

require('dotenv').config();

// create and config server
const server = express();

server.use(cors());
server.use(express.json({ limit: '25mb' }));

// mysql config

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DB,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
  });

  await connection.connect();

  return connection;
}

// init express aplication
const port = 4000;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

server.get('/recetas', async (req, res) => {

  const connection = await getConnection();

  const sql = 'SELECT * FROM recetas';

  const [results] = await connection.query(sql);

  const numOfElements = results.length;

  res.json({
    'info': { 'count' : numOfElements },
    'results': results
  });

  connection.end();

});