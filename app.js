let express = require('express');
var bodyParser = require('body-parser');    
let cors = require('cors')();
let app = express();
                                                           
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(cors);

require('./router/api')(app);

let server = app.listen(3000, () => {
    console.log("Express server has started on port 3000");
});