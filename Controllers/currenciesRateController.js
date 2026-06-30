const axios = require("axios");

const getCurrenciesRate = async (req, res) => {
  try {
    const { base = "USD", symbols } = req.query;
    const symbolsParam = symbols ? `&symbols=${symbols}` : "";

    //  Get latest rates
    const todayResponse = await axios.get(
      `https://api.frankfurter.app/latest?base=${base}${symbolsParam}`
    );
    const todayRates = todayResponse.data;
    const latestDate = todayRates.date;

    //  Fetch a 3-day range to capture the previous business day
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - 3);
    const startDateStr = startDate.toISOString().split("T")[0];

    const rangeResponse = await axios.get(
      `https://api.frankfurter.app/${startDateStr}..${latestDate}?base=${base}${symbolsParam}`
    );

    const rangeDates = Object.keys(rangeResponse.data.rates).sort();


    //  need at least 2 dates to calculate change
    if (rangeDates.length < 2) {
      return res.status(200).json({
        rate: null,
        base,
        direction: "no change",
        percentageChange: 0,
        currencies: [],
      });
    }

    const previousDate = rangeDates[rangeDates.length - 2];
    const previousRates = {[base]: 1, ...rangeResponse.data.rates[previousDate]};

    const rates = {[base]: 1, ...todayRates.rates};
    const symbolKeys = Object.keys(rates);
    const primarySymbol = symbolKeys[0];
    const todayRateValue = primarySymbol ? rates[primarySymbol] : null;
    const yesterdayRateValue = primarySymbol ? previousRates[primarySymbol] : null;

    const percentageChange = yesterdayRateValue
      ? ((todayRateValue - yesterdayRateValue) / yesterdayRateValue) * 100
      : 0;

    const currencies = symbolKeys.map((code) => {
      const currentRate = rates[code];
      const previousRate = previousRates[code];
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
