let express = require('express');
var bodyParser = require('body-parser');    
let cors = require('cors')();
let app = express();
     
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(cors);

require('./router/api')(app);

let server = app.listen(3000, () => {
    console.log("Express server has started on port 3000");
});