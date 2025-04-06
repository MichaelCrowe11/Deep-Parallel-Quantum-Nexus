/**
 * API Management Service
 * Handles API provider configurations and testing of API keys
 */

import axios from 'axios';
import logger from './logger';
import { type ApiProvider, type ApiKey } from '@shared/schema';
import { storage } from './storage';

// Default providers that we support
const defaultProviders = [
  {
    name: 'openai',
    displayName: 'OpenAI',
    description: 'Access to GPT models and DALL-E for image generation',
    website: 'https://openai.com',
    documentationUrl: 'https://platform.openai.com/docs/api-reference',
    logoUrl: '/logos/openai-logo.svg',
    capabilities: ['text-generation', 'image-generation'],
  },
  {
    name: 'anthropic',
    displayName: 'Anthropic',
    description: 'Access to Claude models for text generation and analysis',
    website: 'https://anthropic.com',
    documentationUrl: 'https://docs.anthropic.com/claude/reference',
    logoUrl: '/logos/anthropic-logo.svg',
    capabilities: ['text-generation'],
  },
  {
    name: 'mistral',
    displayName: 'Mistral AI',
    description: 'Access to Mistral language models',
    website: 'https://mistral.ai',
    documentationUrl: 'https://docs.mistral.ai',
    logoUrl: '/logos/mistral-logo.svg',
    capabilities: ['text-generation'],
  },
  {
    name: 'deepinfra',
    displayName: 'DeepInfra',
    description: 'Platform for running AI models including image and video generation',
    website: 'https://deepinfra.com',
    documentationUrl: 'https://deepinfra.com/docs',
    logoUrl: '/logos/deepinfra-logo.svg',
    capabilities: ['text-generation', 'image-generation', 'video-generation'],
  },
  {
    name: 'perplexity',
    displayName: 'Perplexity',
    description: 'Access to perplexity models with integrated search capabilities',
    website: 'https://perplexity.ai',
    documentationUrl: 'https://docs.perplexity.ai',
    logoUrl: '/logos/perplexity-logo.svg',
    capabilities: ['text-generation', 'search'],
  },
  {
    name: 'runway',
    displayName: 'Runway',
    description: 'Advanced video generation and editing capabilities',
    website: 'https://runwayml.com',
    documentationUrl: 'https://docs.runwayml.com',
    logoUrl: '/logos/runway-logo.svg',
    capabilities: ['video-generation', 'image-generation'],
  },
  {
    name: 'together',
    displayName: 'Together AI',
    description: 'Access to a wide variety of open source models',
    website: 'https://together.ai',
    documentationUrl: 'https://docs.together.ai',
    logoUrl: '/logos/together-logo.svg', 
    capabilities: ['text-generation'],
  }
];

/**
 * Initialize default API providers in the database
 */
export async function initializeDefaultProviders(): Promise<ApiProvider[]> {
  logger.info('Initializing default API providers');
  
  const providers: ApiProvider[] = [];
  
  for (const providerData of defaultProviders) {
    // Check if provider already exists
    const existingProvider = await storage.getApiProviderByName(providerData.name);
    
    if (existingProvider) {
      providers.push(existingProvider);
      continue;
    }
    
    // Create new provider
    const newProvider = await storage.createApiProvider({
      ...providerData,
      isActive: true,
    });
    
    providers.push(newProvider);
  }
  
  logger.info(`Initialized ${providers.length} API providers`);
  return providers;
}

/**
 * Test an API key to ensure it's valid
 */
export async function testApiKey(apiKey: ApiKey): Promise<{success: boolean; message: string}> {
  const provider = await storage.getApiProvider(apiKey.providerId);
  
  if (!provider) {
    return { success: false, message: 'Provider not found' };
  }
  
  // Update the lastUsed timestamp
  await storage.updateApiKey(apiKey.id, { lastUsed: new Date() });
  
  try {
    switch (provider.name) {
      case 'openai':
        return await testOpenAIKey(apiKey.key);
      case 'anthropic':
        return await testAnthropicKey(apiKey.key);
      case 'mistral':
        return await testMistralKey(apiKey.key);
      case 'deepinfra':
        return await testDeepInfraKey(apiKey.key);
      case 'perplexity':
        return await testPerplexityKey(apiKey.key);
      case 'runway':
        return await testRunwayKey(apiKey.key);
      case 'together':
        return await testTogetherKey(apiKey.key);
      default:
        return { success: false, message: 'Provider testing not supported' };
    }
  } catch (error) {
    logger.error('API key test failed', { error, providerId: provider.id });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}

/**
 * Get API key status for a user and provider
 */
export async function getUserApiKeyStatus(userId: number, providerName: string): Promise<{
  hasKey: boolean;
  isValid: boolean;
  lastTested: Date | null;
  message?: string;
}> {
  const provider = await storage.getApiProviderByName(providerName);
  
  if (!provider) {
    return { 
      hasKey: false, 
      isValid: false, 
      lastTested: null,
      message: 'Provider not found' 
    };
  }
  
  const apiKey = await storage.getUserApiKeyForProvider(userId, provider.id);
  
  if (!apiKey) {
    return { 
      hasKey: false, 
      isValid: false, 
      lastTested: null 
    };
  }
  
  return {
    hasKey: true,
    isValid: apiKey.testStatus === 'valid',
    lastTested: apiKey.updatedAt,
    message: apiKey.testMessage
  };
}

// Provider-specific key testing logic

async function testOpenAIKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'OpenAI API key is valid' };
    }
    
    return { success: false, message: 'OpenAI API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `OpenAI API Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to OpenAI API' };
  }
}

async function testAnthropicKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'Anthropic API key is valid' };
    }
    
    return { success: false, message: 'Anthropic API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `Anthropic API Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to Anthropic API' };
  }
}

async function testMistralKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'Mistral API key is valid' };
    }
    
    return { success: false, message: 'Mistral API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `Mistral API Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to Mistral API' };
  }
}

async function testDeepInfraKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.deepinfra.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'DeepInfra API key is valid' };
    }
    
    return { success: false, message: 'DeepInfra API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `DeepInfra API Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to DeepInfra API' };
  }
}

async function testPerplexityKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.perplexity.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'Perplexity API key is valid' };
    }
    
    return { success: false, message: 'Perplexity API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `Perplexity API Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to Perplexity API' };
  }
}

async function testRunwayKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.runwayml.com/v1/user', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'Runway API key is valid' };
    }
    
    return { success: false, message: 'Runway API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `Runway API Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to Runway API' };
  }
}

async function testTogetherKey(key: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await axios.get('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return { success: true, message: 'Together AI API key is valid' };
    }
    
    return { success: false, message: 'Together AI API key validation failed' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: `Together AI Error: ${error.response.status} - ${error.response.data.error?.message || error.message}` 
      };
    }
    
    return { success: false, message: 'Failed to connect to Together AI API' };
  }
}