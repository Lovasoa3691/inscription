const axios = require('axios');
const express = require('express');
const router = express.Router();

router.get('/sms', async (req, res) => {
    axios.post('https://textbelt.com/text', {
        phone: '+261345416063',
        message: 'Bonjour Juliannot Lovasoa!',
        key: 'textbelt',
    }).then(res => {
        console.log(res.data);
    });
});

module.exports = router;

