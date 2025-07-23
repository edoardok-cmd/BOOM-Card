import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

dotenv.config();

/**
 * Interface for JWT (JSON Web Token) configuration settings.
 */
export interface IJwtConfig {
  secret: string;
  expiresIn: string; // e.g., '1h', '7d', '24h'
  refreshExpiresIn: string; // e.g., '7d', '30d'
}

/**
 * Interface for bcrypt password hashing configuration.
 */
export interface IBcryptConfig {
  saltRounds: number;
}

/**
 * Interface for CORS (Cross-Origin Resource Sharing) configuration.
 */
export interface ICorsConfig extends CorsOptions {
  allowedOrigins: string[];
}

/**
 * Main interface for all security-related configurations.
 */
export interface ISecurityConfig {
  jwt: IJwtConfig;
  bcrypt: IBcryptConfig;
  cors: ICorsConfig;
}

// --- Constants and Configuration ---

const JWT_SECRET: string = process.env.JWT_SECRET || 'supersecretjwtkeyforboomcarddev';
const JWT_EXPIRATION_TIME: string = process.env.JWT_EXPIRATION_TIME || '1h';
const JWT_REFRESH_EXPIRATION_TIME: string = process.env.JWT_REFRESH_EXPIRATION_TIME || '7d';

const BCRYPT_SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const CORS_ALLOWED_ORIGINS: string[] = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001']; // Default for development

/**
 * The global security configuration object.
 */
export const securityConfig: ISecurityConfig = {
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRATION_TIME,
    refreshExpiresIn: JWT_REFRESH_EXPIRATION_TIME,
  },
  bcrypt: {
    saltRounds: BCRYPT_SALT_ROUNDS,
  },
  cors: {
    allowedOrigins: CORS_ALLOWED_ORIGINS,
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!requestOrigin || CORS_ALLOWED_ORIGINS.indexOf(requestOrigin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    exposedHeaders: ['Set-Cookie'] // Expose Set-Cookie header for clients
  },
};

}
