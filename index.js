var express = require('express');
var bodyParser = require('body-parser');
var simplify = require("simplify-commerce");
var expressWs = require("express-ws");

SIMPLIFY_CLIENT_CONFIG = {
  publicKey: process.env.SIMPLIFY_PUBLIC_KEY,
  privateKey: process.env.SIMPLIFY_PRIVATE_KEY,
};

var app = express();
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.raw());
var wss = expressWs(app);

app.get('/', function(req, rsp) {
  rsp.render('pages/index');
});

app.post('/', function(req, rsp) {
  client = simplify.getClient(SIMPLIFY_CLIENT_CONFIG);
  client.payment.create({amount: "1000",
                         token: req.body.simplifyToken,
                         description: "payment description",
                         currency: "USD"},
    function(errData, data) {
      if (errData) {
        console.error("Error Message: " + errData.data.error.message);
        // handle the error
        rsp.render('pages/index');
        return;
      }
      console.log("Payment Status: " + data.paymentStatus);
      rsp.render('pages/index');
    });
});

app.post('/simplify/webhook', function(req, rsp) {
  wss.getWss('/simplify/websocket').clients.forEach(function(client) {
    client.send(req.body.toString('utf8'));
  });
  rsp.send('OK');
});

app.ws('/simplify/websocket', function(ws, req) {
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
