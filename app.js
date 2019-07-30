let express = require('express');
let bodyParser = require('body-parser');    
let cors = require('cors')();
let config = require('./config/config');
let app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(cors);

require('./routes/api')(app);

let server = app.listen(config.port, () => {
    console.log(`
        Express server has started on port ${config.port}
    `);
});