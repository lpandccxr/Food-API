require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));
app.use(cors());


app.listen(PORT, () => {
    console.log(`app running at "http://localhost:${PORT}"`);
  });