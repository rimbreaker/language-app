var express = require('express');
var compression=require('compression')
var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(compression())
app.use(express.static(__dirname + '/build'));

app.get('/auth',(req,res)=>{
  const redirectUrl=req.headers.referer.includes('localhost')?'http://localhost:3000':'https://lyrson-client.herokuapp.com'
  const code=req.query.code
  res.redirect(`${redirectUrl}/#/auth?code=`+code)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});