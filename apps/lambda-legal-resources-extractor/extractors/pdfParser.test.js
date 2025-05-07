const pdfParse = require('pdf-parse');
const { parsePdf } = require('./pdfParser');
const { logger } = require('../utils/logger');

// filepath: lambda-legal-resources-extractor/extractors/pdfParser.test.js

jest.mock('pdf-parse');
jest.mock('../utils/logger');

describe('parsePdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully parses PDF buffer', async () => {
    const mockPdfBuffer = Buffer.from('mock pdf data');
    const mockParsedData = { text: 'Extracted text from PDF' };
    pdfParse.mockResolvedValue(mockParsedData);

    const result = await parsePdf(mockPdfBuffer);

    expect(pdfParse).toHaveBeenCalledWith(mockPdfBuffer);
    expect(result).toBe('Extracted text from PDF');
    expect(logger.info).toHaveBeenCalledWith('Beginning PDF text extraction');
    expect(logger.info).toHaveBeenCalledWith(
      'PDF text extracted successfully. Character count: 27'
    );
  });

  test('handles PDF parsing failure', async () => {
    const mockPdfBuffer = Buffer.from('mock pdf data');
    const mockError = new Error('Parsing error');
    pdfParse.mockRejectedValue(mockError);

    await expect(parsePdf(mockPdfBuffer)).rejects.toThrow(
      'Failed to extract text from PDF: Parsing error'
    );

    expect(pdfParse).toHaveBeenCalledWith(mockPdfBuffer);
    expect(logger.info).toHaveBeenCalledWith('Beginning PDF text extraction');
    expect(logger.error).toHaveBeenCalledWith('PDF parsing failed: Parsing error');
  });

  test('handles empty PDF buffer', async () => {
    const mockPdfBuffer = Buffer.from('');
    const mockParsedData = { text: '' };
    pdfParse.mockResolvedValue(mockParsedData);

    const result = await parsePdf(mockPdfBuffer);

    expect(pdfParse).toHaveBeenCalledWith(mockPdfBuffer);
    expect(result).toBe('');
    expect(logger.info).toHaveBeenCalledWith('Beginning PDF text extraction');
    expect(logger.info).toHaveBeenCalledWith(
      'PDF text extracted successfully. Character count: 0'
    );
  });

  test('cleans up excessive whitespace in extracted text', async () => {
    const mockPdfBuffer = Buffer.from('mock pdf data');
    const mockParsedData = { text: '   Text   with\n\nexcessive   whitespace   ' };
    pdfParse.mockResolvedValue(mockParsedData);

    const result = await parsePdf(mockPdfBuffer);

    expect(result).toBe('Text with excessive whitespace');
    expect(logger.info).toHaveBeenCalledWith(
      'PDF text extracted successfully. Character count: 29'
    );
  });
});