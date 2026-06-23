const axios = require("axios");
const getCurrenciesRate = async (req, res) => {
  try {
    const { base = "USD" } = req.query;

    const todayResponse = await axios.get(
      `https://api.frankfurter.app/latest?base=${base}`
    );
    const todayRates = todayResponse.data;

    // Get yesterday's date for historical rates
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayDateString = yesterdayDate.toISOString().split('T')[0];

    const yesterdayResponse = await axios.get(`https://api.frankfurter.app/${yesterdayDateString}?base=${base}`);
    const yesterdayRates = yesterdayResponse.data;

    const rates = todayRates.rates;
    const yesterdayRateValue = yesterdayRates.rates[base] || 1;
    const todayRateValue = todayRates.rates[base] || 1;
    
    const percentageChange = ((todayRateValue - yesterdayRateValue) / yesterdayRateValue) * 100;
    
    const currencies = Object.keys(rates).map((code) => ({
      code,
      rate: rates[code],
    }));
    res.status(200).json({
      rate: todayRateValue,
      base,
      direction: percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "no change",
      percentageChange: percentageChange.toFixed(4),
      currencies,
    });
  } catch (error) {
    console.error("Error fetching currency rates:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch currency rates" });
  }
};
module.exports = { getCurrenciesRate };
