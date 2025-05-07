// const pdfParse = require('pdf-parse');
const pdf2html = require('pdf2html');
const { logger } = require('../utils/logger');

/**
 * Extracts text from a PDF buffer
 * @param {String} filePath - Local path to the PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */
async function parsePdf(filePath) {
  try {
    logger.info(`Beginning PDF text extraction from ${filePath}`);
    // const data = await pdfParse(pdfBuffer);

    const html = await pdf2html.html(filePath);
    
    logger.info(`PDF text extracted successfully. Character count: ${html.length}`);
    return html;
  } catch (error) {
    logger.error(`PDF parsing failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  parsePdf
};