require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { adminEmail, sendGridTemplates } = require("../constants");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendSongSuggestion(req, res) {
  try {
    const { email, suggestion } = req.body;

    // Check if firstName and email are provided
    if (!email || !suggestion) {
      return res
        .status(400)
        .json({ error: "Missing email or suggestion in request body" });
    }

    // SendGrid email data
    const msg = {
      to: adminEmail,
      from: "matthews.eide.wedding2024@gmail.com",
      templateId: sendGridTemplates.guestSuggestion,
      dynamicTemplateData: {
        userEmail: email,
        suggestion: suggestion,
      },
    };

    // Send email
    await sgMail.send(msg);

    res
      .status(200)
      .json({ success: true, message: "Suggestion email sent successfully" });
  } catch (error) {
    console.error("Error sending suggestion email:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send suggestion email" });
  }
}

module.exports = sendSongSuggestion;
