require("dotenv").config();
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
const { sendGridTemplates } = require("../constants");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function inviteCollaborator(req, res) {
  try {
    const { email } = req.body;

    // Check if firstName and email are provided
    if (!email) {
      return res
        .status(400)
        .json({ error: "Missing email in request body" });
    }

    // Make API call to Google Sheets for share URL
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/Sheet3!A2:A2?key=${process.env.GOOGLE_API_KEY}`
    );

    const data = response.data;
    const shareURL = data?.values[0];

    // SendGrid email data
    const msg = {
      to: email,
      from: "matthews.eide.wedding2024@gmail.com",
      templateId: sendGridTemplates.playlistInvite,
      dynamicTemplateData: {
        shareURL: shareURL,
      },
    };

    // Send email
    await sgMail.send(msg);

    res
      .status(200)
      .json({ success: true, message: "Invitation email sent successfully" });
  } catch (error) {
    console.error("Error sending invitation email:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send invitation email" });
  }
}

module.exports = inviteCollaborator;
