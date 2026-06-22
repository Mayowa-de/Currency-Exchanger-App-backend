const express =require('express');
const { getCurrenciesRate } = require('../Controllers/currenciesRateController');
const api_key = process.env.Currencies_Api_key;
const app = express()

const router = express.Router();

router.get('/api', getCurrenciesRate); 


module.exports = router;