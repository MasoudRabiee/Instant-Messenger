const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);