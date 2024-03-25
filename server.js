const express = require("express");
const cors = require("cors");
const patchUser = require("./routes/patchUser.js");
const inviteCollaborator = require("./routes/inviteCollaborator.js");
const helloRoute = require("./routes/helloRoute.js");
const guestSuggestion = require("./routes/sendSongSuggestion.js");
const getUser = require("./routes/getUser.js");
const getRegistryItems = require("./routes/getRegistryItems.js");
const saveDonation = require("./routes/saveDonation.js");

const app = express();
const port = process.env.PORT || 8000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get("/users", getUser);

app.get("/registry", getRegistryItems);

app.patch("/users", patchUser);

app.post("/music/collaborator", inviteCollaborator);

app.post("/music/song", guestSuggestion);

app.post("/paypal-transaction-complete", saveDonation);

// Mounting the helloRoute
app.use("/", helloRoute);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
