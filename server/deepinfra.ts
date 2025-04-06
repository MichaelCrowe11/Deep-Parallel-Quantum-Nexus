import { log, LogLevel } from './logger';
import axios from 'axios';

interface DeepInfraResponse {
  output: string[];
  status: string;
}

interface VideoGenerationOptions {
  width?: number;
  height?: number;
  fps?: number;
  format?: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high';
  duration?: number;
}

const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/inference';

const VIDEO_QUALITY_SETTINGS = {
  low: {
    width: 640,
    height: 360,
    fps: 24,
    num_inference_steps: 30
  },
  medium: {
    width: 1280,
    height: 720,
    fps: 30,
    num_inference_steps: 40
  },
  high: {
    width: 1920,
    height: 1080,
    fps: 60,
    num_inference_steps: 50
  }
};

/**
 * Generates a visual representation of a scene using DeepInfra API
 */
export async function generateSceneVisualization(
  description: string,
  model: string = "stabilityai/stable-diffusion-xl-base-1.0"
): Promise<string | { imageUrl: string; imageData?: Buffer; modelInfo: Record<string, any> }> {
  try {
    log('Starting DeepInfra scene visualization...', LogLevel.INFO);
    log('Scene description:', LogLevel.DEBUG, { description });

    if (!process.env.DEEPINFRA_API_KEY) {
      throw new Error('DEEPINFRA_API_KEY is not set');
    }

    const response = await fetch(`${DEEPINFRA_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt: description,
          negative_prompt: "blurry, distorted, low quality",
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('DeepInfra API error response', LogLevel.ERROR, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`DeepInfra API error: ${response.statusText}`);
    }

    const data = await response.json() as DeepInfraResponse;
    log('DeepInfra API response received', LogLevel.INFO, {
      status: data.status,
      outputCount: data.output?.length || 0
    });

    if (!data.output?.[0]) {
      throw new Error('No image generated from DeepInfra');
    }

    // Return output with additional metadata
    return {
      imageUrl: data.output[0],
      modelInfo: {
        model,
        provider: 'DeepInfra',
        parameters: { description }
      }
    };
  } catch (error) {
    log('Error in DeepInfra processing', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions = {},
  model: string = "stabilityai/stable-video-xl-0.1"
): Promise<string> {
  try {
    log('Starting DeepInfra video generation...', LogLevel.INFO);
    log('Video generation options:', LogLevel.DEBUG, { prompt, options });

    if (!process.env.DEEPINFRA_API_KEY) {
      throw new Error('DEEPINFRA_API_KEY is not set');
    }

    const quality = options.quality || 'medium';
    const qualitySettings = VIDEO_QUALITY_SETTINGS[quality];

    const videoParams = {
      width: options.width || qualitySettings.width,
      height: options.height || qualitySettings.height,
      fps: options.fps || qualitySettings.fps,
      num_inference_steps: qualitySettings.num_inference_steps,
      video_length: options.duration || 16,
      format: options.format || 'mp4'
    };

    const response = await fetch(`${DEEPINFRA_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt,
          video_length: videoParams.video_length,
          fps: videoParams.fps,
          width: videoParams.width,
          height: videoParams.height,
          num_inference_steps: videoParams.num_inference_steps,
          guidance_scale: 12.5,
          num_videos_per_prompt: 1,
          output_format: videoParams.format
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('DeepInfra video API error response', LogLevel.ERROR, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`DeepInfra API error: ${response.statusText}`);
    }

    const data = await response.json() as DeepInfraResponse;
    log('DeepInfra video API response received', LogLevel.INFO, {
      status: data.status,
      outputCount: data.output?.length || 0,
      format: videoParams.format,
      quality
    });

    if (!data.output?.[0]) {
      throw new Error('No video generated from DeepInfra');
    }

    return data.output[0]; // Base64 encoded video data
  } catch (error) {
    log('Error in DeepInfra video processing', LogLevel.ERROR, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}