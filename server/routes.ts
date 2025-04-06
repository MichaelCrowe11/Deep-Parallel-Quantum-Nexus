import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { processThought } from "./anthropic";
import { insertProjectSchema, insertSceneSchema, insertThoughtSchema } from "@shared/schema";
import { loginSchema, registerSchema } from "@shared/auth";
import { ZodError } from "zod";
import { EmailService } from "./email";
import * as path from "path";
import * as fs from "fs";
import fileUpload, { UploadedFile } from "express-fileupload";
import multer from "multer";
import { authenticateUser, authenticateRequest, requireAdmin, requireOwner } from "./auth";
import logger, { LogLevel } from "./logger";
import { initializeDefaultProviders, testApiKey, getUserApiKeyStatus } from "./api-management";

// Add FileRequest interface to extend Request with files property
interface FileRequest extends Request {
  files: {
    [fieldname: string]: UploadedFile | UploadedFile[];
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Track active visualization sessions
const sessions = new Map();

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'visualization_start':
        const sessionId = crypto.randomUUID();
        sessions.set(sessionId, { ws, state: message.initialState });
        ws.send(JSON.stringify({ type: 'session_created', sessionId }));
        break;

      case 'thought_update':
        // Broadcast thought updates to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'thought_updated',
              data: message.data
            }));
          }
        });
        break;
        
      case 'run_pipeline':
        try {
          // Handle pipeline execution request
          const { pipelineId, input, options } = message;
          
          if (!input) {
            ws.send(JSON.stringify({ 
              type: 'pipeline_error', 
              error: 'Input is required'
            }));
            break;
          }
          
          const { runPipeline } = await import('./pipeline-orchestration');
          logger.info(`Running pipeline via WebSocket: ${pipelineId}`, { input: input.substring(0, 100) });
          
          const result = await runPipeline(pipelineId, input, {
            ...options,
            forceSync: true // Force synchronous execution for WebSocket
          });
          
          ws.send(JSON.stringify({
            type: 'pipeline_result',
            executionId: result.executionId,
            result: result.result
          }));
        } catch (error) {
          logger.error('Error running pipeline via WebSocket', error);
          ws.send(JSON.stringify({ 
            type: 'pipeline_error', 
            error: error.message || 'Unknown error'
          }));
        }
        break;
    }
  });
});

  // Project routes
  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.issues[0].message });
      } else {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        res.status(400).json({ message });
      }
    }
  });

  app.get("/api/projects", async (req, res) => {
    const projects = await storage.listProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  });

  // Scene routes
  app.post("/api/scenes", async (req, res) => {
    try {
      const data = insertSceneSchema.parse(req.body);
      const scene = await storage.createScene(data);
      res.json(scene);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.issues[0].message });
      } else {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        res.status(400).json({ message });
      }
    }
  });

  app.get("/api/projects/:id/scenes", async (req, res) => {
    const scenes = await storage.getProjectScenes(parseInt(req.params.id));
    res.json(scenes);
  });

  // Thought routes with enhanced processing
  app.post("/api/thoughts", async (req, res) => {
    try {
      const data = insertThoughtSchema.parse(req.body);
      const thought = await storage.createThought(data);

      // Process thought with Claude 3.7
      const processedData = await processThought(thought.content);

      // Update thought with analysis and generated scenes
      const updatedThought = await storage.updateThought(thought.id, {
        processed: true,
        analysis: processedData.analysis,
        scenePrompts: processedData.scenePrompts,
        reasoningSteps: processedData.reasoningSteps
      });

      // Create scenes from the generated prompts
      const scenes = await storage.createScenesFromThought(
        thought.id,
        processedData.scenePrompts.map(prompt => ({
          projectId: data.projectId,
          description: prompt
        }))
      );

      // Broadcast update to connected clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'thought_processed',
            thought: updatedThought,
            scenes
          }));
        }
      });

      res.json({
        thought: updatedThought,
        scenes
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.issues[0].message });
      } else {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        res.status(400).json({ message });
      }
    }
  });

  app.get("/api/projects/:id/thoughts", async (req, res) => {
    const thoughts = await storage.getProjectThoughts(parseInt(req.params.id));
    res.json(thoughts);
  });

  // Email endpoints

  // Get email service status - useful for debugging
  app.get("/api/email/status", async (req, res) => {
    try {
      const emailService = new EmailService();

      // Check if API key is configured
      const apiKeyConfigured = Boolean(process.env.MAILGUN_API_KEY);
      const apiKeyMasked = apiKeyConfigured ? 
        `${process.env.MAILGUN_API_KEY?.substring(0, 5)}...${process.env.MAILGUN_API_KEY?.substring(process.env.MAILGUN_API_KEY.length - 4)}` : 
        'Not configured';

      // Check if domain is configured
      const domainConfigured = Boolean(process.env.MAILGUN_DOMAIN);
      const domain = process.env.MAILGUN_DOMAIN || 'Not configured';

      res.json({
        status: "Email service diagnostic information",
        apiKeyConfigured,
        apiKeyMasked,
        domainConfigured,
        domain,
        isValidConfiguration: emailService.isValidConfiguration(),
        mailgunApiVersion: 'v3',
        mailgunBaseUrl: 'https://api.mailgun.net/v3',
        environment: process.env.NODE_ENV || 'development',
        secretsAvailable: {
          MAILGUN_API_KEY: apiKeyConfigured,
          MAILGUN_DOMAIN: domainConfigured,
          DEVELOPER_EMAIL: Boolean(process.env.DEVELOPER_EMAIL)
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ message });
    }
  });

  // Email test endpoints
  app.post("/api/email/test", async (req, res) => {
    try {
      const { to, subject, text } = req.body;

      if (!to || !subject || !text) {
        return res.status(400).json({ 
          message: "Missing required fields: to, subject, text" 
        });
      }

      const emailService = new EmailService();
      const result = await emailService.sendSimpleMessage(to, subject, text);

      if (result.success) {
        res.json({ message: "Email sent successfully", data: result.data });
      } else {
        res.status(500).json({ 
          message: "Failed to send email", 
          error: result.error,
          helpMessage: "If you're using a Mailgun sandbox domain, make sure the recipient email is authorized in your Mailgun account. Also verify that your API key and domain are correctly configured.",
          troubleshooting: [
            "Check if your Mailgun API key is valid and active",
            "Verify your Mailgun domain is properly set up",
            "For sandbox domains, add authorized recipients in your Mailgun dashboard",
            "Check for API rate limits or account restrictions"
          ]
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ message });
    }
  });

  // Simple GET endpoint for testing email
  app.get("/api/email/test", async (req, res) => {
    try {
      const to = req.query.to as string;
      const subject = req.query.subject as string || "Test email from AI Thought Pipeline";
      const text = req.query.text as string || "This is a test email sent from the AI Thought Pipeline application.";

      if (!to) {
        return res.status(400).json({ 
          message: "Missing required query parameter: to" 
        });
      }

      const emailService = new EmailService();
      const result = await emailService.sendSimpleMessage(to, subject, text);

      if (result.success) {
        res.json({ message: "Email sent successfully", data: result.data });
      } else {
        res.status(500).json({ 
          message: "Failed to send email", 
          error: result.error,
          helpMessage: "If you're using a Mailgun sandbox domain, make sure the recipient email is authorized in your Mailgun account. Also verify that your API key and domain are correctly configured.",
          troubleshooting: [
            "Check if your Mailgun API key is valid and active",
            "Verify your Mailgun domain is properly set up",
            "For sandbox domains, add authorized recipients in your Mailgun dashboard",
            "Check for API rate limits or account restrictions"
          ]
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ message });
    }
  });

  // AI Services Status API
  app.get("/api/service/status", (req, res) => {
    try {
      // Check the status of all AI service API keys
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
      const togetherApiKey = process.env.TOGETHER_API_KEY;
      const mistralApiKey = process.env.MISTRAL_API_KEY;
      const deepInfraApiKey = process.env.DEEPINFRA_API_KEY;
      const openaiApiKey = process.env.OPENAI_API_KEY;
      const runwayApiKey = process.env.RUNWAY_ML_API_KEY;
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_AI_API;

      // Mask the keys for security
      const maskKey = (key: string | undefined): string => {
        if (!key) return "Not configured";
        if (key.length < 10) return "Invalid key format";
        return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
      };

      res.json({
        status: "AI services status",
        services: {
          anthropic: {
            configured: Boolean(anthropicApiKey),
            key: maskKey(anthropicApiKey),
            status: Boolean(anthropicApiKey) ? "Available" : "Not configured"
          },
          together: {
            configured: Boolean(togetherApiKey),
            key: maskKey(togetherApiKey),
            status: Boolean(togetherApiKey) ? "Available" : "Not configured"
          },
          mistral: {
            configured: Boolean(mistralApiKey),
            key: maskKey(mistralApiKey),
            status: Boolean(mistralApiKey) ? "Available" : "Not configured"
          },
          deepInfra: {
            configured: Boolean(deepInfraApiKey),
            key: maskKey(deepInfraApiKey),
            status: Boolean(deepInfraApiKey) ? "Available" : "Not configured"
          },
          openai: {
            configured: Boolean(openaiApiKey),
            key: maskKey(openaiApiKey),
            status: Boolean(openaiApiKey) ? "Available" : "Not configured"
          },
          runway: {
            configured: Boolean(runwayApiKey),
            key: maskKey(runwayApiKey),
            status: Boolean(runwayApiKey) ? "Available" : "Not configured"
          },
          perplexity: {
            configured: Boolean(perplexityApiKey),
            key: maskKey(perplexityApiKey),
            status: Boolean(perplexityApiKey) ? "Available" : "Not configured"
          }
        },
        allServicesConfigured: 
          Boolean(anthropicApiKey) && 
          Boolean(togetherApiKey) && 
          Boolean(mistralApiKey) && 
          Boolean(deepInfraApiKey) && 
          Boolean(openaiApiKey) && 
          Boolean(runwayApiKey) &&
          Boolean(perplexityApiKey)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ message });
    }
  });

  // AI Thought Processing API
  app.post("/api/thought/process", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ 
          message: "Missing required field: content" 
        });
      }

      const { processThought } = await import('./anthropic');
      const result = await processThought(content);

      res.json({
        message: "Thought processed successfully",
        result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ 
        message: "Failed to process thought",
        error: message
      });
    }
  });

  // AI Thought Analysis API
  app.post("/api/thought/analyze", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ 
          message: "Missing required field: content" 
        });
      }

      const { enhanceAnalysis } = await import('./together');
      const result = await enhanceAnalysis(content);

      res.json({
        message: "Thought analyzed successfully",
        result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ 
        message: "Failed to analyze thought",
        error: message
      });
    }
  });

  // Scene Visualization API
  app.post("/api/scene/visualize", async (req, res) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ 
          message: "Missing required field: description" 
        });
      }

      const { generateSceneVisualization } = await import('./deepinfra');
      const result = await generateSceneVisualization(description);

      res.json({
        message: "Scene visualization generated successfully",
        result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ 
        message: "Failed to generate scene visualization",
        error: message
      });
    }
  });

  /**
   * POST /api/scenes/:id/visualize
   * Generate visualization for a specific scene
   */
  app.post("/api/scenes/:id/visualize", async (req, res) => {
    try {
      const sceneId = parseInt(req.params.id);
      
      // Get the scene from storage
      const scene = await storage.getScene(sceneId);
      if (!scene) {
        return res.status(404).json({
          message: "Scene not found"
        });
      }

      // Generate visualization
      const { generateSceneVisualization } = await import('./deepinfra');
      const description = scene.enhancedDescription || scene.description;
      const result = await generateSceneVisualization(description);

      // Update the scene with the image URL if available
      if (typeof result === 'object' && result.imageUrl) {
        await storage.updateScene(sceneId, {
          videoUrl: result.imageUrl // For now, using videoUrl for images too until we add separate field
        });
      }

      res.json({
        message: "Scene visualization generated successfully",
        result
      });
    } catch (error) {
      logger.error("Scene visualization failed", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ 
        message: "Failed to generate scene visualization",
        error: message
      });
    }
  });

  /**
   * POST /api/scenes/:id/generate-video
   * Generate video for a specific scene
   */
  app.post("/api/scenes/:id/generate-video", async (req, res) => {
    try {
      const sceneId = parseInt(req.params.id);
      
      // Get the scene from storage
      const scene = await storage.getScene(sceneId);
      if (!scene) {
        return res.status(404).json({
          message: "Scene not found"
        });
      }

      // Generate video using DeepInfra or Runway based on configuration
      const description = scene.enhancedDescription || scene.description;
      
      // First try Runway for higher quality if available
      try {
        const { generateRunwayVideo } = await import('./runway');
        const isValid = await import('./runway').then(m => m.validateRunwayAPIKey());
        
        if (isValid) {
          logger.info("Using Runway for video generation", { sceneId });
          const result = await generateRunwayVideo({
            prompt: description,
            num_frames: 24,
            fps: 8,
            guidance_scale: 12
          });
          
          if (result && result.videoUrl) {
            // Update the scene with the video URL
            await storage.updateScene(sceneId, {
              videoUrl: result.videoUrl,
              status: "completed"
            });
            
            return res.json({
              message: "Scene video generated successfully with Runway",
              videoUrl: result.videoUrl,
              provider: "runway"
            });
          }
        }
      } catch (runwayError) {
        logger.warning("Runway video generation failed, falling back to DeepInfra", { error: runwayError });
        // Fall back to DeepInfra
      }
      
      // Fallback to DeepInfra
      const { generateVideo } = await import('./deepinfra');
      logger.info("Using DeepInfra for video generation", { sceneId });
      const result = await generateVideo(description, {
        duration: 4,
        fps: 8
      });
      
      if (typeof result === 'object' && result.videoUrl) {
        // Update the scene with the video URL
        await storage.updateScene(sceneId, {
          videoUrl: result.videoUrl,
          status: "completed"
        });
        
        res.json({
          message: "Scene video generated successfully with DeepInfra",
          videoUrl: result.videoUrl,
          provider: "deepinfra"
        });
      } else {
        res.status(500).json({
          message: "Failed to generate video: No URL returned",
        });
      }
    } catch (error) {
      logger.error("Video generation failed", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ 
        message: "Failed to generate scene video",
        error: message
      });
    }
  });

  // Research Prompts API
  app.get("/api/research-prompts", async (req, res) => {
    try {
      const { getRandomResearchPrompt } = await import('./perplexity');
      const prompt = getRandomResearchPrompt();

      res.json({
        prompt
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ 
        message: "Failed to generate research prompt",
        error: message
      });
    }
  });

  // Configure storage for uploaded files
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Store uploads in the attached_assets directory
      const uploadDir = path.join(process.cwd(), 'attached_assets');

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
      // Accept only images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Image Upload API
  app.post('/api/upload/image', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get the file information
      const file = req.file;
      const filePath = path.join('/attached_assets', path.basename(file.path));

      // Respond with success and file information
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        file: {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          path: filePath
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({
        success: false,
        message: `Failed to upload image: ${message}`
      });
    }
  });

  // File Upload API using express-fileupload middleware as an alternative
  app.post('/api/upload/file', (req: Request, res) => {
    // Cast request to FileRequest to access files property
    const fileReq = req as unknown as FileRequest;
    try {
      if (!fileReq.files || Object.keys(fileReq.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded'
        });
      }

      // The name of the input field (i.e. "file") is used to retrieve the uploaded file
      const uploadedFile = fileReq.files.file;

      // Handle both single file and array of files
      if (Array.isArray(uploadedFile)) {
        return res.status(400).json({
          success: false,
          message: 'Multiple files detected. Please upload one file at a time.'
        });
      }

      const uploadPath = path.join(process.cwd(), 'attached_assets', uploadedFile.name);

      // Use the mv() method to place the file on the server
      uploadedFile.mv(uploadPath, (err: any) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: `Failed to move file: ${err.message}`
          });
        }

        // Respond with success and file information
        res.json({
          success: true,
          message: 'File uploaded successfully',
          file: {
            name: uploadedFile.name,
            type: uploadedFile.mimetype,
            size: uploadedFile.size,
            path: `/attached_assets/${uploadedFile.name}`
          }
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({
        success: false,
        message: `Failed to upload file: ${message}`
      });
    }
  });

  // Get all images in the attached_assets directory
  app.get('/api/images', (req, res) => {
    try {
      const assetsDir = path.join(process.cwd(), 'attached_assets');

      if (!fs.existsSync(assetsDir)) {
        return res.json({
          success: true,
          images: []
        });
      }

      // Read all files in the directory
      const files = fs.readdirSync(assetsDir);

      // Filter for image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map(file => ({
          name: file,
          path: `/attached_assets/${file}`,
          url: `/attached_assets/${file}`,
          type: path.extname(file).substring(1)
        }));

      res.json({
        success: true,
        images
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({
        success: false,
        message: `Failed to get images: ${message}`
      });
    }
  });

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      logger.info(`Login attempt for user: ${data.email}`);

      const result = authenticateUser(data.email, data.password);

      if (result.success) {
        // Return user info and token but exclude sensitive data
        const { user, token } = result;

        if (user && token) {
          logger.info(`User authenticated: ${user.email}`, { userId: user.id });

          // Don't send password hash in response
          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            token
          });
        } else {
          // This should not happen
          logger.error('Authentication success but missing user or token');
          res.status(500).json({
            success: false,
            message: 'Authentication error: Missing user or token'
          });
        }
      } else {
        // Authentication failed
        logger.warning(`Authentication failed for ${data.email}`, { message: result.message });
        res.status(401).json({
          success: false,
          message: result.message || 'Invalid credentials'
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0].message;
        logger.warning('Login validation error', { message });
        res.status(400).json({ 
          success: false, 
          message 
        });
      } else {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        logger.error('Login error', { message });
        res.status(500).json({ 
          success: false, 
          message 
        });
      }
    }
  });

  // Get current user info
  app.get('/api/auth/me', authenticateRequest, (req, res) => {
    try {
      const user = (req as any).user;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      logger.error('Error fetching user info', { message });
      res.status(500).json({ 
        success: false, 
        message 
      });
    }
  });

  // Test endpoint that requires owner privileges
  app.get('/api/owner/test', authenticateRequest, requireOwner, (req, res) => {
    res.json({
      success: true,
      message: 'Owner access granted',
      user: (req as any).user
    });
  });

  // Logs endpoint that requires owner privileges
  app.get('/api/logs', authenticateRequest, requireOwner, (req, res) => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string) : 100;
      const level = req.query.level as LogLevel | undefined;

      const logs = logger.getLogEntries(count, level);

      res.json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      logger.error('Error retrieving logs', { message });
      res.status(500).json({ 
        success: false, 
        message 
      });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Add an assets status endpoint for debugging
  app.get("/api/assets/status", (_req, res) => {
    const assetsPath = path.join(process.cwd(), 'attached_assets');
    try {
      const exists = fs.existsSync(assetsPath);
      const stats = exists ? fs.statSync(assetsPath) : null;
      const isDirectory = stats ? stats.isDirectory() : false;

      let files = [];
      if (exists && isDirectory) {
        files = fs.readdirSync(assetsPath).slice(0, 20); // List first 20 files
      }

      res.json({
        exists,
        isDirectory,
        files,
        path: assetsPath,
        deployment: process.env.NODE_ENV === 'production'
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: error.message,
          path: assetsPath,
          deployment: process.env.NODE_ENV === 'production'
        });
      } else {
        res.status(500).json({
          error: "Unknown error",
          path: assetsPath,
          deployment: process.env.NODE_ENV === 'production'
        });
      }
    }
  });

  // ===== API Management Routes =====

  // Initialize API providers on startup
  initializeDefaultProviders().catch(err => {
    logger.error("Failed to initialize default API providers", err);
  });

  // List all API providers
  app.get("/api/providers", authenticateRequest, async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const providers = await storage.listApiProviders(activeOnly);
      
      // Filter sensitive data before sending
      const filteredProviders = providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName,
        description: provider.description,
        website: provider.website,
        documentationUrl: provider.documentationUrl,
        logoUrl: provider.logoUrl,
        isActive: provider.isActive,
        capabilities: provider.capabilities
      }));
      
      res.json(filteredProviders);
    } catch (error) {
      logger.error("Failed to list API providers", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Get API provider by ID
  app.get("/api/providers/:id", authenticateRequest, async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const provider = await storage.getApiProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "API provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      logger.error("Failed to get API provider", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Get user API keys
  app.get("/api/keys", authenticateRequest, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const apiKeys = await storage.getUserApiKeys(userId);
      
      // Filter sensitive data before sending
      const filteredKeys = await Promise.all(apiKeys.map(async key => {
        const provider = await storage.getApiProvider(key.providerId);
        
        return {
          id: key.id,
          providerId: key.providerId,
          providerName: provider?.name || "Unknown",
          providerDisplayName: provider?.displayName || "Unknown Provider",
          name: key.name,
          createdAt: key.createdAt,
          lastUsed: key.lastUsed,
          isActive: key.isActive,
          expiresAt: key.expiresAt,
          testStatus: key.testStatus,
          keyPreview: key.key.substring(0, 3) + "..." + key.key.substring(key.key.length - 3)
        };
      }));
      
      res.json(filteredKeys);
    } catch (error) {
      logger.error("Failed to list API keys", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Add a new API key
  app.post("/api/keys", authenticateRequest, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { providerId, name, key } = req.body;
      
      if (!providerId || !name || !key) {
        return res.status(400).json({ message: "Missing required fields: providerId, name, key" });
      }
      
      // Check if provider exists
      const provider = await storage.getApiProvider(providerId);
      if (!provider) {
        return res.status(404).json({ message: "API provider not found" });
      }
      
      // Create new API key
      const newApiKey = await storage.createApiKey({
        userId,
        providerId,
        name,
        key,
        isActive: true,
        expiresAt: null
      });
      
      // Test the key
      const testResult = await testApiKey(newApiKey);
      
      // Update the key with test results
      const updatedApiKey = await storage.updateApiKey(newApiKey.id, {
        testStatus: testResult.success ? "valid" : "invalid",
        testMessage: testResult.message
      });
      
      // Return success with masked key
      res.json({
        id: updatedApiKey.id,
        providerId: updatedApiKey.providerId,
        providerName: provider.name,
        providerDisplayName: provider.displayName,
        name: updatedApiKey.name,
        isActive: updatedApiKey.isActive,
        testStatus: updatedApiKey.testStatus,
        testMessage: updatedApiKey.testMessage,
        keyPreview: updatedApiKey.key.substring(0, 3) + "..." + updatedApiKey.key.substring(updatedApiKey.key.length - 3)
      });
    } catch (error) {
      logger.error("Failed to create API key", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Delete an API key
  app.delete("/api/keys/:id", authenticateRequest, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const keyId = parseInt(req.params.id);
      
      // Check if the key exists and belongs to the user
      const apiKey = await storage.getApiKey(keyId);
      
      if (!apiKey) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      if (apiKey.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this API key" });
      }
      
      // Delete the key
      const success = await storage.deleteApiKey(keyId);
      
      if (success) {
        res.json({ message: "API key deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete API key" });
      }
    } catch (error) {
      logger.error("Failed to delete API key", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Test an API key
  app.post("/api/keys/:id/test", authenticateRequest, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const keyId = parseInt(req.params.id);
      
      // Check if the key exists and belongs to the user
      const apiKey = await storage.getApiKey(keyId);
      
      if (!apiKey) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      if (apiKey.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to test this API key" });
      }
      
      // Test the key
      const testResult = await testApiKey(apiKey);
      
      // Update the key with test results
      await storage.updateApiKey(keyId, {
        testStatus: testResult.success ? "valid" : "invalid",
        testMessage: testResult.message,
        lastUsed: new Date()
      });
      
      res.json({
        keyId,
        success: testResult.success,
        message: testResult.message
      });
    } catch (error) {
      logger.error("Failed to test API key", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Get provider status with keys for the current user
  app.get("/api/provider-status", authenticateRequest, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const providers = await storage.listApiProviders(true);
      
      const result = await Promise.all(providers.map(async provider => {
        const status = await getUserApiKeyStatus(userId, provider.name);
        
        return {
          id: provider.id,
          name: provider.name,
          displayName: provider.displayName,
          description: provider.description,
          logoUrl: provider.logoUrl,
          capabilities: provider.capabilities,
          keyStatus: {
            hasKey: status.hasKey,
            isValid: status.isValid,
            lastTested: status.lastTested,
            message: status.message
          }
        };
      }));
      
      res.json(result);
    } catch (error) {
      logger.error("Failed to get provider status", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

  // Pipeline Orchestration System Routes
  
  /**
   * GET /api/pipelines
   * Get all pipeline configurations
   */
  app.get('/api/pipelines', async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let pipelines;
      if (userId) {
        pipelines = await storage.getUserPipelineConfigurations(userId, activeOnly);
      } else {
        pipelines = await storage.listPipelineConfigurations(activeOnly);
      }
      
      res.json(pipelines);
    } catch (error) {
      logger.error('Failed to get pipelines', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * GET /api/pipelines/:id
   * Get a specific pipeline configuration
   */
  app.get('/api/pipelines/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pipeline = await storage.getPipelineConfiguration(id);
      
      if (!pipeline) {
        return res.status(404).json({ message: 'Pipeline configuration not found' });
      }
      
      res.json(pipeline);
    } catch (error) {
      logger.error('Failed to get pipeline', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * POST /api/pipelines
   * Create a new pipeline configuration
   */
  app.post('/api/pipelines', async (req, res) => {
    try {
      const pipeline = await storage.createPipelineConfiguration(req.body);
      res.status(201).json(pipeline);
    } catch (error) {
      logger.error('Failed to create pipeline', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * PUT /api/pipelines/:id
   * Update a pipeline configuration
   */
  app.put('/api/pipelines/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pipeline = await storage.updatePipelineConfiguration(id, req.body);
      res.json(pipeline);
    } catch (error) {
      logger.error('Failed to update pipeline', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * DELETE /api/pipelines/:id
   * Delete a pipeline configuration
   */
  app.delete('/api/pipelines/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deletePipelineConfiguration(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Pipeline configuration not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      logger.error('Failed to delete pipeline', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * POST /api/pipelines/execute
   * Execute a pipeline
   */
  app.post('/api/pipelines/execute', async (req, res) => {
    try {
      const { pipelineId, input, options } = req.body;
      
      if (!input) {
        return res.status(400).json({ message: 'Input is required' });
      }
      
      const { runPipeline } = await import('./pipeline-orchestration');
      const result = await runPipeline(pipelineId, input, options);
      
      res.json(result);
    } catch (error) {
      logger.error('Failed to execute pipeline', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * GET /api/pipeline-executions/:id
   * Get the status of a pipeline execution
   */
  app.get('/api/pipeline-executions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { getPipelineExecutionStatus } = await import('./pipeline-orchestration');
      const status = await getPipelineExecutionStatus(id);
      
      res.json(status);
    } catch (error) {
      logger.error('Failed to get pipeline execution status', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * GET /api/pipeline-executions
   * Get all executions for a pipeline
   */
  app.get('/api/pipeline-executions', async (req, res) => {
    try {
      const pipelineId = req.query.pipelineId ? parseInt(req.query.pipelineId as string) : undefined;
      
      if (!pipelineId) {
        return res.status(400).json({ message: 'Pipeline ID is required' });
      }
      
      const executions = await storage.listPipelineExecutions(pipelineId);
      res.json(executions);
    } catch (error) {
      logger.error('Failed to get pipeline executions', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * POST /api/services
   * Register a new service in the registry
   */
  app.post('/api/services', async (req, res) => {
    try {
      const service = await storage.createServiceRegistry(req.body);
      res.status(201).json(service);
    } catch (error) {
      logger.error('Failed to create service', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * GET /api/services
   * Get all services in the registry
   */
  app.get('/api/services', async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const services = await storage.listServiceRegistry(activeOnly);
      res.json(services);
    } catch (error) {
      logger.error('Failed to get services', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * GET /api/services/by-type/:type
   * Get services by type
   */
  app.get('/api/services/by-type/:type', async (req, res) => {
    try {
      const type = req.params.type;
      const services = await storage.getServicesByType(type);
      res.json(services);
    } catch (error) {
      logger.error('Failed to get services by type', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * PUT /api/services/:id
   * Update a service in the registry
   */
  app.put('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.updateServiceRegistry(id, req.body);
      res.json(service);
    } catch (error) {
      logger.error('Failed to update service', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  /**
   * PUT /api/services/:id/health
   * Update the health status of a service
   */
  app.put('/api/services/:id/health', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const service = await storage.updateServiceHealthStatus(id, status);
      res.json(service);
    } catch (error) {
      logger.error('Failed to update service health', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  });

  // Initialize pipeline orchestration system at server startup
  try {
    const { initializePipelineSystem } = await import('./pipeline-orchestration');
    await initializePipelineSystem();
    logger.info('Pipeline orchestration system initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize pipeline orchestration system', error);
  }

  return httpServer;
}