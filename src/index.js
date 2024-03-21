// my Express server 

// import libraries
const express = require('express');

// create and config server
const server = express();

// init express aplication
const port = 4000;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});