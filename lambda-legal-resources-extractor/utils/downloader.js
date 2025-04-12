const axios = require('axios');
const { logger } = require('./logger');

/**
 * Downloads a PDF from a URL and returns it as a buffer
 * @param {string} url - The URL of the PDF to download
 * @returns {Promise<Buffer>} - A promise that resolves to the PDF buffer
 */
async function downloadPdf(url) {
  try {
    logger.info(`Downloading PDF from ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    logger.info('PDF downloaded successfully');
    return Buffer.from(response.data);
  } catch (error) {
    logger.error(`Error downloading PDF: ${error.message}`);
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
}

module.exports = {
  downloadPdf
};