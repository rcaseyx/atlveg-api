const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { GMAIL_USER, GMAIL_PASS } = require('../config');

router.post('/', jsonParser, (req, res) => {
    let mailOpts;
    let smtpTrans;
    smtpTrans = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS
        }
    });

    mailOpts = {
        from: req.body.name + ' &lt;' + req.body.email + '&gt;',
        to: GMAIL_USER,
        subject: 'New suggestion for ATL Veg!',
        text: `${req.body.name} (${req.body.email}): ${req.body.message}`
    };

    smtpTrans.sendMail(mailOpts, function (error, info) {
        if (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        } else {
            res.status(201).send("Message sent successfully");
        }
        smtpTrans.close();
    });
});

module.exports = router;
