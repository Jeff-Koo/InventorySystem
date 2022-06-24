// the basic setup for the express-handlebars as 'template'
import express from "express";
import { engine } from "express-handlebars";

// load application from express
import { application } from "express";

// load mongoose
import mongoose from "mongoose";

// load body-parsoer
import bodyParser from "body-parser";

// load morgan
import morgan from "morgan";

// load method-override
import methodOverride from "method-override";

// load handlebars for making self-define function for handlebars
import handlebars from "handlebars";

// import inventories as a route 
import  inventoriesRoute  from './routes/inventoriesRoute.js';

// import transactions as a route 
import  transactionsRoute  from './routes/transactionsRoute.js';

// make a function to store the variables in handlebars
handlebars.registerHelper('assign', function (varName, varValue, options) {
    options.data.root[varName] = varValue;
});

// make a function to check whether the variables in handlebars are the same
handlebars.registerHelper('isSame', function (var1, var2) {
    return String(var1) === String(var2);
});


const app = express();

// create mongo connection, '/inventory-dev' is the databse name
// it is a Promise Object so set the response and catch (cuz db out of program control, can't tell when data come back)
// database connection is done
mongoose
    .connect("mongodb://localhost:27017/inventory-dev")
    .then(  () => console.log("Mongodb connected.........") )
    .catch( (err) => console.log(err) );


// setup middleware : afte require('express') and before .get()
// setup handlebars middleware
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(morgan("tiny"));

// put body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// add methodOverride middleware
app.use(methodOverride("_method"));

// create a root route (localhost:5000)
app.get("/", (req, res) => {
    const welcome ="Welcome";
    res.render("index", {title: welcome});
} );

// create a route for about (localhost:5000/about)
app.get("/about", (req, res) => {
    res.render("about");
} );

// add inventories as a route 
app.use('/inventories', inventoriesRoute);
// add transactions as a route 
app.use('/transactions', transactionsRoute);


// ===================== Handle 404 / 500 =======================

// simulate handling 500 - Internal Server Error
app.use( '/abc?d' , (req, res, next) => {   // when the route matches '/abcd' and '/abd'
    res.status(500);                        // set status to 500
    res.render('500');                      // render 500 page
});

// handle 404 - Not Found
app.use('', (req, res, next) => {           // match every path which does not handled by the route above, 404 is the last route
    res.status(404);                        // set status to 404
    res.render('404');                      // render 404 page
});

// set PORT number to 5000
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
} );

// start server by using command: npm run dev