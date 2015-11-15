var express = require('express');
var bodyParser = require('body-parser');
var simplify = require("simplify-commerce");

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

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/', function(request, response) {
  client = simplify.getClient(SIMPLIFY_CLIENT_CONFIG);
  client.payment.create({amount: "1000",
                         token: request.body.simplifyToken,
                         description: "payment description",
                         currency: "USD"},
    function(errData, data){
      if(errData){
        console.error("Error Message: " + errData.data.error.message);
        // handle the error
        response.render('pages/index');
        return;
      }
      console.log("Payment Status: " + data.paymentStatus);
      response.render('pages/index');
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


