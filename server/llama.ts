import { HfInference } from '@huggingface/inference';
import { log, LogLevel } from './logger';

// Initialize the Hugging Face client with your API key
// You'll need to add your Hugging Face API key to the .env file
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// Models that Meta has released on Hugging Face
const LLAMA_MODELS = {
  'llama-3-70b': 'meta-llama/Llama-3-70B-Instruct',
  'llama-3-8b': 'meta-llama/Llama-3-8B-Instruct',
  'llama-3.1-405b': 'meta-llama/Llama-3.1-405B-Instruct',
  'llama-3.1-70b': 'meta-llama/Llama-3.1-70B-Instruct', 
  'llama-3.1-8b': 'meta-llama/Llama-3.1-8B-Instruct',
  'llama-3.2-11b': 'meta-llama/Llama-3.2-11B-Instruct',
  'llama-3.2-3b': 'meta-llama/Llama-3.2-3B-Instruct',
  'llama-3.3-70b-turbo': 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
};

// Direct Meta AI URLs
const META_DIRECT_URLS = {
  'meta-direct': 'https://download6.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoibGczcmc3c3o0dTJ4eWg2OHJjODlhMW82IiwiUmVzb3VyY2UiOiJodHRwczpcL1wvZG93bmxvYWQ2LmxsYW1hbWV0YS5uZXRcLyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3NDI1MzY5Mjh9fX1dfQ__&Signature=Q-pewAyvd-~WaSc8jgPK-qHb7QoVJCrWZ6pc5Ii~wQSdvEC6itZQDfd3EpcjVye07Q8x7CIfBv3MRF0styg9NdahFLETfQEhOnjuNdz-t0~wweU~rt-Aqf5OxhPPhPXSqprMVPexKFX0sBSmIwAHF~Bq4ujBikWYtptM3duBQf~ZA-JpBHHCb~QkFEcd4sz2ZMP74qj8jYQfNgb2Cktu7B7eCscxSfkLsPAuPno3pum4RI9r3Hay9bcT6ymE2rPrD2vxqOztkRYxHBC-iZaeX-lJC~XoGqN0te6W3ZnogJASSwXEZZjtrGCwNmA3QN4VKdbcxLT6iJH-njreHNTleQ__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=960108432532709',
  'llama-3.2-lightweight': 'https://llama3-2-lightweight.llamameta.net/*?Policy=eyJTdGF0ZW1lbnQiOlt7InVuaXF1ZV9oYXNoIjoiMWd2a3IxN3RmMWl3M3ptZGw4cWF5MXVzIiwiUmVzb3VyY2UiOiJodHRwczpcL1wvbGxhbWEzLTItbGlnaHR3ZWlnaHQubGxhbWFtZXRhLm5ldFwvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0MjUzNjkyOH19fV19&Signature=LK46wwHVFoiZ2m1yWLl8hdoruGA9fPlEx0qApro7pe8kRPd5Q98te11ythupbE6eg-Z~QsOqdyd3c9hGf16alASzlQACaegCVPudlP1b~Bj463eoT6KyRtt0PqXCKSsyApJ7f1QXoJywVc4oeReogjcaaDBixHMMgScn8esNJBGcsomfrcu5y2Sjjrd55~n9WNvXj-oys0o2NlkjcA4oLaXP8w-yV0GiTKyCyxBrLVKGLN0T7xHo9RANiIoK1wxpssLTEtXpypiZmMsdBXJvte0t2ruIdcZJnMrk6gYaShL3D1VHyNEU6VUAcIwHH~P1VG6w5vGXmNK5k4H16I9mgw__&Key-Pair-Id=K15QRJLYKIFSLZ&Download-Request-ID=936935811856628'
};

export async function generateLlamaResponse(
  prompt: string,
  modelKey: keyof typeof LLAMA_MODELS | keyof typeof META_DIRECT_URLS = 'llama-3.1-8b',
  systemPrompt = "You are a helpful, harmless, and honest AI assistant."
): Promise<string> {
  try {
    // Check if using direct Meta URL
    const isDirectMetaUrl = modelKey in META_DIRECT_URLS;

    if (isDirectMetaUrl) {
      const metaUrl = META_DIRECT_URLS[modelKey as keyof typeof META_DIRECT_URLS];
      log(`Running Llama inference with direct Meta URL model`, LogLevel.INFO);

      try {
        // Implementation for Meta's direct URL API
        const response = await fetch(metaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.META_API_KEY || ''}`
          },
          body: JSON.stringify({
            prompt: `<s>[INST] ${systemPrompt} \n\n${prompt} [/INST]`,
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.9
          })
        });

        if (!response.ok) {
          throw new Error(`Meta API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.generated_text || data.output || data.completion || '';
      } catch (metaError) {
        log('Error with Meta direct URL', LogLevel.ERROR, {
          error: metaError instanceof Error ? metaError.message : 'Unknown error'
        });
        return `Error with Meta direct URL: ${metaError instanceof Error ? metaError.message : 'Unknown error'}`;
      }
    } else {
      // Regular Hugging Face implementation
      const model = LLAMA_MODELS[modelKey as keyof typeof LLAMA_MODELS] || LLAMA_MODELS['llama-3.1-8b'];

      log(`Running Llama inference with model: ${model}`, LogLevel.INFO);

      // Check if we have an API key
      if (!process.env.HUGGING_FACE_API_KEY) {
        log('Missing HUGGING_FACE_API_KEY environment variable', LogLevel.ERROR);
        return "Error: Hugging Face API key not configured. Please add your API key to use Llama models.";
      }

      const response = await hf.textGeneration({
        model: model,
        inputs: `<s>[INST] ${systemPrompt} \n\n${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      });

      return response.generated_text;
    }
  } catch (error) {
    log('Error generating Llama response', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error',
      modelKey
    });

    return `Error generating response with Llama model: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function testLlamaModels(): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  // Only test a few models to avoid excessive API usage
  const testModels: (keyof typeof LLAMA_MODELS)[] = ['llama-3.1-8b', 'llama-3.2-3b'];
  // Also test the direct Meta URL models
  const directUrlModels = Object.keys(META_DIRECT_URLS) as (keyof typeof META_DIRECT_URLS)[];

  log('Testing Llama models...', LogLevel.INFO);

  // Test Hugging Face models
  for (const model of testModels) {
    try {
      results[model] = await generateLlamaResponse(
        "Summarize the capabilities of a multi-stage AI thought pipeline in one paragraph.",
        model
      );
      log(`Successfully tested model: ${model}`, LogLevel.INFO);
    } catch (error) {
      results[model] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      log(`Error testing model: ${model}`, LogLevel.ERROR);
    }
  }

  // Test direct Meta URL models
  for (const modelKey of directUrlModels) {
    try {
      results[`direct-${modelKey}`] = await generateLlamaResponse(
        "Summarize the capabilities of a multi-stage AI thought pipeline in one paragraph.",
        modelKey
      );
      log(`Successfully tested direct Meta model: ${modelKey}`, LogLevel.INFO);
    } catch (error) {
      results[`direct-${modelKey}`] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      log(`Error testing direct Meta model: ${modelKey}`, LogLevel.ERROR);
    }
  }

  return results;
}