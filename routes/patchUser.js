const axios = require("axios");
const jwt = require("jsonwebtoken");

async function patchUser(req, res) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || {});
  try {
    const { userEmail } = req.query;
    // TODO: Handle situation for updating email
    const { firstName, lastName, rsvp } = req.body;
    
    // Ensure all query parameters are provided
    if (!userEmail) {
      return res.status(400).json({
          error: "All query parameters are required: userEmail",
        });
    }
    
    // Ensure all query parameters are provided
    if (!firstName || !lastName || rsvp === undefined) {
        return res.status(400).json({
            error: "All query parameters are required: firstName, lastName, rsvp",
        });
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
      
      // Make API call to Google Sheets to get the current data
      let response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/Sheet1?key=${process.env.GOOGLE_API_KEY}`
      );
      const rows = response.data?.values;
      
      // Find user's row
      const userRowIndex = rows?.findIndex((row) => row[2] === userEmail);
      
      if (userRowIndex === -1) {
          return res.status(404).json({ error: `User not found: ${userEmail}` });
        }
        
        // Adding 1 because Sheets indexes from 1 instead of 0
        const range = `Sheet1!A${userRowIndex + 1}:D${userRowIndex + 1}`; 
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
        
        
    // Construct request body
    const requestBody = {
      values: [[firstName, lastName, userEmail, rsvp]],
    };

    // Send the update request
    response = await axios
      .put(updateUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(`Spreadsheet updated for user ${userEmail}:`, response.data);
      })
      .catch((error) => {
        console.error("Error updating spreadsheet:", error.response.data.error);
      });

    return res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = patchUser;
