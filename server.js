const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const userRoute = require("./routes/user");
const foodRoute = require("./routes/food");

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

//routes
app.use("/users", userRoute);
app.use("/food", foodRoute);

app.listen(PORT, () => {
  console.log(`app running at "http://localhost:${PORT}"`);
});
