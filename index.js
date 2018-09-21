const http = require('http');
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: 'https://victoralvess.github.io/desafio-estagio/',
    optionsSuccessStatus: 200
  })
);

/**
 * Makes a request to the actual '/api/v1/states' endpoint.
 */
app.get('/api/v1/states', (req, res) => {
  const url = 'http://mis-api.dev.br-mediagroup.com/api/v1/states';
  handleProxy(url, cbProxy(res));
});

/**
 * Makes a request to the actual '/api/v1/cities' endpoint.
 */
app.get('/api/v1/cities/:state', (req, res) => {
  const { state: id } = req.params;
  
  // Checks id
  if (Number.isNaN(parseInt(id))) {
    return res.status(400).end();
  }

  const url = `http://mis-api.dev.br-mediagroup.com/api/v1/cities?state_id=${id}`;
  handleProxy(url, cbProxy(res));
});

/**
 * Makes a request to the actual API server.
 * It can return the states list or a error.
 * There are three possible outcomes:
 *  1. Returns the error code given by the API server;
 *  2. Returns the parsed data;
 *  3. Returns a 502 status code if the the recieved data is not a valid JSON.
 */
function handleProxy(url, cb) {
  http.get(url, response => {
    const { statusCode } = response;

    // Check status code
    if (statusCode !== 200) {
      cb(new Error(statusCode));
    }

    let data = '';
    
    // Read the data
    response.on('data', chunk => {
      data += chunk;
    });

    // Try parse the data
    response.on('end', _ => {
      try {
        const parsed = JSON.parse(data);
        cb(null, parsed);
      } catch (_) {
        cb(new Error(502));
      }
    });
  });
}

/**
 * Handles the response
 */
function cbProxy(res) {
  return (err, data) => {
    if (err !== null) {
      return res.status(err.message).end();
    }

    // Remove unused fields
    responseData = data.map(({ id, name }) => ({ id, name }));
    res.send(responseData);
  }
}

app.listen(3001);