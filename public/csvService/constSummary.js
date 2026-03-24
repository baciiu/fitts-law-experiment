const fs = require("fs");

function createConstellationSummary(inputCsvPath, outputCsvPath) {
  const raw = fs.readFileSync(inputCsvPath, "utf-8");
  const { rows } = parseCsv(raw);

  const VALUE_COLUMN = "time from release to release";
  const CONST_NR_COLUMN = "constNr";
  const CONST_STRING_COLUMN = "constStr";

  // --- group data by constNr ---
  const groups = {};

  for (const row of rows) {
    const constNr = row[CONST_NR_COLUMN];
    const constellation = row[CONST_STRING_COLUMN];
    const value = Number(row[VALUE_COLUMN]);

    if (!Number.isFinite(value)) continue;

    if (!groups[constNr]) {
      groups[constNr] = {
        constellation,
        values: [],
      };
    }

    groups[constNr].values.push(value);
  }

  // --- compute summary rows ---
  const summaryRows = [];

  for (const [constNr, data] of Object.entries(groups)) {
    if (data.values.length < 2) continue; // stddev undefined for n < 2

    const mean = calculateMean(data.values);
    const stddev = calculateStdDev(data.values, mean);

    summaryRows.push({
      constNr,
      constellation: data.constellation,
      "mean time from release to release": mean,
      "stddev time from release to release": stddev,
    });
  }

  // --- write CSV ---
  const header = [
    "constNr",
    "constellation",
    "mean time from release to release",
    "stddev time from release to release",
  ];

  writeCsv(header, summaryRows, outputCsvPath);
}

function appendRect2XDiffStatsToSummary(
  trialCsvPath,
  summaryCsvPath,
  outputCsvPath,
) {
  // --- read files ---
  const trialRaw = fs.readFileSync(trialCsvPath, "utf-8");
  const summaryRaw = fs.readFileSync(summaryCsvPath, "utf-8");

  const { rows: trialRows } = parseCsv(trialRaw);
  const { header: summaryHeader, rows: summaryRows } = parseCsv(summaryRaw);

  const VALUE_COLUMN = "rect2_release_x_diff";
  const GROUP_COLUMN = "constNr";

  // --- group rect2 X diffs by constNr ---
  const valuesByConstNr = {};

  for (const row of trialRows) {
    const constNr = row[GROUP_COLUMN];
    const value = Number(row[VALUE_COLUMN]);

    if (!Number.isFinite(value)) continue;

    if (!valuesByConstNr[constNr]) {
      valuesByConstNr[constNr] = [];
    }

    valuesByConstNr[constNr].push(value);
  }

  // --- compute stats per constNr ---
  const statsByConstNr = {};

  for (const [constNr, values] of Object.entries(valuesByConstNr)) {
    if (values.length < 2) continue;

    const mean = calculateMean(values);
    const stddev = calculateStdDev(values, mean);

    statsByConstNr[constNr] = { mean, stddev };
  }

  // --- append columns to summary ---
  summaryHeader.push("mean_rect2_x_diff", "stddev_rect2_x_diff");

  const updatedSummaryRows = summaryRows.map((row) => {
    const stats = statsByConstNr[row.constNr];

    return {
      ...row,
      mean_rect2_x_diff: stats ? stats.mean : "",
      stddev_rect2_x_diff: stats ? stats.stddev : "",
    };
  });

  writeCsv(summaryHeader, updatedSummaryRows, outputCsvPath);
}

/* ---------- helpers ---------- */

function calculateMean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Sample standard deviation (n - 1)
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

module.exports = { createConstellationSummary };

/* Example usage:
createConstellationSummary(
  "./outputReciprocal/aggregatedReciprocal.csv",
  "./outputReciprocal/constellation_summary.csv",
);
*/

/*
appendRect2XDiffStatsToSummary(
  "./outputDiscrete/aggregatedDiscreteWithDiff.csv",
  "./outputDiscrete/constellation_summary.csv",
  "./outputDiscrete/constellation_summary_with_x_diff_stats.csv",
);
*/

appendRect2XDiffStatsToSummary(
  "./outputReciprocal/aggregatedReciprocalWithDiff.csv",
  "./outputReciprocal/constellation_summary.csv",
  "./outputReciprocal/constellation_summary_with_x_diff_stats.csv",
);
