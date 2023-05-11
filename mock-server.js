const http = require('http');

const PORT = 8000;

const server = http.createServer((req, res) => {
  console.log(`Incoming request: ${req.method} ${req.url}`)
  req.on('data', chunk => {
    console.log(chunk.toString());
  });
  let response = {
    result: 'clear'
    //result: 'delivered'
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const responseStr = JSON.stringify(response)
  res.end(responseStr);
  console.log(`Response: ${responseStr}`)
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});