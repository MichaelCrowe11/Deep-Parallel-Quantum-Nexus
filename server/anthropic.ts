import Anthropic from '@anthropic-ai/sdk';
import logger, { LogLevel } from './logger';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processThought(content: string): Promise<{
  analysis: string;
  scenePrompts: string[];
  reasoningSteps: any;
}> {
  try {
    logger.info('Starting Claude thought processing...');
    logger.debug('Input content:', { content });

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `As a deep reasoning AI, analyze this research thought and break it down into detailed scene prompts for visual experimentation. Follow these steps:

1. First, perform deep analysis of the core concepts and implications
2. Then, identify key visual elements and experimental scenarios
3. Finally, generate multiple scene prompts that explore different aspects

Research thought: ${content}

Respond with ONLY a JSON object in this exact format:
{
  "analysis": "Your detailed breakdown of the thought",
  "scenePrompts": ["Scene 1 description", "Scene 2 description"],
  "reasoningSteps": ["Step 1: ...", "Step 2: ..."]
}

Important:
- Do not include any explanatory text before or after the JSON
- Do not use backticks or code block markers
- Make sure to use double quotes for all strings
- Each scene prompt should be highly detailed and visually descriptive`
      }]
    });

    logger.info('Claude API response received');

    // Check if the content is a text block and extract text
    if (!response.content[0] || !('text' in response.content[0])) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    const content2 = response.content[0].text;
    logger.debug('Raw response content:', { content: content2 });

    let parsedResponse;
    try {
      // Clean up the response to ensure it's valid JSON
      const jsonStr = content2.trim()
        .replace(/```json\n?/g, '')  // Remove JSON code block markers
        .replace(/```\n?/g, '')      // Remove closing code block
        .replace(/^\{|\}$/g, '')     // Remove leading/trailing braces if they're part of text
        .trim();

      parsedResponse = JSON.parse(`{${jsonStr}}`);

      logger.info('Successfully parsed Claude response', {
        hasAnalysis: Boolean(parsedResponse.analysis),
        numScenePrompts: parsedResponse.scenePrompts?.length || 0,
        numSteps: parsedResponse.reasoningSteps?.length || 0
      });
    } catch (e: any) { // Type assertion for the error
      logger.error('Failed to parse Claude response', { 
        error: e,
        rawResponse: content2
      });
      throw new Error(`Invalid response format from Claude: ${e.message}`);
    }

    // Validate response structure
    if (!parsedResponse.analysis || !Array.isArray(parsedResponse.scenePrompts)) {
      logger.error('Invalid response structure', { parsedResponse });
      throw new Error('Invalid response structure from Claude - missing required fields');
    }

    return {
      analysis: parsedResponse.analysis,
      scenePrompts: parsedResponse.scenePrompts,
      reasoningSteps: parsedResponse.reasoningSteps || []
    };
  } catch (error) {
    logger.error('Error in Claude processing', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function enhanceScene(description: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Enhance this scene description with cinematic details, focusing on:
- Visual composition and lighting
- Emotional atmosphere
- Key experimental elements
- Potential symbolic representations

Scene: ${description}

Provide a detailed, visual description that could be used for AI video generation.`
      }]
    });

    // Check if the content is a text block and extract text
    if (!response.content[0] || !('text' in response.content[0])) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    return response.content[0].text || '';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to enhance scene: ${errorMessage}`);
  }
}

export async function generateScript(scenes: string[]): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Create a cohesive experimental narrative script that:
- Connects these research-based scenes
- Maintains scientific integrity
- Builds visual and thematic connections
- Emphasizes the experimental nature

Scenes:\n\n${scenes.join('\n\n')}`
      }]
    });

    // Check if the content is a text block and extract text
    if (!response.content[0] || !('text' in response.content[0])) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    return response.content[0].text || '';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate script: ${errorMessage}`);
  }
}

export async function analyzeSceneSequence(scenes: string[]): Promise<{
  analysis: string;
  suggestions: string[];
}> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Analyze this sequence of experimental scenes and provide insights on narrative flow and visual coherence, along with suggestions for improvement:\n\n${scenes.join('\n\n')}`
      }]
    });

    // Check if the content is a text block and extract text
    if (!response.content[0] || !('text' in response.content[0])) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    const content = response.content[0].text;
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content.trim());
    } catch (e: any) {
      logger.error('Failed to parse scene sequence analysis', { error: e });
      throw new Error('Invalid response format from Claude');
    }

    return {
      analysis: parsedResponse.analysis || '',
      suggestions: parsedResponse.suggestions || []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze scene sequence: ${errorMessage}`);
  }
}