const express = require("express");
const compression = require("compression");
const app = express();
const validator = require("validator");
const path = require("path");
const fs = require("fs");

const filePath = `${new Date().toISOString()}.csv`;

app.use(compression());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "start.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
Server is running on port ${PORT}. Visit http://localhost:${PORT}/

Press Ctrl + C to stop the server.`);
});

app.use(express.text({ type: "text/csv" })); // Middleware for CSV (plain text)

app.post(`/write-csv/:number`, (req, res) => {
  const csvRow = req.body; // The new CSV row sent from the client
  const user = req.params.number;

  if (!validator.isNumeric(user)) {
    return res.status(400).send("Invalid user parameter.");
  }

  const filePathToWrite = path.join(
    __dirname,
    "public/logs",
    `user_${user}_${filePath}_write`,
  );
  fs.writeFile(filePathToWrite, csvRow, (err) => {
    if (err) {
      console.error("Error overriding the file", err); // Log the error
      return res.status(500).send("Error override the CSV file.");
    }
    res.send("CSV file override successfully!");
  });
});

app.post(`/append-csv/:number`, (req, res) => {
  const csvRow = req.body; // The new CSV row sent from the client
  const user = req.params.number;

  if (!validator.isNumeric(user)) {
    return res.status(400).send("Invalid user parameter.");
  }

  const filePathToWrite = path.join(
    __dirname,
    "public/logs",
    `user_${user}_${filePath}_append`,
  );
  fs.appendFile(filePathToWrite, csvRow, (err) => {
    if (err) {
      console.error("Error appending CSV row:", err); // Log the error
      return res.status(500).send("Error override the CSV file.");
    }
    res.send("CSV row append successfully!");
  });
});
