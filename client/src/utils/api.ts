
/**
 * API utilities for interacting with the backend
 */

// Base API path
const API_BASE = '/api';

// API endpoints
const ENDPOINTS = {
  PROJECTS: `${API_BASE}/projects`,
  SCENES: `${API_BASE}/scenes`,
  THOUGHTS: `${API_BASE}/thoughts`,
  SERVICE_STATUS: `${API_BASE}/service/status`,
  PROCESS_THOUGHT: `${API_BASE}/thought/process`,
  ANALYZE_THOUGHT: `${API_BASE}/thought/analyze`,
  VISUALIZE_SCENE: `${API_BASE}/scene/visualize`,
  IMAGES: `${API_BASE}/images`,
  EMAIL_STATUS: `${API_BASE}/email/status`,
};

// Type definitions for API responses
interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if available
        ...(localStorage.getItem('token') ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {})
      },
      ...options
    });

    // Parse response
    const data = await response.json();

    // Check for API error responses
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API service functions
export const api = {
  // Projects
  getProjects: () => fetchApi(ENDPOINTS.PROJECTS),
  getProject: (id: number) => fetchApi(`${ENDPOINTS.PROJECTS}/${id}`),
  createProject: (data: any) => fetchApi(ENDPOINTS.PROJECTS, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Thoughts
  getProjectThoughts: (projectId: number) => 
    fetchApi(`${ENDPOINTS.PROJECTS}/${projectId}/thoughts`),
  createThought: (data: any) => fetchApi(ENDPOINTS.THOUGHTS, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  processThought: (content: string) => fetchApi(ENDPOINTS.PROCESS_THOUGHT, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),
  
  // Scenes
  getProjectScenes: (projectId: number) => 
    fetchApi(`${ENDPOINTS.PROJECTS}/${projectId}/scenes`),
  createScene: (data: any) => fetchApi(ENDPOINTS.SCENES, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  visualizeScene: (description: string) => fetchApi(ENDPOINTS.VISUALIZE_SCENE, {
    method: 'POST',
    body: JSON.stringify({ description })
  }),
  
  // System
  getServiceStatus: () => fetchApi<ApiResponse<{
    services: Record<string, { configured: boolean, status: string }>,
    allServicesConfigured: boolean
  }>>(ENDPOINTS.SERVICE_STATUS),
  
  // Images
  getImages: () => fetchApi<ApiResponse<{
    images: Array<{ name: string, path: string, url: string, type: string }>
  }>>(ENDPOINTS.IMAGES),
  
  // Email
  getEmailStatus: () => fetchApi<ApiResponse<{
    apiKeyConfigured: boolean,
    domainConfigured: boolean,
    isValidConfiguration: boolean
  }>>(ENDPOINTS.EMAIL_STATUS)
};

// Check if backend is available
export async function checkBackendStatus(): Promise<boolean> {
  try {
    await api.getServiceStatus();
    return true;
  } catch (error) {
    return false;
  }
}
