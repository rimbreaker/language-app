var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/auth',(req,res)=>{
  const code=req.query.code
  res.redirect(200,'https://lyrson-client.herokuapp.com/#/auth?code='+code)
})

app.use(express.static(__dirname + '/build'));


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});