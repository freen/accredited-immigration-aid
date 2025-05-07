const { extractData } = require('./gptExtractor');
const { logger } = require('../utils/logger');
const openai = require('openai');

jest.mock('../utils/logger');
jest.mock('openai');

describe('gptExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully extracts structured data from text', async () => {
    const mockText = 'Sample text for extraction';
    const mockResponse = { data: { choices: [{ text: '{"key": "value"}' }] } };
    openai.Completion.create.mockResolvedValue(mockResponse);

    const result = await extractData(mockText);

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(result).toEqual({ key: 'value' });
    expect(logger.info).toHaveBeenCalledWith('Data extraction successful');
  });

  test('handles API errors gracefully', async () => {
    const mockText = 'Sample text for extraction';
    const mockError = new Error('API error');
    openai.Completion.create.mockRejectedValue(mockError);

    await expect(extractData(mockText)).rejects.toThrow('Failed to extract data: API error');

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(logger.error).toHaveBeenCalledWith('Data extraction failed: API error');
  });

  test('handles empty input gracefully', async () => {
    const mockText = '';
    const mockResponse = { data: { choices: [{ text: '{}' }] } };
    openai.Completion.create.mockResolvedValue(mockResponse);

    const result = await extractData(mockText);

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(result).toEqual({});
    expect(logger.info).toHaveBeenCalledWith('Data extraction successful');
  });

  test('handles malformed API response', async () => {
    const mockText = 'Sample text for extraction';
    const mockResponse = { data: { choices: [{ text: 'Invalid JSON' }] } };
    openai.Completion.create.mockResolvedValue(mockResponse);

    await expect(extractData(mockText)).rejects.toThrow('Failed to parse API response');

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(logger.error).toHaveBeenCalledWith('Failed to parse API response');
  });

  // New test cases based on the actual PDF content
  test('extracts structured data from realistic PDF text', async () => {
    const mockText = `
      Organization: Immigration Aid Center
      Representative: John Doe
      State: California
      City: Los Angeles
    `;
    const mockResponse = {
      data: { choices: [{ text: '{"organization": "Immigration Aid Center", "representative": "John Doe", "state": "California", "city": "Los Angeles"}' }] },
    };
    openai.Completion.create.mockResolvedValue(mockResponse);

    const result = await extractData(mockText);

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(result).toEqual({
      organization: 'Immigration Aid Center',
      representative: 'John Doe',
      state: 'California',
      city: 'Los Angeles',
    });
    expect(logger.info).toHaveBeenCalledWith('Data extraction successful');
  });

  test('handles incomplete data gracefully', async () => {
    const mockText = `
      Organization: Immigration Aid Center
      Representative: John Doe
      State: California
    `;
    const mockResponse = {
      data: { choices: [{ text: '{"organization": "Immigration Aid Center", "representative": "John Doe", "state": "California", "city": null}' }] },
    };
    openai.Completion.create.mockResolvedValue(mockResponse);

    const result = await extractData(mockText);

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(result).toEqual({
      organization: 'Immigration Aid Center',
      representative: 'John Doe',
      state: 'California',
      city: null,
    });
    expect(logger.info).toHaveBeenCalledWith('Data extraction successful');
  });

  test('handles unexpected text format', async () => {
    const mockText = 'This is some random text that does not match the expected format.';
    const mockResponse = {
      data: { choices: [{ text: '{}' }] },
    };
    openai.Completion.create.mockResolvedValue(mockResponse);

    const result = await extractData(mockText);

    expect(openai.Completion.create).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: mockText })
    );
    expect(result).toEqual({});
    expect(logger.info).toHaveBeenCalledWith('Data extraction successful');
  });
});