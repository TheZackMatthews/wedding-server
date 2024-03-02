require("dotenv").config();
const axios = require("axios");

async function getUser(req, res) {
  try {
    const { userEmail } = req.query;

    // Ensure userEmail parameter is provided
    if (!userEmail) {
      return res.status(400).json({ error: "User email is required." });
    }

    // Make API call to Google Sheets
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/Sheet1!A2:D99?key=${process.env.GOOGLE_API_KEY}`
    );
    const data = response.data;
    const rows = data?.values;

    // Find user's row
    const userRowNumber = rows?.findIndex((row) => row[2] === userEmail);

    if (userRowNumber === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get user data
    const matchedUser = rows[userRowNumber];

    // Return user data
    return res.status(200).json(matchedUser);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = getUser;
