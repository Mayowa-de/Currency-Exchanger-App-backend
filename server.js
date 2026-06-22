const express= require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const currenciesRoute = require('./routes/currenciesRate.js');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions =() => ({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
});

app.use(cors(corsOptions()));
app.use(express.json());


app.use(currenciesRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});