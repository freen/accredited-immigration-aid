const { downloadPdf } = require('./utils/downloader');
const { parsePdf } = require('./extractors/pdfParser');
const { structureWithGpt } = require('./extractors/gptExtractor');
const { getPreviousData, updateCurrentData } = require('./services/s3Service');
const { recordChanges } = require('./services/dynamoService');
const { detectChanges } = require('./utils/compareData');
const { logger } = require('./utils/logger');

/**
 * Main Lambda handler function - processes the DOJ OLAP R&A roster PDF
 */
exports.processLegalResourcesPdf = async (event, context) => {
  try {
    logger.info('Starting PDF processing job');
    
    // Download the PDF from DOJ website
    const pdfBuffer = await downloadPdf('https://www.justice.gov/eoir/page/file/942306/dl');
    logger.info('PDF downloaded successfully');
    
    // Extract raw text from PDF
    const rawText = await parsePdf(pdfBuffer);
    logger.info('PDF text extracted');
    
    // Use GPT to convert to structured data
    const structuredData = await structureWithGpt(rawText);
    logger.info('Data structured successfully');
    
    // Get the previous version from S3
    const previousData = await getPreviousData();
    
    // Detect changes between versions
    const { hasChanges, changeLog } = detectChanges(previousData, structuredData);
    
    if (hasChanges) {
      // Update the current version in S3
      await updateCurrentData(structuredData);
      logger.info('Updated current data in S3');
      
      // Record changes to DynamoDB
      await recordChanges(changeLog);
      logger.info('Recorded changes to history database');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Legal resources updated',
          changesDetected: Object.keys(changeLog).length
        })
      };
    } else {
      logger.info('No changes detected in legal resources');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No changes detected in legal resources'
        })
      };
    }
    
  } catch (error) {
    logger.error('Error processing PDF', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing legal resources',
        error: error.message
      })
    };
  }
};