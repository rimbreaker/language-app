var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3000));


app.use(express.static(__dirname + '/build'));

app.get('/auth',(req,res)=>{
  const code=req.query.code
  res.redirect('http://localhost:3000/#/auth?code='+code)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});