const axios = require("axios");
const getCurrenciesRate = async (req, res) => {
  try {
    const { base = "USD", symbols } = req.query;
    const symbolsParam = symbols ? `&symbols=${symbols}` : "";

    const todayResponse = await axios.get(
      `https://api.frankfurter.app/latest?base=${base}${symbolsParam}`
    );
    const todayRates = todayResponse.data;

    // Get yesterday's date for historical rates
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayDateString = yesterdayDate.toISOString().split('T')[0];

    const yesterdayResponse = await axios.get(
      `https://api.frankfurter.app/${yesterdayDateString}?base=${base}${symbolsParam}`
    );
    const yesterdayRates = yesterdayResponse.data;

    const rates = todayRates.rates;
    const symbolKeys = Object.keys(rates);
    const primarySymbol = symbolKeys[0];
    const todayRateValue = primarySymbol ? rates[primarySymbol] : null;
    const yesterdayRateValue = primarySymbol ? yesterdayRates.rates[primarySymbol] : null;

    const percentageChange = yesterdayRateValue
      ? ((todayRateValue - yesterdayRateValue) / yesterdayRateValue) * 100
      : 0;

    const currencies = symbolKeys.map((code) => {
      const currentRate = rates[code];
      const previousRate = yesterdayRates.rates[code];
      const change = previousRate
        ? ((currentRate - previousRate) / previousRate) * 100
        : null;

      return {
        code,
        rate: currentRate,
        percentageChange: change === null ? null : Number(change.toFixed(4)),
      };
    });
    res.status(200).json({
      rate: todayRateValue,
      base,
      direction: percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "no change",
      percentageChange: Number(percentageChange.toFixed(4)),
      currencies,
    });
  } catch (error) {
    console.error("Error fetching currency rates:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch currency rates" });
  }
};
module.exports = { getCurrenciesRate };
