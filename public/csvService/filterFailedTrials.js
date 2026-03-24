const fs = require("fs");
const path = require("path");
const { add } = require("nodemon/lib/rules");

// Function to process CSV and add Failed Threshold column

function addFailedThresholdColumn(csvContent) {
  const rows = csvContent
    .trim()
    .split("\n")
    .filter((row) => row.trim() !== "");

  const headers = rows[0].split(",").map((header) => header.trim());

  const pressIndex = headers.indexOf("D4_D1_rect2_Release_rect1_Press_px");
  const amplitudeIndex = headers.indexOf("amplitudePx"); // Note: Check capitalization carefully

  if (pressIndex === -1 || amplitudeIndex === -1) {
    throw new Error("Required columns not found in CSV.");
  }

  // Add the new header at the end of the header row
  headers.push("Failed Threshold");

  const processedRows = rows.slice(1).map((row) => {
    const cols = row.split(",").map((col) => col.trim());

    const pressValue = parseFloat(cols[pressIndex]);
    const amplitudeValue = parseFloat(cols[amplitudeIndex]);

    const failed = pressValue < amplitudeValue / 2;

    cols.push(failed.toString());

    return cols.join(",");
  });

  return [headers.join(","), ...processedRows].join("\n");
}

function addFailedThresholdCountRow(csvContent) {
  const rows = csvContent
    .trim()
    .split("\n")
    .filter((row) => row.trim() !== "");

  const headers = rows[0].split(",").map((header) => header.trim());
  const failedIndex = headers.indexOf("Failed Threshold");

  if (failedIndex === -1) {
    throw new Error("Failed Threshold column not found in CSV.");
  }

  // Count how many rows have Failed Threshold == true
  let failedCount = 0;
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(",").map((col) => col.trim());
    if (cols[failedIndex] === "true") {
      failedCount++;
    }
  }

  // Add summary row at the end
  const summaryRow = `Count Threshold Failed,${failedCount}`;
  return rows.join("\n") + "\n" + summaryRow;
}

function removeFailedRows(csvContent) {
  const rows = csvContent
    .trim()
    .split("\n")
    .filter((row) => row.trim() !== "");

  const headers = rows[0].split(",").map((header) => header.trim());
  const failedIndex = headers.indexOf("Failed Threshold");

  if (failedIndex === -1) {
    throw new Error("Failed Threshold column not found in CSV.");
  }
  const filteredRows = rows.filter((row, index) => {
    if (index === 0) return true; // Keep header row
    const cols = row.split(",").map((col) => col.trim());
    return cols[failedIndex] !== "true";
  });

  return filteredRows.join("\n");
}

// Main function to read, process, and write CSV
function filterFailedTrials(inputFilePath, outputFilePath) {
  try {
    const csvContent = fs.readFileSync(inputFilePath, "utf8");
    const processedCsv = processCSV(csvContent);

    fs.writeFileSync(outputFilePath, processedCsv, "utf8");
    console.log(`Cleaned CSV written to: ${outputFilePath}`);
  } catch (error) {
    console.error("Error processing CSV:", error.message);
  }
}

function processCSV(csvContent) {
  const result1 = addFailedThresholdColumn(csvContent);
  const result2 = addFailedThresholdCountRow(result1);
  const removeRows = removeFailedRows(result2);
  return removeRows;
}

module.exports = { filterFailedTrials };
// Example usage
const inputFilePath = path.join(__dirname, "input.csv");
const outputFilePath = path.join(__dirname, "inputFiltered.csv");

//filterFailedTrials(inputFilePath, outputFilePath);
