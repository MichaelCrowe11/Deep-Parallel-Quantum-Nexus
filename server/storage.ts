import { 
  type Project, type Scene, type Thought,
  type ApiProvider, type ApiKey,
  type PipelineConfiguration, type ServiceRegistry, type PipelineExecution,
  type InsertProject, type InsertScene, type InsertThought,
  type InsertApiProvider, type InsertApiKey,
  type InsertPipelineConfiguration, type InsertServiceRegistry, type InsertPipelineExecution
} from "@shared/schema";

export interface IStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  listProjects(): Promise<Project[]>;

  // Scenes
  createScene(scene: InsertScene): Promise<Scene>;
  getProjectScenes(projectId: number): Promise<Scene[]>;
  updateScene(id: number, updates: Partial<Scene>): Promise<Scene>;
  createScenesFromThought(thoughtId: number, scenes: Partial<Scene>[]): Promise<Scene[]>;
  getScene(id: number): Promise<Scene | undefined>;

  // Thoughts
  createThought(thought: InsertThought): Promise<Thought>;
  getProjectThoughts(projectId: number): Promise<Thought[]>;
  updateThought(id: number, updates: Partial<Thought>): Promise<Thought>;
  
  // API Providers
  createApiProvider(provider: InsertApiProvider): Promise<ApiProvider>;
  getApiProvider(id: number): Promise<ApiProvider | undefined>;
  getApiProviderByName(name: string): Promise<ApiProvider | undefined>;
  listApiProviders(activeOnly?: boolean): Promise<ApiProvider[]>;
  updateApiProvider(id: number, updates: Partial<ApiProvider>): Promise<ApiProvider>;
  
  // API Keys
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getUserApiKeys(userId: number): Promise<ApiKey[]>;
  getUserApiKeyForProvider(userId: number, providerId: number): Promise<ApiKey | undefined>;
  updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<boolean>;

  // Pipeline Configurations
  createPipelineConfiguration(config: InsertPipelineConfiguration): Promise<PipelineConfiguration>;
  getPipelineConfiguration(id: number): Promise<PipelineConfiguration | undefined>;
  listPipelineConfigurations(activeOnly?: boolean): Promise<PipelineConfiguration[]>;
  getDefaultPipelineConfiguration(): Promise<PipelineConfiguration | undefined>;
  getUserPipelineConfigurations(userId: number, activeOnly?: boolean): Promise<PipelineConfiguration[]>;
  updatePipelineConfiguration(id: number, updates: Partial<PipelineConfiguration>): Promise<PipelineConfiguration>;
  deletePipelineConfiguration(id: number): Promise<boolean>;
  
  // Service Registry
  createServiceRegistry(service: InsertServiceRegistry): Promise<ServiceRegistry>;
  getServiceRegistry(id: number): Promise<ServiceRegistry | undefined>;
  listServiceRegistry(activeOnly?: boolean): Promise<ServiceRegistry[]>;
  getServicesByProvider(providerId: number): Promise<ServiceRegistry[]>;
  getServicesByType(serviceType: string): Promise<ServiceRegistry[]>;
  updateServiceRegistry(id: number, updates: Partial<ServiceRegistry>): Promise<ServiceRegistry>;
  updateServiceHealthStatus(id: number, status: string): Promise<ServiceRegistry>;
  
  // Pipeline Executions
  createPipelineExecution(execution: InsertPipelineExecution): Promise<PipelineExecution>;
  getPipelineExecution(id: number): Promise<PipelineExecution | undefined>;
  updatePipelineExecution(id: number, updates: Partial<PipelineExecution>): Promise<PipelineExecution>;
  listPipelineExecutions(pipelineId: number): Promise<PipelineExecution[]>;
  completePipelineExecution(id: number, outputData: any, metrics: any): Promise<PipelineExecution>;
  failPipelineExecution(id: number, error: any): Promise<PipelineExecution>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private scenes: Map<number, Scene>;
  private thoughts: Map<number, Thought>;
  private apiProviders: Map<number, ApiProvider>;
  private apiKeys: Map<number, ApiKey>;
  private pipelineConfigurations: Map<number, PipelineConfiguration>;
  private serviceRegistry: Map<number, ServiceRegistry>;
  private pipelineExecutions: Map<number, PipelineExecution>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.scenes = new Map();
    this.thoughts = new Map();
    this.apiProviders = new Map();
    this.apiKeys = new Map();
    this.pipelineConfigurations = new Map();
    this.serviceRegistry = new Map();
    this.pipelineExecutions = new Map();
    this.currentId = 1;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const newProject = { ...project, id, status: "draft" };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createScene(scene: InsertScene): Promise<Scene> {
    const id = this.currentId++;
    const newScene = { 
      ...scene, 
      id, 
      status: "draft", 
      videoUrl: null, 
      audioUrl: null,
      enhancedDescription: null,
      sourceThoughtId: null
    };
    this.scenes.set(id, newScene);
    return newScene;
  }

  async createScenesFromThought(thoughtId: number, scenes: Partial<Scene>[]): Promise<Scene[]> {
    return Promise.all(scenes.map(async (scene, index) => {
      const id = this.currentId++;
      const newScene = {
        ...scene,
        id,
        sourceThoughtId: thoughtId,
        order: index + 1,
        status: "draft",
        videoUrl: null,
        audioUrl: null,
        enhancedDescription: null
      } as Scene;
      this.scenes.set(id, newScene);
      return newScene;
    }));
  }

  async getProjectScenes(projectId: number): Promise<Scene[]> {
    return Array.from(this.scenes.values())
      .filter(scene => scene.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async updateScene(id: number, updates: Partial<Scene>): Promise<Scene> {
    const scene = this.scenes.get(id);
    if (!scene) throw new Error("Scene not found");
    const updated = { ...scene, ...updates };
    this.scenes.set(id, updated);
    return updated;
  }

  async createThought(thought: InsertThought): Promise<Thought> {
    const id = this.currentId++;
    const newThought = { 
      ...thought, 
      id, 
      processed: false, 
      analysis: null,
      scenePrompts: [],
      reasoningSteps: null,
      createdAt: new Date()
    };
    this.thoughts.set(id, newThought);
    return newThought;
  }

  async getProjectThoughts(projectId: number): Promise<Thought[]> {
    return Array.from(this.thoughts.values())
      .filter(thought => thought.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateThought(id: number, updates: Partial<Thought>): Promise<Thought> {
    const thought = this.thoughts.get(id);
    if (!thought) throw new Error("Thought not found");
    const updated = { ...thought, ...updates };
    this.thoughts.set(id, updated);
    return updated;
  }

  async getScene(id: number): Promise<Scene | undefined> {
    return this.scenes.get(id);
  }
  
  // API Provider Methods
  async createApiProvider(provider: InsertApiProvider): Promise<ApiProvider> {
    const id = this.currentId++;
    const newProvider = { 
      ...provider, 
      id, 
      isActive: provider.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.apiProviders.set(id, newProvider);
    return newProvider;
  }

  async getApiProvider(id: number): Promise<ApiProvider | undefined> {
    return this.apiProviders.get(id);
  }

  async getApiProviderByName(name: string): Promise<ApiProvider | undefined> {
    return Array.from(this.apiProviders.values()).find(
      provider => provider.name === name
    );
  }

  async listApiProviders(activeOnly = false): Promise<ApiProvider[]> {
    let providers = Array.from(this.apiProviders.values());
    if (activeOnly) {
      providers = providers.filter(provider => provider.isActive);
    }
    return providers;
  }

  async updateApiProvider(id: number, updates: Partial<ApiProvider>): Promise<ApiProvider> {
    const provider = this.apiProviders.get(id);
    if (!provider) throw new Error("API Provider not found");
    
    const updated = { 
      ...provider, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.apiProviders.set(id, updated);
    return updated;
  }

  // API Key Methods
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentId++;
    const newApiKey = {
      ...apiKey,
      id,
      isActive: apiKey.isActive ?? true,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageMetadata: null,
      testStatus: null,
      testMessage: null,
    };
    this.apiKeys.set(id, newApiKey);
    return newApiKey;
  }

  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async getUserApiKeys(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(apiKey => apiKey.userId === userId);
  }

  async getUserApiKeyForProvider(userId: number, providerId: number): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(
      apiKey => apiKey.userId === userId && apiKey.providerId === providerId && apiKey.isActive
    );
  }

  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) throw new Error("API Key not found");
    
    const updated = { 
      ...apiKey, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.apiKeys.set(id, updated);
    return updated;
  }

  async deleteApiKey(id: number): Promise<boolean> {
    if (!this.apiKeys.has(id)) return false;
    return this.apiKeys.delete(id);
  }

  // Pipeline Configuration Methods
  async createPipelineConfiguration(config: InsertPipelineConfiguration): Promise<PipelineConfiguration> {
    const id = this.currentId++;
    const newConfig = {
      ...config,
      id,
      isActive: config.isActive ?? true,
      isDefault: config.isDefault ?? false,
      performanceMetrics: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // If this is set as default, update other configurations
    if (newConfig.isDefault) {
      for (const [configId, existingConfig] of this.pipelineConfigurations.entries()) {
        if (existingConfig.isDefault && configId !== id) {
          this.pipelineConfigurations.set(configId, {
            ...existingConfig,
            isDefault: false,
            updatedAt: new Date()
          });
        }
      }
    }
    
    this.pipelineConfigurations.set(id, newConfig);
    return newConfig;
  }

  async getPipelineConfiguration(id: number): Promise<PipelineConfiguration | undefined> {
    return this.pipelineConfigurations.get(id);
  }

  async listPipelineConfigurations(activeOnly = false): Promise<PipelineConfiguration[]> {
    let configs = Array.from(this.pipelineConfigurations.values());
    if (activeOnly) {
      configs = configs.filter(config => config.isActive);
    }
    return configs;
  }

  async getDefaultPipelineConfiguration(): Promise<PipelineConfiguration | undefined> {
    return Array.from(this.pipelineConfigurations.values()).find(
      config => config.isDefault && config.isActive
    );
  }

  async getUserPipelineConfigurations(userId: number, activeOnly = false): Promise<PipelineConfiguration[]> {
    let configs = Array.from(this.pipelineConfigurations.values())
      .filter(config => config.userId === userId);
    
    if (activeOnly) {
      configs = configs.filter(config => config.isActive);
    }
    
    return configs;
  }

  async updatePipelineConfiguration(id: number, updates: Partial<PipelineConfiguration>): Promise<PipelineConfiguration> {
    const config = this.pipelineConfigurations.get(id);
    if (!config) throw new Error("Pipeline Configuration not found");
    
    const updated = { 
      ...config, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    // If this is being set as default, update other configurations
    if (updates.isDefault) {
      for (const [configId, existingConfig] of this.pipelineConfigurations.entries()) {
        if (existingConfig.isDefault && configId !== id) {
          this.pipelineConfigurations.set(configId, {
            ...existingConfig,
            isDefault: false,
            updatedAt: new Date()
          });
        }
      }
    }
    
    this.pipelineConfigurations.set(id, updated);
    return updated;
  }

  async deletePipelineConfiguration(id: number): Promise<boolean> {
    if (!this.pipelineConfigurations.has(id)) return false;
    return this.pipelineConfigurations.delete(id);
  }

  // Service Registry Methods
  async createServiceRegistry(service: InsertServiceRegistry): Promise<ServiceRegistry> {
    const id = this.currentId++;
    const newService = {
      ...service,
      id,
      isActive: service.isActive ?? true,
      priority: service.priority ?? 0,
      performanceMetrics: null,
      healthStatus: "unknown",
      lastHealthCheck: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.serviceRegistry.set(id, newService);
    return newService;
  }

  async getServiceRegistry(id: number): Promise<ServiceRegistry | undefined> {
    return this.serviceRegistry.get(id);
  }

  async listServiceRegistry(activeOnly = false): Promise<ServiceRegistry[]> {
    let services = Array.from(this.serviceRegistry.values());
    if (activeOnly) {
      services = services.filter(service => service.isActive);
    }
    return services.sort((a, b) => b.priority - a.priority);
  }

  async getServicesByProvider(providerId: number): Promise<ServiceRegistry[]> {
    return Array.from(this.serviceRegistry.values())
      .filter(service => service.providerId === providerId)
      .sort((a, b) => b.priority - a.priority);
  }

  async getServicesByType(serviceType: string): Promise<ServiceRegistry[]> {
    return Array.from(this.serviceRegistry.values())
      .filter(service => service.serviceType === serviceType && service.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  async updateServiceRegistry(id: number, updates: Partial<ServiceRegistry>): Promise<ServiceRegistry> {
    const service = this.serviceRegistry.get(id);
    if (!service) throw new Error("Service Registry entry not found");
    
    const updated = { 
      ...service, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.serviceRegistry.set(id, updated);
    return updated;
  }

  async updateServiceHealthStatus(id: number, status: string): Promise<ServiceRegistry> {
    const service = this.serviceRegistry.get(id);
    if (!service) throw new Error("Service Registry entry not found");
    
    const updated = { 
      ...service, 
      healthStatus: status, 
      lastHealthCheck: new Date(),
      updatedAt: new Date() 
    };
    
    this.serviceRegistry.set(id, updated);
    return updated;
  }

  // Pipeline Execution Methods
  async createPipelineExecution(execution: InsertPipelineExecution): Promise<PipelineExecution> {
    const id = this.currentId++;
    const newExecution = {
      ...execution,
      id,
      status: execution.status ?? "pending",
      startedAt: new Date(),
      completedAt: null
    };
    
    this.pipelineExecutions.set(id, newExecution);
    return newExecution;
  }

  async getPipelineExecution(id: number): Promise<PipelineExecution | undefined> {
    return this.pipelineExecutions.get(id);
  }

  async updatePipelineExecution(id: number, updates: Partial<PipelineExecution>): Promise<PipelineExecution> {
    const execution = this.pipelineExecutions.get(id);
    if (!execution) throw new Error("Pipeline Execution not found");
    
    const updated = { ...execution, ...updates };
    this.pipelineExecutions.set(id, updated);
    return updated;
  }

  async listPipelineExecutions(pipelineId: number): Promise<PipelineExecution[]> {
    return Array.from(this.pipelineExecutions.values())
      .filter(execution => execution.pipelineId === pipelineId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async completePipelineExecution(id: number, outputData: any, metrics: any): Promise<PipelineExecution> {
    const execution = this.pipelineExecutions.get(id);
    if (!execution) throw new Error("Pipeline Execution not found");
    
    const updated = { 
      ...execution, 
      status: "completed", 
      outputData,
      executionMetrics: metrics,
      completedAt: new Date() 
    };
    
    this.pipelineExecutions.set(id, updated);
    return updated;
  }

  async failPipelineExecution(id: number, error: any): Promise<PipelineExecution> {
    const execution = this.pipelineExecutions.get(id);
    if (!execution) throw new Error("Pipeline Execution not found");
    
    const updated = { 
      ...execution, 
      status: "failed", 
      error,
      completedAt: new Date() 
    };
    
    this.pipelineExecutions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();