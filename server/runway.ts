
import fetch from 'node-fetch';
import { log, LogLevel } from './logger';

/**
 * Interface for Runway ML API generation parameters
 */
interface RunwayGenerationParams {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  duration?: number;
  fps?: number;
  guidance_scale?: number;
  seed?: number;
}

/**
 * Generate a video using Runway ML API
 * @param params Generation parameters
 * @returns Object containing video URL and metadata
 */
export async function generateRunwayVideo(params: RunwayGenerationParams) {
  if (!process.env.RUNWAY_ML_API_KEY) {
    log('Missing RUNWAY_ML_API_KEY environment variable', LogLevel.ERROR);
    throw new Error('Runway ML API key not configured. Please add your Runway ML API key to the .env file.');
  }

  try {
    log(`Generating Runway ML video with prompt: ${params.prompt.substring(0, 50)}...`, LogLevel.INFO);
    
    const response = await fetch('https://api.runway.ml/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWAY_ML_API_KEY}`
      },
      body: JSON.stringify({
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || '',
        num_frames: params.num_frames || 24,
        duration: params.duration || 2,
        fps: params.fps || 24,
        guidance_scale: params.guidance_scale || 7,
        seed: params.seed || Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      log('Runway ML API error', LogLevel.ERROR, errorData);
      throw new Error(`Runway ML API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    log('Runway ML video generation successful', LogLevel.INFO);
    
    return {
      videoUrl: result.output.video_url,
      metadata: {
        prompt: params.prompt,
        seed: result.seed || params.seed,
        processingTime: result.processing_time || null
      }
    };
  } catch (error) {
    log('Error in Runway ML video generation', LogLevel.ERROR, { error });
    throw error;
  }
}

/**
 * Check if the Runway ML API key is valid
 * @returns Boolean indicating if the API key is valid
 */
export async function validateRunwayAPIKey() {
  if (!process.env.RUNWAY_ML_API_KEY) {
    return false;
  }

  try {
    const response = await fetch('https://api.runway.ml/v1/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_ML_API_KEY}`
      }
    });

    return response.ok;
  } catch (error) {
    log('Error validating Runway ML API key', LogLevel.ERROR, { error });
    return false;
  }
}
