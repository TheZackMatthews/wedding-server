const axios = require("axios");

async function getRegistryItem(req, res) {
  try {
    // Make API call to Google Sheets
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/Sheet2!A2:E9?key=${process.env.GOOGLE_API_KEY}`
    );
    const data = response.data;
    const rows = data?.values;

    // Return user data
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = getRegistryItem;
