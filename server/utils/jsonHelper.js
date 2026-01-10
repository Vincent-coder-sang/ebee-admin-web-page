// server/utils/jsonHelper.js
/** @format */

// Helper to parse JSON from TEXT field
const parseJSONField = (fieldValue) => {
  if (!fieldValue) return {};
  
  if (typeof fieldValue === 'string') {
    try {
      return JSON.parse(fieldValue);
    } catch (error) {
      // If it's not valid JSON, return as text
      return { text: fieldValue };
    }
  }
  
  // If it's already an object (might happen with getters)
  return fieldValue;
};

// Helper to stringify object to JSON string
const stringifyJSONField = (fieldValue) => {
  if (typeof fieldValue === 'object' || Array.isArray(fieldValue)) {
    try {
      return JSON.stringify(fieldValue);
    } catch (error) {
      return JSON.stringify({ error: 'Failed to stringify object' });
    }
  }
  
  // If it's already a string, check if it's valid JSON
  if (typeof fieldValue === 'string') {
    try {
      JSON.parse(fieldValue);
      return fieldValue; // Already valid JSON string
    } catch (error) {
      // Wrap in JSON object
      return JSON.stringify({ text: fieldValue });
    }
  }
  
  // For other types (number, boolean, etc.)
  return JSON.stringify({ value: fieldValue });
};

// Process report data before sending to frontend
const processReportForResponse = (report) => {
  if (!report) return null;
  
  const processed = { ...report.dataValues || report };
  
  // Parse JSON fields
  if (processed.content) {
    processed.content = parseJSONField(processed.content);
  }
  
  if (processed.filters) {
    processed.filters = parseJSONField(processed.filters);
  }
  
  return processed;
};

// Process multiple reports
const processReportsForResponse = (reports) => {
  if (!Array.isArray(reports)) return [];
  
  return reports.map(report => processReportForResponse(report));
};

module.exports = {
  parseJSONField,
  stringifyJSONField,
  processReportForResponse,
  processReportsForResponse
};