import { log, LogLevel } from './logger';

interface Scene {
  description: string;
  // Add other relevant scene properties as needed
}

interface TogetherResponse {
  output: {
    text: string;
  };
  status: string;
}

interface ThoughtAnalysis {
  patterns: {
    analytical: string[];
    creative: string[];
    structural: string[];
    integrative: string[];
    innovative: string[];
    visual: string[];
    narrative: string[];
    technical: string[];
    experimental: string[];
  };
  visualMetadata: {
    scenes: SceneVisualization[];
    colorSchemes: string[];
    moodBoard: string[];
  };
  conceptLinks: {
    source: string;
    target: string;
    relationship: string;
    strength: number;
  }[];
  emergentThemes: {
    theme: string;
    confidence: number;
    supportingElements: string[];
  }[];
}

interface SceneVisualization {
  description: string;
  visualElements: string[];
  composition: {
    layout: string;
    focusPoints: string[];
    depth: string;
  };
  timing: {
    duration: number;
    pacing: string;
  };
}

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

// Expanded model list for more diverse perspectives
const PARALLEL_MODELS = [
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'deepseek-ai/DeepSeek-V3',
  'anthropic/claude-3-opus-20240229',
  'anthropic/claude-3-sonnet-20240229',
  'google/gemma-2-27b-it',
  'anthropic/claude-3-haiku-20240307',
  'google/gemini-1.5-pro',
  'google/gemini-1.0-pro',
  'google/gemini-1.0-pro-vision',
  'deepseek-ai/deepseek-math-7b-instruct',
  'meta-llama/codellama-70b-instruct',
  'deepseek-ai/deepseek-coder-33b-instruct',
  'anthropic/claude-3-haiku-20240307',
  'perplexity/pplx-70b-online',
  'perplexity/pplx-7b-online',
  'perplexity/pplx-7b-chat',
  'anthropic/claude-3-opus-20240229-vision'
];

// Enhanced model configurations
const MODEL_CONFIGS = {
  'google/gemini-1.5-pro': {
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.95,
    top_k: 60,
    presence_penalty: 0.2,
    frequency_penalty: 0.3
  },
  'google/gemini-1.0-pro': {
    max_tokens: 2048,
    temperature: 0.8,
    top_p: 0.9,
    top_k: 50,
    presence_penalty: 0.1,
    frequency_penalty: 0.2
  },
  'deepseek-ai/deepseek-math-7b-instruct': {
    max_tokens: 2048,
    temperature: 0.6,
    top_p: 0.9,
    top_k: 40,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  },
  'meta-llama/codellama-70b-instruct': {
    max_tokens: 3072,
    temperature: 0.7,
    top_p: 0.95,
    top_k: 50,
    presence_penalty: 0.2,
    frequency_penalty: 0.2
  },
  'deepseek-ai/deepseek-coder-33b-instruct': {
    max_tokens: 2048,
    temperature: 0.8,
    top_p: 0.9,
    top_k: 45,
    presence_penalty: 0.15,
    frequency_penalty: 0.15
  },
  'anthropic/claude-3-opus-20240229': {
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.95,
    top_k: 55,
    presence_penalty: 0.25,
    frequency_penalty: 0.25
  },
  'perplexity/pplx-70b-online': {
    max_tokens: 3072,
    temperature: 0.75,
    top_p: 0.92,
    top_k: 50,
    presence_penalty: 0.2,
    frequency_penalty: 0.2
  }
};

// Expand THOUGHT_PATTERNS with more detailed categories
const THOUGHT_PATTERNS = {
  ANALYTICAL: {
    type: 'analytical',
    aspects: ['logical', 'systematic', 'methodical', 'critical', 'empirical', 'deductive', 'inductive']
  },
  CREATIVE: {
    type: 'creative',
    aspects: ['imaginative', 'innovative', 'abstract', 'artistic', 'metaphorical', 'associative', 'divergent']
  },
  STRUCTURAL: {
    type: 'structural',
    aspects: ['organizational', 'hierarchical', 'sequential', 'architectural', 'systemic', 'foundational', 'interconnected']
  },
  INTEGRATIVE: {
    type: 'integrative',
    aspects: ['synthesizing', 'connecting', 'holistic', 'unified', 'interdisciplinary', 'cross-contextual', 'bridging']
  },
  INNOVATIVE: {
    type: 'innovative',
    aspects: ['groundbreaking', 'revolutionary', 'pioneering', 'transformative', 'disruptive', 'paradigm-shifting', 'novel']
  },
  VISUAL: {
    type: 'visual',
    aspects: ['spatial', 'compositional', 'aesthetic', 'dynamic', 'perceptual', 'geometric', 'atmospheric']
  },
  NARRATIVE: {
    type: 'narrative',
    aspects: ['sequential', 'thematic', 'emotional', 'contextual', 'character-driven', 'plot-focused', 'world-building']
  },
  TECHNICAL: {
    type: 'technical',
    aspects: ['implementation', 'feasibility', 'optimization', 'scalability', 'efficiency', 'robustness', 'maintainability']
  },
  EXPERIMENTAL: {
    type: 'experimental',
    aspects: ['exploratory', 'iterative', 'hypothesis-driven', 'empirical', 'validation', 'verification', 'discovery']
  }
};

