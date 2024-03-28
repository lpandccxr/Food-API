const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const userRoute = require("./routes/user");

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

//routes
app.use("/users", userRoute);

// Specific route for the font with an explicit MIME type
app.get("/static/media/Quicksand-Regular.woff2", function (req, res) {
  res.type("font/woff2");
  res.sendFile(path.join(__dirname, "./public/fonts/Quicksand-Regular.woff2"));
});
app.get("/static/media/Quicksand-SemiBold.woff2", function (req, res) {
  res.type("font/woff2");
  res.sendFile(path.join(__dirname, "./public/fonts/Quicksand-SemiBold.woff2"));
});
app.get("/static/media/Quicksand-Bold.woff2", function (req, res) {
  res.type("font/woff2");
  res.sendFile(path.join(__dirname, "./public/fonts/Quicksand-Bold.woff2"));
});

app.listen(PORT, () => {
  console.log(`app running at "http://localhost:${PORT}"`);
});
