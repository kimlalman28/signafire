const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const port = 3000;


//to parse body params in request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); //to use ejs
app.set('views', './views')

const apiRoutes = require('./routes/api-routes');
app.get('/', apiRoutes);
app.get('/users/:user', apiRoutes);


app.listen(port, () => {
	console.log("App listening on port " +port);
});