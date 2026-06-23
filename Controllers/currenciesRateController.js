const axios = require("axios");
const getCurrenciesRate = async (req, res) => {
  const getCurrenciesRate = async (req, res) => {
  try {
    const { base = "USD", symbols } = req.query;
    const symbolsParam = symbols ? `&symbols=${symbols}` : "";

    // Step 1: Get today's (latest available) rates
    const todayResponse = await axios.get(
      `https://api.frankfurter.app/latest?base=${base}${symbolsParam}`
    );
    const todayRates = todayResponse.data;
    const latestDate = new Date(todayRates.date); // e.g. "2026-06-23"

    // Step 2: Go back far enough to find the PREVIOUS business day's rates
    // Go back 3 days to safely skip weekends
    const prevDate = new Date(latestDate);
    prevDate.setDate(prevDate.getDate() - 3);
    const prevDateString = prevDate.toISOString().split("T")[0];

    // Step 3: Fetch a date range — Frankfurter will return business days in between
    // The first entry will be the business day just before latestDate
    const rangeResponse = await axios.get(
      `https://api.frankfurter.app/${prevDateString}..${todayRates.date}?base=${base}${symbolsParam}`
    );
    const rangeDates = Object.keys(rangeResponse.data.rates).sort();
    
    // The second-to-last date is the previous business day
    const previousBusinessDay = rangeDates[rangeDates.length - 2];
    const yesterdayRates = {
      rates: rangeResponse.data.rates[previousBusinessDay],
    };
    // ...rest of your logic unchanged
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
