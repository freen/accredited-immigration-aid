const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { logger } = require('../utils/logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET;
const CURRENT_DATA_KEY = 'legal-resources/current-data.json';
const ARCHIVE_PREFIX = 'legal-resources/archive/';

/**
 * Retrieves the current version of the data from S3
 * @returns {Promise<Object>} - The current data as a JSON object
 */
async function getPreviousData() {
  try {
    logger.info(`Retrieving previous data from s3://${BUCKET_NAME}/${CURRENT_DATA_KEY}`);
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: CURRENT_DATA_KEY
    });
    
    const response = await s3Client.send(command);
    const bodyString = await streamToString(response.Body);
    
    logger.info('Successfully retrieved previous data');
    return JSON.parse(bodyString);
  } catch (error) {
    // If the file doesn't exist, return an empty data structure
    if (error.name === 'NoSuchKey') {
      logger.info('No previous data found, creating new dataset');
      return { organizations: [], metadata: { source: "DOJ OLAP R&A Roster" } };
    }
    
    logger.error(`Error retrieving previous data: ${error.message}`);
    throw new Error(`Failed to retrieve previous data: ${error.message}`);
  }
}

/**
 * Updates the current data in S3 and archives the previous version
 * @param {Object} data - The new data to store
 * @returns {Promise<void>}
 */
async function updateCurrentData(data) {
  try {
    // Add timestamp to the data
    const timestamp = new Date().toISOString();
    const dataToStore = {
      ...data,
      metadata: {
        ...data.metadata,
        updatedAt: timestamp
      }
    };
    
    // Store the data as the current version
    logger.info(`Updating current data in s3://${BUCKET_NAME}/${CURRENT_DATA_KEY}`);
    const currentCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: CURRENT_DATA_KEY,
      Body: JSON.stringify(dataToStore, null, 2),
      ContentType: 'application/json'
    });
    await s3Client.send(currentCommand);
    
    // Also store as an archive with timestamp
    const archiveKey = `${ARCHIVE_PREFIX}${timestamp.replace(/:/g, '-')}.json`;
    logger.info(`Archiving data snapshot to s3://${BUCKET_NAME}/${archiveKey}`);
    
    const archiveCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: archiveKey,
      Body: JSON.stringify(dataToStore, null, 2),
      ContentType: 'application/json'
    });
    await s3Client.send(archiveCommand);
    
    logger.info('Data update and archiving complete');
  } catch (error) {
    logger.error(`Error updating data in S3: ${error.message}`);
    throw new Error(`Failed to update data in S3: ${error.message}`);
  }
}

/**
 * Utility to convert a stream to a string
 * @param {Stream} stream - The stream to convert
 * @returns {Promise<string>} - The stream contents as a string
 */
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

module.exports = {
  getPreviousData,
  updateCurrentData
};