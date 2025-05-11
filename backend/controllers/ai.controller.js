// ai.controller.js
// Role: Handle AI-related HTTP requests by delegating to the AI service

import * as ai from "../services/ai.service.js";

/**
 * GET /ai/get-result
 * Protected route: expects auth middleware upstream
 * 
 * Expects 'prompt' as a query parameter, invokes the AI service,
 * and returns the generated content. Handles and reports errors.
 */
export const getResultController = async (req, res) => {
  try {
    // Extract the user-provided prompt text from the query string
    const { prompt } = req.query;

    // Delegate the prompt to the AI service and await the generated response
    const result = await ai.generateResult(prompt);

    // Return the raw AI-generated text/content to the client
    res.send(result);
  } catch (error) {
    // Log the error server-side for diagnostics
    console.error("AI generation error:", error);

    // Respond with 500 Internal Server Error and include error message
    res.status(500).json({ message: error.message });
  }
};
