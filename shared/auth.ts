import { z } from 'zod';

// User authentication schema
export const userAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['user', 'admin', 'owner']),
  createdAt: z.date(),
});

// Login request schema
export const loginSchema = userAuthSchema;

// Registration request schema
export const registerSchema = userAuthSchema.extend({
  name: z.string().optional(),
});

// Auth response schema
export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  user: userSchema.optional(),
  token: z.string().optional(),
});

// User types
export type User = z.infer<typeof userSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

// Mock owner account for initial development
export const OWNER_EMAIL = 'owner@deepparallel.ai';
export const OWNER_PASSWORD = 'deep-parallel-2025'; // This would be hashed in production