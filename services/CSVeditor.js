import fs from "fs";
import csvParser from "csv-parser";
import logger from "../utils/logger.js";

/**
 * Parses a CSV file and returns data as an array of objects.
 * @param {string} CSV_FILE - Path to the CSV file.
 * @returns {Promise<Array>} - Parsed CSV data.
 */
export const parseCSV = async (CSV_FILE) => {
  return new Promise((resolve, reject) => {
    const results = [];

    logger.info(`Starting to parse CSV file: ${CSV_FILE}`);

    fs.createReadStream(CSV_FILE)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        logger.info(`Successfully parsed CSV file: ${CSV_FILE}, total records: ${results.length}`);
        resolve(results);
      })
      .on("error", (error) => {
        logger.error(`Error parsing CSV file: ${CSV_FILE} - ${error.message}`);
        reject(error);
      });
  });
};

/**
 * Updates the CSV file with new data.
 * @param {string} CSV_FILE - Path to the CSV file.
 * @param {Array<Object>} data - Array of objects representing CSV data.
 * @returns {Promise<void>}
 */
export const updateCSV = async (CSV_FILE, data) => {
    console.log("in the updateCSV",data);
    const filteredData = data.filter(item =>Object.keys(item).length>0);
  if (!filteredData.length) {
    logger.warn(`updateCSV called with empty data. Skipping update for ${CSV_FILE}`);
    return;
  }

  // Extract headers dynamically from the first row
  const headers = Object.keys(filteredData[0]);
  const csvContent = [headers.join(",")];

  // Convert each row into a CSV string
  filteredData.forEach((row) => {
    csvContent.push(
        headers.map((key) => 
            key === "Referrals" 
                ? `"${row[key]?.replace(/"/g, '""') || ""}"` 
                : row[key] || ""
        ).join(",")
    );
  });

  try {
    logger.info(`Writing ${data.length} records to CSV file: ${CSV_FILE}`);
    await fs.promises.writeFile(CSV_FILE, csvContent.join("\n"), "utf8");
    logger.info(`CSV file successfully updated: ${CSV_FILE}`);
  } catch (error) {
    logger.error(`Error writing to CSV file: ${CSV_FILE} - ${error.message}`);
    throw error;
  }
};
