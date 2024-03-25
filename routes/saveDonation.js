require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");

async function saveDonation(req, res) {
  const serviceAccount = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS || {}
  );
  try {
    const { amounts, itemNames, payerEmail } = req.body;

    // Check if firstName and email are provided
    if (!amounts || !itemNames) {
      return res
        .status(400)
        .json({ error: "Missing anount or itemNames in request body" });
    }

    if (!amounts.some(amount => amount > 0)) {
        return res
          .status(400)
          .json({ error: "At least one donation amount must be greater than 0" });
    }

    // Create JWT for authorization
    const privateKey = serviceAccount.private_key?.replace(/\\n/g, "\n");

    const currentTime = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        iss: serviceAccount.client_email,
        sub: serviceAccount.client_email,
        aud: "https://sheets.googleapis.com/",
        iat: currentTime,
        exp: currentTime + 3600, // Token valid for 1 hour
      },
      privateKey,
      { algorithm: "RS256" }
    );

    // Make API call to Google Sheets
    const resp = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/Sheet2!A2:E9?key=${process.env.GOOGLE_API_KEY}`
    );
    const data = resp.data;
    const rows = data?.values;

    if (!rows) {
      return res.status(500).json({ error: "Unable to get registry items." });
    }

    const updatedRows = rows;
    for (let i = 0; i < itemNames.length; i++) {
      const itemName = itemNames[i];
      const amount = amounts[i];
      // Find user's row
      const itemRowIndex = rows?.findIndex((row) => row[0] === itemName);

      if (itemRowIndex === -1) {
        return res
          .status(404)
          .json({ error: `Item ${itemName} not found in registry.` });
      }
      // Get the "Gifted Dollars" for the row, and add the amount
      const giftedDollars = parseInt(rows[itemRowIndex][4]);
      const newGiftedDollars =
        (isNaN(giftedDollars) ? 0 : giftedDollars) + parseInt(amount);
      updatedRows[itemRowIndex][4] = newGiftedDollars.toString();
      console.log(`Contribution to ${itemName} by ${payerEmail} ${giftedDollars}->${newGiftedDollars}`);
    }

    console.table(updatedRows);

    const range = "Sheet2!A2:E9";
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;

    const requestBody = {
      values: updatedRows,
    };

    // Send the update request
    response = await axios
      .put(updateUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        console.log(
          `Spreadsheet updated for items [${itemNames}] thanks to ${
            payerEmail ?? "Unknown"
          }`
        );
      })
      .catch((error) => {
        console.error("Error updating spreadsheet:", error.response);
      });

    return res.status(200).json(updatedRows);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = saveDonation;
