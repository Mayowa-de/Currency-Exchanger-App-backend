const axios = require("axios");
const getCurrenciesRate = async ({ res, req }) => {
  try {
    const { base = "USD" } = req.query;

    const todayResponse = await axios.get(
      `https://api.frankfurter.app/latest?from=${base}`,
    );
    const todayRates =await todayResponse.json();

    // const nameRes = await axios.get(`https://api.frankfurter.app/currencies`);
    // const currencyNames = nameRes.data;

    const yesterdayResponse = await fetch(`https://frankfurter.app/latest?from={base}`);
    const yesterdayRates = await yesterdayResponse.json();

    const yesterdayDate = new Date()
        .setDate(new Date().getDate() - 1);
    const yesterdayDateString = new Date(yesterdayDate).toISOString().split('T')[0];
    const yesterdayRate = yesterdayRates.rates[yesterdayDateString] || null;

    const { date, rates } = todayRates;
    const symbols = Object.keys(rates).join(",");
    const currencyNames = await axios.get(`https://api.frankfurter.app/currencies`).then(res => res.data);

    const currencies = Object.keys(rates).map((code) => ({
      code,
      name: currencyNames[code] || "Unknown Currency",
      rate: rates[code],
    }));
    res.status(200).json({
      date,
      base,
      direction: `${base} to ${symbols}`,
      symbolsRate: rates[symbols] || null,
      currencies,
    });
  } catch (error) {
    console.error("Error fetching currency rates:", error.message);
    res.status(500).json({ error: "Failed to fetch currency rates" });
  }
};
module.exports = { getCurrenciesRate };
