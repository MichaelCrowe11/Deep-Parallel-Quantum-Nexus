import { log, LogLevel } from './logger';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: Array<{
    url: string;
    text: string;
  }>;
}

interface ThoughtAnalysis {
  analysis: string;
  citations?: Array<{
    url: string;
    text: string;
  }>;
}

// Initial research prompts that generate deep thoughts
const RESEARCH_PROMPTS = [
  "Explore how quantum entanglement could be visualized in experimental art",
  "Investigate the patterns of emergence in complex adaptive systems",
  "Analyze the relationship between fractal mathematics and natural growth patterns",
  "Study the visual representation of neural network decision boundaries",
  "Examine the intersection of chaos theory and creative processes",
];

const API_URL = 'https://api.perplexity.ai/chat/completions';

export async function generateInitialThoughts(prompt: string): Promise<ThoughtAnalysis> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a deep reasoning engine focused on generating profound research insights and experimental hypotheses.'
          },
          {
            role: 'user',
            content: `Generate deep analytical thoughts about: ${prompt}\n\nProvide detailed reasoning, experimental implications, and potential visual representations.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json() as PerplexityResponse;

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Perplexity API');
    }

    return {
      analysis: data.choices[0].message.content,
      citations: data.citations
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze thought: ${errorMessage}`);
  }
}

export async function analyzeThought(thought: string): Promise<ThoughtAnalysis> {
  try {
    log('Starting Perplexity analysis...', LogLevel.INFO);
    log('Input thought:', LogLevel.DEBUG, { content: thought });

    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not set');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a deep reasoning engine focused on generating profound research insights and experimental hypotheses.'
          },
          {
            role: 'user',
            content: `Analyze this research thought deeply and provide detailed reasoning:\n\n${thought}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('Perplexity API error response', LogLevel.ERROR, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json() as PerplexityResponse;
    log('Perplexity API response received', LogLevel.INFO, {
      hasChoices: Boolean(data.choices?.length),
      citationsCount: data.citations?.length || 0
    });

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Perplexity API');
    }

    const result = {
      analysis: data.choices[0].message.content,
      citations: data.citations
    };

    log('Analysis completed successfully', LogLevel.INFO, {
      analysisLength: result.analysis.length,
      citationsCount: result.citations?.length || 0
    });

    return result;
  } catch (error) {
    log('Error in Perplexity analysis', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export function getRandomResearchPrompt(): string {
  const prompt = RESEARCH_PROMPTS[Math.floor(Math.random() * RESEARCH_PROMPTS.length)];
  log('Generated research prompt', LogLevel.INFO, { prompt });
  return prompt;
}
import { log, LogLevel } from './logger';

export async function generatePerplexityAnalysis(content: string): Promise<string> {
  try {
    log('Starting Perplexity analysis...', LogLevel.INFO);
    log('Input content:', LogLevel.DEBUG, { content });

    // If no API key, return mock response
    if (!process.env.PERPLEXITY_API_KEY) {
      log('Using mock Perplexity response due to missing API key', LogLevel.WARN);
      return generateMockPerplexityResponse(content);
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'pplx-70b-online',
        messages: [
          {
            role: 'system',
            content: 'You are a deep reasoning analysis system that performs comprehensive research and provides detailed analytical insights. Focus on extracting core concepts, patterns, and systems thinking.'
          },
          {
            role: 'user',
            content: `Analyze this content with deep reasoning, focused on identifying systems, patterns, and conceptual frameworks:\n\n${content}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    log('Perplexity analysis complete', LogLevel.INFO, {
      responseLength: result.choices?.[0]?.message?.content?.length || 0
    });

    return result.choices[0].message.content;
  } catch (error) {
    log('Error in Perplexity analysis', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return generateMockPerplexityResponse(content);
  }
}

function generateMockPerplexityResponse(content: string): string {
  // Generate a plausible mock response for testing purposes
  return `## Deep Analysis of Content

### Core Concepts Identified
1. Primary concept: ${content.split(' ').slice(0, 3).join(' ')}
2. Secondary frameworks: System dynamics and pattern recognition
3. Tertiary elements: Conceptual mapping and visual representation

### Pattern Recognition
The content reveals several recurring patterns:
- Hierarchical organization of information
- Cyclical processes and feedback loops
- Emergent properties from component interactions

### Systems Thinking Analysis
When viewed through a systems thinking lens, this content demonstrates:
- Clear boundaries and interfaces between conceptual domains
- Multiple feedback mechanisms and regulatory processes
- Emergent behaviors not predictable from individual components

### Research Context
Based on broader research context, this content connects to:
- Recent developments in complex systems theory
- Interdisciplinary approaches to knowledge representation
- Cognitive models of pattern recognition and abstraction

This analysis provides a foundation for further deep reasoning and pattern extraction.`;
}
