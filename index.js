//Require libraries to help make requests
const express = require('express');
const bodyParser = require('body-parser');
const helper = require('sendgrid').mail;

//Initialize our app
const app = express();

//This API key is hidden in an environment file hosted by Heroku which deploys our app
const SENDGRID_API_KEY = process.env.SENDGRID_KEY;

//Initialize sendgrid with our API key
const sg = require('sendgrid')(SENDGRID_API_KEY);
const port = process.env.PORT || 3000;

const from_email = new helper.Email('APCSPIsTheBest@example.com');
const subject = 'Wow sending emails is so easy';

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//Get around annoying CORS permissions
//Allows us to make request from codepen even though it's a different website
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Get requests let you read data from the server
//Here we are simply sending the client a string
app.get('/', function(req, res, next) {
    res.send('Hello world!');
});

//Post requests allow you to send data to a server
//They are often used to save data to a database
app.post('/sendEmail', function(req, res, next) {
    const data = req.body;

    const to_email = new helper.Email(data.email);
    const content = new helper.Content('text/plain', data.message);
    const mail = new helper.Mail(from_email, subject, to_email, content);

    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    //Uses the Sendgrid API to make a request
    sg.API(request, function(error, response) {
        //Sends the email and message back to the client in the response
        res.send('We sent '+data.email+' this message: '+ data.message);
    });
});

app.listen(port, function (err) {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening on' + port);
});
