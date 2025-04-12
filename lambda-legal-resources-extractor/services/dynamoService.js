const { DynamoDBClient, PutItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const TABLE_NAME = process.env.DYNAMO_TABLE || 'legal-resources-history';

/**
 * Records changes to organizations in DynamoDB for historical tracking
 * @param {Object} changeLog - Object containing changes to organizations
 * @returns {Promise<void>}
 */
async function recordChanges(changeLog) {
  try {
    logger.info(`Recording ${Object.keys(changeLog.changes).length} changes to DynamoDB`);
    
    const timestamp = new Date().toISOString();
    const batchId = uuidv4();
    
    // For small change sets, write directly
    if (Object.keys(changeLog.changes).length <= 25) {
      await writeBatchChanges(changeLog.changes, timestamp, batchId);
    } else {
      // For larger change sets, break into batches of 25 (DynamoDB limit)
      const changeEntries = Object.entries(changeLog.changes);
      
      for (let i = 0; i < changeEntries.length; i += 25) {
        const batchChanges = Object.fromEntries(changeEntries.slice(i, i + 25));
        await writeBatchChanges(batchChanges, timestamp, batchId);
      }
    }
    
    // Also record a summary entry
    await writeSummaryEntry(changeLog, timestamp, batchId);
    
    logger.info('Successfully recorded changes to history database');
  } catch (error) {
    logger.error(`Error recording changes to DynamoDB: ${error.message}`);
    throw new Error(`Failed to record changes: ${error.message}`);
  }
}

/**
 * Writes a batch of changes to DynamoDB
 * @param {Object} changes - Changes to write
 * @param {string} timestamp - ISO timestamp
 * @param {string} batchId - UUID for this batch of changes
 * @returns {Promise<void>}
 */
async function writeBatchChanges(changes, timestamp, batchId) {
  try {
    const writeRequests = Object.entries(changes).map(([orgName, change]) => ({
      PutRequest: {
        Item: marshall({
          id: `org#${orgName.replace(/[^a-zA-Z0-9]/g, '-')}`,
          timestamp: timestamp,
          batchId: batchId,
          organizationName: orgName,
          changeType: change.type, // 'added', 'removed', 'modified'
          details: change.details || {},
          source: 'DOJ OLAP R&A Roster'
        })
      }
    }));
    
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [TABLE_NAME]: writeRequests
      }
    });
    
    await dynamoClient.send(command);
  } catch (error) {
    logger.error(`Error writing batch changes to DynamoDB: ${error.message}`);
    throw error;
  }
}

/**
 * Writes a summary entry to DynamoDB
 * @param {Object} changeLog - Full change log
 * @param {string} timestamp - ISO timestamp
 * @param {string} batchId - UUID for this batch
 * @returns {Promise<void>}
 */
async function writeSummaryEntry(changeLog, timestamp, batchId) {
  try {
    const summary = {
      added: Object.values(changeLog.changes).filter(c => c.type === 'added').length,
      removed: Object.values(changeLog.changes).filter(c => c.type === 'removed').length,
      modified: Object.values(changeLog.changes).filter(c => c.type === 'modified').length
    };
    
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall({
        id: `summary#${batchId}`,
        timestamp: timestamp,
        batchId: batchId,
        summary: summary,
        source: 'DOJ OLAP R&A Roster',
        totalChanges: Object.keys(changeLog.changes).length
      })
    });
    
    await dynamoClient.send(command);
  } catch (error) {
    logger.error(`Error writing summary to DynamoDB: ${error.message}`);
    throw error;
  }
}

module.exports = {
  recordChanges
};