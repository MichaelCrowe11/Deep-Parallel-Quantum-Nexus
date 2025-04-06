import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("draft"),
});

export const pipelineConfigurations = pgTable("pipeline_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  userId: integer("user_id"),
  stages: jsonb("stages").notNull(),
  routingRules: jsonb("routing_rules"),
  fallbackConfig: jsonb("fallback_config"),
  performanceMetrics: jsonb("performance_metrics"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceRegistry = pgTable("service_registry", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  serviceName: text("service_name").notNull(),
  serviceType: text("service_type").notNull(),
  apiVersion: text("api_version"),
  capabilities: text("capabilities").array(),
  endpoint: text("endpoint"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  performanceMetrics: jsonb("performance_metrics"),
  healthStatus: text("health_status").default("unknown"),
  lastHealthCheck: timestamp("last_health_check"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pipelineExecutions = pgTable("pipeline_executions", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").notNull(),
  status: text("status").notNull().default("pending"),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  error: jsonb("error"),
  executionMetrics: jsonb("execution_metrics"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const apiProviders = pgTable("api_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  website: text("website"),
  documentationUrl: text("documentation_url"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  capabilities: text("capabilities").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerId: integer("provider_id").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  usageMetadata: jsonb("usage_metadata"),
  testStatus: text("test_status"),
  testMessage: text("test_message"),
});

export const scenes = pgTable("scenes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  order: integer("order").notNull(),
  description: text("description").notNull(),
  enhancedDescription: text("enhanced_description"),
  sourceThoughtId: integer("source_thought_id"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  status: text("status").notNull().default("draft"),
  transitionDescription: text("transition_description"),
  transitionType: text("transition_type"),
  previousSceneContext: jsonb("previous_scene_context"),
  nextSceneContext: jsonb("next_scene_context"),
  transitionTiming: integer("transition_timing"),
  transitionEffects: text("transition_effects").array(),
  transitionSoundscape: text("transition_soundscape"),
  visualFlowMetadata: jsonb("visual_flow_metadata")
});

export const thoughts = pgTable("thoughts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  content: text("content").notNull(),
  processed: boolean("processed").default(false),
  analysis: jsonb("analysis"),
  scenePrompts: text("scene_prompts").array(),
  reasoningSteps: jsonb("reasoning_steps"),
  createdAt: timestamp("created_at").defaultNow(),

  // Enhanced thought pattern recognition
  patternMetadata: jsonb("pattern_metadata"),
  conceptualLinks: jsonb("conceptual_links"),
  experimentalDirections: text("experimental_directions").array(),
  visualRepresentations: jsonb("visual_representations"),
  technicalFeasibility: jsonb("technical_feasibility"),

  // New fields for expanded pipeline
  emergentThemes: jsonb("emergent_themes"),
  crossModelValidation: jsonb("cross_model_validation"),
  processingMetrics: jsonb("processing_metrics"),
  thoughtFlow: jsonb("thought_flow"),
  visualTransformations: jsonb("visual_transformations"),
  narrativeStructure: jsonb("narrative_structure"),

  // Creative processing metadata
  creativeElements: jsonb("creative_elements"),
  visualComposition: jsonb("visual_composition"),
  storyboardMetadata: jsonb("storyboard_metadata"),

  // Output synthesis data
  synthesisResults: jsonb("synthesis_results"),
  modalityBridges: jsonb("modality_bridges"),
  generationParameters: jsonb("generation_parameters"),

  // Multi-stage processing data
  stageOneAnalysis: jsonb("stage_one_analysis"),
  stageTwoAnalysis: jsonb("stage_two_analysis"),
  stageThreeAnalysis: jsonb("stage_three_analysis"),
  finalSynthesis: jsonb("final_synthesis"),

  // Model-specific outputs
  perplexityOutput: jsonb("perplexity_output"),
  claudeOutputs: jsonb("claude_outputs"),
  openaiOutput: jsonb("openai_output"),
  runwayOutput: jsonb("runway_output"),

  // Visual generation metadata
  storyboardElements: jsonb("storyboard_elements"),
  visualGenerationPrompts: jsonb("visual_generation_prompts"),
  videoGenerationMetadata: jsonb("video_generation_metadata")
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
});

export const insertSceneSchema = createInsertSchema(scenes).pick({
  projectId: true,
  order: true,
  description: true,
  sourceThoughtId: true,
  transitionDescription: true,
  transitionType: true,
  previousSceneContext: true,
  nextSceneContext: true,
  transitionTiming: true,
  transitionEffects: true,
  transitionSoundscape: true,
  visualFlowMetadata: true
});

export const insertThoughtSchema = createInsertSchema(thoughts).pick({
  projectId: true,
  content: true,
  patternMetadata: true,
  conceptualLinks: true,
  experimentalDirections: true,
  visualRepresentations: true,
  technicalFeasibility: true,
  emergentThemes: true,
  crossModelValidation: true,
  processingMetrics: true,
  thoughtFlow: true,
  visualTransformations: true,
  narrativeStructure: true,
  creativeElements: true,
  visualComposition: true,
  storyboardMetadata: true,
  synthesisResults: true,
  modalityBridges: true,
  generationParameters: true,
  stageOneAnalysis: true,
  stageTwoAnalysis: true,
  stageThreeAnalysis: true,
  finalSynthesis: true,
  perplexityOutput: true,
  claudeOutputs: true,
  openaiOutput: true,
  runwayOutput: true,
  storyboardElements: true,
  visualGenerationPrompts: true,
  videoGenerationMetadata: true
});

export const insertApiProviderSchema = createInsertSchema(apiProviders).pick({
  name: true,
  displayName: true,
  description: true,
  website: true,
  documentationUrl: true,
  logoUrl: true,
  isActive: true,
  capabilities: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  providerId: true,
  name: true,
  key: true,
  isActive: true,
  expiresAt: true,
});

export const insertPipelineConfigurationSchema = createInsertSchema(pipelineConfigurations).pick({
  name: true,
  description: true,
  isDefault: true,
  isActive: true,
  userId: true,
  stages: true,
  routingRules: true,
  fallbackConfig: true,
});

export const insertServiceRegistrySchema = createInsertSchema(serviceRegistry).pick({
  providerId: true,
  serviceName: true,
  serviceType: true,
  apiVersion: true,
  capabilities: true,
  endpoint: true,
  isActive: true,
  priority: true,
});

export const insertPipelineExecutionSchema = createInsertSchema(pipelineExecutions).pick({
  pipelineId: true,
  status: true,
  inputData: true,
  outputData: true,
  error: true,
  executionMetrics: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type InsertThought = z.infer<typeof insertThoughtSchema>;
export type InsertApiProvider = z.infer<typeof insertApiProviderSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type InsertPipelineConfiguration = z.infer<typeof insertPipelineConfigurationSchema>;
export type InsertServiceRegistry = z.infer<typeof insertServiceRegistrySchema>;
export type InsertPipelineExecution = z.infer<typeof insertPipelineExecutionSchema>;

export type Project = typeof projects.$inferSelect;
export type Scene = typeof scenes.$inferSelect;
export type Thought = typeof thoughts.$inferSelect;
export type ApiProvider = typeof apiProviders.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type PipelineConfiguration = typeof pipelineConfigurations.$inferSelect;
export type ServiceRegistry = typeof serviceRegistry.$inferSelect;
export type PipelineExecution = typeof pipelineExecutions.$inferSelect;