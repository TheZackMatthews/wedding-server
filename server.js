const express = require("express");
const cors = require("cors");
const getUser = require("./routes/getUser");
const patchUser = require("./routes/patchUser");
const helloRoute = require("./routes/helloRoute");
const inviteCollaborator = require("./routes/inviteCollaborator");
const guestSuggestion = require("./routes/sendSongSuggestion");

const app = express();
const port = process.env.PORT || 8000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get("/users", getUser);

app.patch("/users", patchUser);

app.post("/music/collaborator", inviteCollaborator);

app.post("/music/song", guestSuggestion);

// Mounting the helloRoute
app.use("/", helloRoute);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
