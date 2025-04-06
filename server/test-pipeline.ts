
import { runExpandedPipeline } from './pipeline';
import { log, LogLevel } from './logger';

async function testPipeline() {
  try {
    // Test input for the pipeline
    const testInput = `The intersection of quantum computing and visual representation offers fascinating opportunities for novel communication methods. When quantum states are visualized, we can better understand entanglement and superposition through spatial metaphors. This creates a bridge between abstract mathematical concepts and human intuition.`;
    
    log('Starting 18-stage pipeline test...', LogLevel.INFO);
    
    // Run the pipeline with the test input
    const result = await runExpandedPipeline(testInput, {
      depthLevel: 'comprehensive',
      prioritizeVisual: true
    });
    
    // Log the results
    log('Pipeline test completed successfully', LogLevel.INFO);
    log('Pipeline stages executed:', LogLevel.INFO, {
      stageCount: result.processingMetrics.length,
      stages: result.processingMetrics.map(m => m.stage)
    });
    
    // Log sample outputs from key stages
    log('Initial Analysis (Sample):', LogLevel.INFO, {
      llama: result.initialAnalysis.llama.substring(0, 100) + '...',
      claude: result.initialAnalysis.claude.substring(0, 100) + '...',
      perplexity: typeof result.initialAnalysis.perplexity === 'string' 
        ? result.initialAnalysis.perplexity.substring(0, 100) + '...'
        : 'Object format'
    });
    
    log('Deep Reasoning (Sample):', LogLevel.INFO, {
      sample: result.deepReasoning.substring(0, 100) + '...'
    });
    
    log('Narrative Structure (Sample):', LogLevel.INFO, {
      sample: result.narrativeStructure.substring(0, 100) + '...'
    });
    
    log('Visual Metaphor (Sample):', LogLevel.INFO, {
      sample: result.visualMetaphor.substring(0, 100) + '...'
    });
    
    log('Storyboard Synthesis (Sample):', LogLevel.INFO, {
      sample: result.storyboardSynthesis.substring(0, 100) + '...'
    });
    
    log('DALL-E Image Prompts:', LogLevel.INFO, {
      count: result.dalleImagePrompts.length,
      samples: result.dalleImagePrompts.map(p => p.substring(0, 50) + '...').slice(0, 2)
    });
    
    log('Video Generation Prompts:', LogLevel.INFO, {
      count: result.videoGenerationPrompts.length,
      samples: result.videoGenerationPrompts.slice(0, 2).map(p => ({
        model: p.model,
        promptSample: p.prompt.substring(0, 50) + '...'
      }))
    });
    
    log('Processing Metrics:', LogLevel.INFO, {
      totalStages: result.processingMetrics.length,
      totalDuration: result.processingMetrics[result.processingMetrics.length - 1].duration + 'ms',
      averageConfidence: result.processingMetrics.reduce((sum, m) => sum + m.confidenceScore, 0) / 
                         result.processingMetrics.length
    });
    
    return result;
  } catch (error) {
    log('Error testing pipeline', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

testPipeline()
  .then(() => {
    log('Pipeline test complete', LogLevel.INFO);
    process.exit(0);
  })
  .catch(error => {
    log('Pipeline test failed', LogLevel.ERROR, { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  });
