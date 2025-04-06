
import { MistralClient } from '@mistralai/mistralai';
import { log, LogLevel } from './logger';

const client = new MistralClient(
  process.env.MISTRAL_API_KEY || 'mock-key-for-testing'
);

interface MistralOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export async function generateMistralAnalysis(
  content: string,
  options: MistralOptions = {}
): Promise<string> {
  try {
    const model = options.model || 'mistral-large-latest';
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 4096;

    log('Starting Mistral analysis...', LogLevel.INFO, {
      contentLength: content.length,
      model,
      temperature,
      maxTokens
    });

    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY === 'mock-key-for-testing') {
      log('Using mock Mistral response due to missing API key', LogLevel.WARN);
      // Return mock response for testing
      return `MOCK MISTRAL ANALYSIS:
      
Content Analysis:
This text explores [mock subject] with several key theoretical frameworks.

Main Concepts:
1. [Mock concept 1] - Description of relationship to primary theories
2. [Mock concept 2] - Exploration of applications and implications
3. [Mock concept 3] - Analysis of structural patterns and emergent properties

Integration Points:
- Relationship to existing theories in [mock field]
- Potential applications in [mock domain]
- Theoretical extensions and novel frameworks`;
    }

    const response = await client.chat({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a sophisticated research and deep analysis system specializing in pattern recognition, theoretical frameworks, and structural analysis. Analyze the given content thoroughly and return a structured, detailed analysis that extracts core concepts, identifies patterns, and recognizes theoretical frameworks.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    });

    log('Mistral analysis completed', LogLevel.INFO, {
      model: model,
      responseTokens: response.usage?.completion_tokens || 0
    });

    return response.choices[0].message.content;
  } catch (error) {
    log('Error in Mistral processing', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function generateMistralCreativeContent(
  prompt: string,
  options: MistralOptions = {}
): Promise<string> {
  try {
    const model = options.model || 'mistral-large-latest';
    const temperature = options.temperature || 0.85;
    const maxTokens = options.maxTokens || 2048;

    log('Starting Mistral creative generation...', LogLevel.INFO, {
      promptLength: prompt.length,
      model,
      temperature,
      maxTokens
    });

    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY === 'mock-key-for-testing') {
      log('Using mock Mistral creative response due to missing API key', LogLevel.WARN);
      // Return mock response for testing
      return `MOCK MISTRAL CREATIVE CONTENT:
      
Visual Sequence:
A series of interconnected nodes representing [mock concept] that gradually transforms into [mock visual metaphor], with emphasis on the transitional states between order and chaos.

Metaphorical Framework:
The underlying structure resembles [mock natural pattern] with [mock characteristic] properties emerging at different scales.

Implementation Notes:
Color palette should transition from [mock color scheme] to emphasize the conceptual shift.
Camera movement should follow a [mock movement pattern] to highlight key transitional moments.`;
    }

    const response = await client.chat({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a creative director specializing in translating abstract concepts into visual metaphors and narrative structures. Create detailed, evocative descriptions that can be visualized through generative AI or traditional visual media.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    });

    log('Mistral creative generation completed', LogLevel.INFO, {
      model: model,
      responseTokens: response.usage?.completion_tokens || 0
    });

    return response.choices[0].message.content;
  } catch (error) {
    log('Error in Mistral creative processing', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function performMistralMultiAnalysis(
  content: string,
  systemPrompts: string[],
  options: MistralOptions = {}
): Promise<string[]> {
  try {
    const model = options.model || 'mistral-large-latest';
    const temperature = options.temperature || 0.5;
    const maxTokens = options.maxTokens || 2048;

    log('Starting Mistral multi-analysis...', LogLevel.INFO, {
      contentLength: content.length,
      promptCount: systemPrompts.length,
      model
    });

    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY === 'mock-key-for-testing') {
      log('Using mock Mistral multi-analysis responses due to missing API key', LogLevel.WARN);
      // Return mock responses for testing
      return systemPrompts.map((prompt, index) => 
        `MOCK MISTRAL ANALYSIS #${index + 1}:
        
System Prompt: ${prompt.substring(0, 50)}...

Analysis:
The content demonstrates [mock finding ${index + 1}] with significant implications for [mock field].
Key patterns include [mock pattern] and [mock structure].
Potential applications include [mock application 1] and [mock application 2].`
      );
    }

    const responses = await Promise.all(
      systemPrompts.map(async (systemPrompt) => {
        const response = await client.chat({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        });

        return response.choices[0].message.content;
      })
    );

    log('Mistral multi-analysis completed', LogLevel.INFO, {
      model: model,
      responseCount: responses.length
    });

    return responses;
  } catch (error) {
    log('Error in Mistral multi-analysis', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
