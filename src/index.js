const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')


const app = express()
app.use(cors())


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


require('./app/controllers')(app);


app.listen(3000);
