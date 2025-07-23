#!/usr/bin/env python3
"""
Create Minimal Server
Creates a basic working server.ts without complex dependencies
"""

def create_minimal_server(project_root: str):
    """Create a minimal working server.ts"""
    server_content = """import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// Types
export interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  requestId?: string;
}

// Initialize Express app
const app: Application = express();

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  (req as CustomRequest).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Basic logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({
    message: 'BOOM Card Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.path
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    requestId: (req as CustomRequest).requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    console.log('🔧 Initializing minimal BOOM Card backend...');
    
    app.listen(PORT, () => {
      console.log('🚀 BOOM Card Backend Server started successfully!');
      console.log(`🔗 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('✅ Health check available at: /health');
      console.log('✅ Test endpoint available at: /api/test');
      console.log('');
      console.log('Ready to accept connections! 🎉');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export default app;
"""
    
    from pathlib import Path
    server_path = Path(project_root) / "backend/src/server.ts"
    
    # Write the minimal server.ts
    with open(server_path, 'w') as f:
        f.write(server_content)
    
    print(f"✅ Created minimal server.ts")

def main():
    project_root = "/Users/administrator/ai-automation-platform/user_projects/25b7e956-816a-410c-b1b5-3c798a9d586c/BOOM Card_20250722_085243"
    
    print("🔧 Creating Minimal Server")
    print("="*30)
    
    create_minimal_server(project_root)
    
    print("\n✅ Minimal server created!")
    print("   This should start successfully...")

if __name__ == "__main__":
    main()