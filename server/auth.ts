import { Request, Response, NextFunction } from 'express';
import { User, OWNER_EMAIL, OWNER_PASSWORD } from '@shared/auth';
import logger from './logger';
import crypto from 'crypto';

// Simple in-memory user store for development
// In production, you would use a database
const users: Map<string, User> = new Map();

// Simple in-memory token store
// In production, you would use JWT or sessions
const tokens: Map<string, { userId: number, expires: Date }> = new Map();

// Initialize with owner account
users.set(OWNER_EMAIL, {
  id: 1,
  email: OWNER_EMAIL,
  name: 'Deep Parallel Owner',
  role: 'owner',
  createdAt: new Date()
});

/**
 * Authenticate a user with email and password
 */
export function authenticateUser(email: string, password: string): { success: boolean; user?: User; token?: string; message?: string } {
  try {
    // Find user by email
    const user = users.get(email);
    
    if (!user) {
      logger.warning(`Authentication failed: user not found for email ${email}`);
      return { success: false, message: 'Invalid credentials' };
    }
    
    // For the owner account, use the hardcoded password
    if (email === OWNER_EMAIL) {
      if (password !== OWNER_PASSWORD) {
        logger.warning(`Authentication failed: invalid password for owner account`);
        return { success: false, message: 'Invalid credentials' };
      }
    } else {
      // For other users, check hashed password (not implemented for this demo)
      logger.warning(`Authentication failed: invalid password for user ${email}`);
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Generate token
    const token = generateToken();
    
    // Store token
    tokens.set(token, {
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    logger.info(`User authenticated successfully: ${email}`);
    return {
      success: true,
      user,
      token
    };
  } catch (error) {
    logger.error('Error authenticating user', error);
    return { success: false, message: 'Authentication error' };
  }
}

/**
 * Generate a random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to authenticate API requests
 */
export function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Validate token
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Check if token is expired
    if (tokenData.expires < new Date()) {
      tokens.delete(token);
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    
    // Get user
    const user = Array.from(users.values()).find(u => u.id === tokenData.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Attach user to request
    (req as any).user = user;
    
    next();
  } catch (error) {
    logger.error('Error authenticating request', error);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
}

/**
 * Middleware to check if user is an admin or owner
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User | undefined;
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  if (user.role !== 'admin' && user.role !== 'owner') {
    logger.warning(`Access denied: user ${user.email} attempted to access admin resource`);
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  next();
}

/**
 * Middleware to check if user is an owner
 */
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User | undefined;
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  if (user.role !== 'owner') {
    logger.warning(`Access denied: user ${user.email} attempted to access owner resource`);
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  next();
}