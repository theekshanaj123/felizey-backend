const axios = require("axios");

const convertEventResCurrency = async (toCurrency, fromCurrency, price) => {
  try {
    // const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

    // const response = await axios.get(url);

    // const rates = response.data.rates;

    // if (!fromCurrency){
    //     fromCurrency == "USD";
    // }

    // if (!toCurrency){
    //     toCurrency = fromCurrency;
    // }

    // if (!rates[toCurrency]) {
    //     throw new Error(`Currency code "${toCurrency}" not found.`);
    // }

    // const convertedAmount = price * rates[toCurrency];

    // return {
    //     from: fromCurrency,
    //     to: toCurrency,
    //     originalAmount: price,
    //     convertedAmount: convertedAmount.toFixed(2),
    //     rate: rates[toCurrency].toFixed(6),
    //     date: response.data.date,
    // };

    return {
      from: fromCurrency,
      to: toCurrency,
      originalAmount: price,
      convertedAmount: price.toFixed(2),
      //   rate: rates[toCurrency].toFixed(6),
    };
  } catch (error) {
    console.error("Currency conversion error:", error.message);
    throw new Error("Failed to convert currency.");
  }
};

module.exports = {
  convertEventResCurrency,
};