async function runModelInference(
  content: string,
  model: string,
  systemPrompt?: string,
  thoughtPatternFocus?: string
): Promise<string> {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not set');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // Add thought pattern guidance if specified
    if (thoughtPatternFocus) {
      messages.push({
        role: 'system',
        content: `Focus on extracting and analyzing ${thoughtPatternFocus} thought patterns in your response.`
      });
    }

    messages.push({ role: 'user', content });

    const modelConfig = MODEL_CONFIGS[model] || { max_tokens: 2048, temperature: 0.7, top_p: 0.9, top_k: 50, repetition_penalty: 1.1 };

    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        top_p: modelConfig.top_p,
        top_k: modelConfig.top_k,
        repetition_penalty: modelConfig.repetition_penalty || 1.1,
        presence_penalty: modelConfig.presence_penalty || 0,
        frequency_penalty: modelConfig.frequency_penalty || 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('Together.ai API error response', LogLevel.ERROR, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Together.ai API error: ${response.statusText}`);
    }

    const data = await response.json();
    log('Together.ai API response received', LogLevel.INFO, {
      status: data.status,
      outputLength: data.choices?.[0]?.message?.content?.length || 0,
      thoughtPattern: thoughtPatternFocus
    });

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No analysis generated from Together.ai');
    }

    return data.choices[0].message.content;
  } catch (error) {
    log('Error in Together.ai processing', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function enhanceAnalysis(content: string): Promise<ThoughtAnalysis> {
  try {
    log('Starting enhanced parallel Together.ai analysis...', LogLevel.INFO);
    log('Input content:', LogLevel.DEBUG, { content });

    // Run parallel analysis with multiple models focusing on different thought patterns
    const modelResults = await Promise.all([
      ...PARALLEL_MODELS.map((model, index) =>
        runModelInference(
          content,
          model,
          `You are an advanced research and thought analysis system.
Analyze this research concept with a focus on ${Object.values(THOUGHT_PATTERNS)[index % 9].type} patterns:

Focus on:
1. Pattern recognition and emergence
2. Conceptual relationships and links
3. Innovation potential
4. Technical implementation paths
5. Visual representation opportunities

Provide structured analysis with clear pattern identification.`,
          Object.values(THOUGHT_PATTERNS)[index % 9].type
        )
      )
    ]);

    log('Received all parallel model responses', LogLevel.INFO, {
      modelCount: modelResults.length
    });

    // Aggregate and analyze patterns
    const aggregatorPrompt = `Synthesize these multiple analyses into a comprehensive thought pattern analysis, including visual metadata and emergent themes.  Structure your response as valid JSON conforming to the ThoughtAnalysis interface.

Original content:
${content}

Model analyses:
${modelResults.map((response, i) => `Analysis ${i + 1} (${Object.values(THOUGHT_PATTERNS)[i % 9].type}):\n${response}`).join('\n\n')}
`;

    const aggregatedResponse = await runModelInference(
      aggregatorPrompt,
      'deepseek-ai/DeepSeek-V3'
    );

    const result: ThoughtAnalysis = JSON.parse(aggregatedResponse);

    log('Enhanced analysis complete', LogLevel.INFO, {
      patternsDetected: Object.keys(result.patterns).length,
      conceptualLinksFound: result.conceptLinks.length,
      visualMetadata: result.visualMetadata
    });

    return result;
  } catch (error) {
    log('Error in enhanced analysis', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function parallelModelWorkflow(
  input: string,
  systemPrompt: string,
  models: string[]
): Promise<{ aggregatedResponse: string; individualResponses: string[]; confidenceScores?: number[] }> {
  try {
    log('Starting parallel model workflow...', LogLevel.INFO, {
      inputLength: input.length,
      modelCount: models.length
    });

    const proposedResponses: string[] = [];
    const confidenceScores: number[] = [];

    // Execute models in parallel
    const modelPromises = models.map(model => 
      runModelInference(input, model, systemPrompt)
        .then(response => {
          proposedResponses.push(response);
          // Calculate a simple confidence score based on response length and complexity
          const confidence = Math.min(0.95, 0.5 + (response.length / 5000) * 0.5);
          confidenceScores.push(confidence);
          log('Model response received', LogLevel.DEBUG, { model, responseLength: response.length, confidence });
          return response;
        })
    );

    await Promise.all(modelPromises);

    // If only one model, return its response directly
    if (proposedResponses.length === 1) {
      return {
        aggregatedResponse: proposedResponses[0],
        individualResponses: proposedResponses,
        confidenceScores
      };
    }

    // Aggregate responses using Claude Opus
    const aggregatorModel = 'anthropic/claude-3-opus-20240229';
    const aggregatorPrompt = `
I have received the following responses from different AI models about this input:
${input}

Model Responses:
${proposedResponses.map((response, i) => `Response ${i+1} (Confidence: ${confidenceScores[i].toFixed(2)}):\n${response}`).join('\n\n')}
`;

    const aggregatedResponse = await runModelInference(
      aggregatorPrompt,
      aggregatorModel,
      'You are an expert synthesis system. Your role is to combine multiple AI responses into a single, coherent output.'
    );

    return {
      aggregatedResponse,
      individualResponses: proposedResponses,
      confidenceScores
    };
  } catch (error) {
    log('Error in parallel model workflow', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function generateSceneIdeas(
  description: string,
  existingScenes: string[] = []
): Promise<string[]> {
  try {
    log('Starting Together.ai scene generation...', LogLevel.INFO);
    log('Scene description:', LogLevel.DEBUG, { description });

    const systemPrompt = `As a creative AI assistant, generate unique and innovative scene ideas based on this concept:

${existingScenes.length > 0 ? `
Existing scenes to build upon:
${existingScenes.join('\n')}
` : ''}

Generate 3 unique scene ideas that:
1. Explore different aspects of the concept
2. Are visually striking and memorable
3. Push creative boundaries while remaining feasible
4. Build on existing scenes (if any) without repeating them

Format each scene idea as a detailed, visual description.`;

    const { aggregatedResponse } = await parallelModelWorkflow(
      description,
      systemPrompt,
      PARALLEL_MODELS.slice(0, 2) // Use fewer models for scene generation
    );

    // Split the response into individual scenes
    const scenes = aggregatedResponse
      .split('\n\n')
      .filter(scene => scene.trim().length > 0)
      .map(scene => scene.trim());

    return scenes;
  } catch (error) {
    log('Error in Together.ai scene generation', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function generateSceneTransitions(
  currentScene: Scene,
  nextScene: Scene
): Promise<{
  transitionDescription: string;
  transitionType: string;
  previousSceneContext: any;
  nextSceneContext: any;
}> {
  try {
    log('Starting creative transition generation...', LogLevel.INFO);

    const systemPrompt = `As a sophisticated cinematic AI director, analyze these scenes and create an innovative, artistic transition between them.

Consider:
1. Visual Elements & Symbolism:
   - Key visual motifs that could morph or blend
   - Color palettes and lighting transitions
   - Symbolic elements that bridge the scenes

2. Narrative Flow:
   - Thematic connections between scenes
   - Emotional progression
   - Story beats and pacing

3. Advanced Transition Techniques:
   - Dynamic morphing effects
   - Parallel action sequences
   - Creative match cuts
   - Environmental transitions (weather, time, seasons)
   - Sound design suggestions

4. Artistic Innovation:
   - Consider unconventional transition methods
   - Blend multiple transition types if appropriate
   - Think in terms of both visual and narrative flow

Current Scene: ${currentScene.description}
Next Scene: ${nextScene.description}

Format your response as valid JSON with:
{
  "transitionDescription": "Detailed artistic description of the transition sequence",
  "transitionType": "Primary transition technique",
  "previousSceneContext": {
    "keyVisuals": [],
    "dominantColors": [],
    "mood": "",
    "symbols": [],
    "soundscape": ""
  },
  "nextSceneContext": {
    "keyVisuals": [],
    "dominantColors": [],
    "mood": "",
    "symbols": [],
    "soundscape": ""
  }
}`;

    // Use parallel model workflow for creative transition generation
    const { aggregatedResponse } = await parallelModelWorkflow(
      `Design an innovative cinematic transition between:\n\nScene 1: ${currentScene.description}\n\nScene 2: ${nextScene.description}`,
      systemPrompt,
      PARALLEL_MODELS
    );

    // Parse the aggregated response
    const transitionData = JSON.parse(aggregatedResponse);

    log('Creative transition generation complete', LogLevel.INFO, {
      transitionType: transitionData.transitionType,
      hasContext: Boolean(transitionData.previousSceneContext && transitionData.nextSceneContext)
    });

    return {
      transitionDescription: transitionData.transitionDescription,
      transitionType: transitionData.transitionType,
      previousSceneContext: transitionData.previousSceneContext,
      nextSceneContext: transitionData.nextSceneContext
    };
  } catch (error) {
    log('Error generating scene transition', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}