const fs = require("fs");

function appendStatsColumns(
  inputCsvPath,
  outputCsvPath = "result_with_stats.csv",
) {
  const raw = fs.readFileSync(inputCsvPath, "utf-8");
  const { header, rows } = parseCsv(raw);

  const TARGET_COLUMN = "time from release to release";

  if (!header.includes(TARGET_COLUMN)) {
    throw new Error(`Column "${TARGET_COLUMN}" not found in CSV`);
  }

  // Extract numeric values only
  const values = rows
    .map((r) => Number(r[TARGET_COLUMN]))
    .filter((v) => Number.isFinite(v));

  if (values.length === 0) {
    throw new Error("No valid numeric values found for statistics");
  }

  const mean = calculateMean(values);
  const stddev = calculateStdDev(values, mean);

  // Append new columns
  header.push(
    "mean time from release to release",
    "stddev time from release to release",
  );

  const processedRows = rows.map((row) => ({
    ...row,
    "mean time from release to release": mean,
    "stddev time from release to release": stddev,
  }));

  writeCsv(header, processedRows, outputCsvPath);
}

/* ---------- helpers ---------- */

function calculateMean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Sample standard deviation (n - 1)
 * Use population SD by removing the -1 if needed
 */
function calculateStdDev(values, mean) {
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    (values.length - 1);

  return Math.sqrt(variance);
}

function parseCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines
    .shift()
    .split(",")
    .map((h) => h.trim());

  const rows = lines.map((line) => {
    const values = line.split(",");
    const record = {};
    header.forEach((h, i) => {
      record[h] = values[i]?.trim() ?? "";
    });
    return record;
  });

  return { header, rows };
}

function writeCsv(header, rows, outputPath) {
  const lines = [
    header.join(","),
    ...rows.map((row) => header.map((h) => row[h]).join(",")),
  ];

  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
}

module.exports = { appendStatsColumns };

// Example usage:
appendStatsColumns(
  "./outputDiscrete/aggregatedDiscrete.csv",
  "./outputDiscrete/aggregatedDiscrete=mean=and-sd-for-table.csv",
);
