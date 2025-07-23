import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltRounds: number;
  jwtAlgorithm: jwt.Algorithm;
  jwtExpiresIn: string | number;
  refreshTokenExpiresIn: string | number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
  salt?: string;
}

export interface HashOptions {
  saltRounds?: number;
  pepper?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface KeyDerivationOptions {
  salt: Buffer;
  iterations: number;
  keyLength: number;
  digest: string;
}

export type EncryptionMethod = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';

const ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltRounds: 12,
  jwtAlgorithm: 'HS256',
  jwtExpiresIn: '15m',
  refreshTokenExpiresIn: '7d'
};

const KEY_DERIVATION_ITERATIONS = 100000;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyDerivationIterations = 100000;
  private saltLength = 32;
  private ivLength = 16;
  private tagLength = 16;

  constructor(private readonly config: EncryptionConfig) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.masterKey || this.config.masterKey.length < 32) {
      throw new Error('Master key must be at least 32 characters');
    }
    if (this.config.keyRotationDays && this.config.keyRotationDays < 1) {
      throw new Error('Key rotation days must be positive');
    }

  async encrypt(data: string | Buffer, context?: string): Promise<EncryptedData> {
    try {
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      const key = await this.deriveKey(salt, context);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      const encrypted = Buffer.concat([
        cipher.update(dataBuffer),
        cipher.final()
      ]);
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted.toString('base64'),
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        algorithm: this.algorithm,
        keyVersion: await this.getCurrentKeyVersion()
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }

  async decrypt(encryptedData: EncryptedData, context?: string): Promise<Buffer> {
    try {
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }

  async encryptField(value: any, fieldConfig?: FieldEncryptionConfig): Promise<string> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    return JSON.stringify({
      ...encrypted,
      fieldType: fieldConfig?.type || 'string',
      format: fieldConfig?.format
    });
  }

  async decryptField(encryptedField: string, fieldConfig?: FieldEncryptionConfig): Promise<any> {
    const parsed = JSON.parse(encryptedField);
    const { fieldType, format, ...encryptedData } = parsed;
    
    
    if (fieldType === 'json') {
      return JSON.parse(stringValue);
    }
    
    return stringValue;
  }

  async hashPassword(password: string): Promise<string> {
    const hash = await this.pbkdf2(password, salt);
    
    return JSON.stringify({
      hash: hash.toString('base64'),
      salt: salt.toString('base64'),
      iterations: this.keyDerivationIterations,
      algorithm: 'pbkdf2-sha512'
    });
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const { hash, salt, iterations } = JSON.parse(hashedPassword);
      const saltBuffer = Buffer.from(salt, 'base64');
      const hashBuffer = Buffer.from(hash, 'base64');
      
      const derivedHash = await this.pbkdf2(password, saltBuffer, iterations);
      
      return crypto.timingSafeEqual(hashBuffer, derivedHash);
    } catch {
      return false;
    }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  async createHmac(data: string | Buffer, key?: string): Promise<string> {
    const hmacKey = key || this.config.masterKey;
    
    return crypto
      .createHmac('sha256', hmacKey)
      .update(dataBuffer)
      .digest('base64');
  }

  async verifyHmac(data: string | Buffer, hmac: string, key?: string): Promise<boolean> {
    const expectedHmac = await this.createHmac(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'base64'),
      Buffer.from(expectedHmac, 'base64')
    );
  }

  private async deriveKey(salt: Buffer, context?: string, version?: number): Promise<Buffer> {
    const masterKey = await this.getMasterKey(version);
    const info = context ? Buffer.from(context, 'utf8') : Buffer.alloc(0);
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(masterKey, Buffer.concat([salt, info]), this.keyDerivationIterations, 32, 'sha512', (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
  }

  private async pbkdf2(password: string, salt: Buffer, iterations?: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations || this.keyDerivationIterations, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
  }

  private async getMasterKey(version?: number): Promise<string> {
    // In production, implement key rotation logic here
    return this.config.masterKey;
  }

  private async getCurrentKeyVersion(): Promise<number> {
    // In production, implement version tracking
    return 1;
  }

export class EncryptionMiddleware {
  constructor(private encryptionService: EncryptionService) {}

  encryptResponse() {
    return async (req: any, res: any, next: any) => {
      const originalJson = res.json;
      
      res.json = async function(data: any) {
        if (res.locals.skipEncryption) {
          return originalJson.call(this, data);
        }
        
        try {
            JSON.stringify(data),
            req.headers['x-encryption-context']
          );
          
          return originalJson.call(this, {
            encrypted: true,
            data: encrypted
          });
        } catch (error) {
          return originalJson.call(this, {
            error: 'Encryption failed',
            message: error.message
          });
        }.bind(this);
      
      next();
    };
  }

  decryptRequest() {
    return async (req: any, res: any, next: any) => {
      if (!req.body?.encrypted || !req.body?.data) {
        return next();
      }
      
      try {
          req.body.data,
          req.headers['x-encryption-context']
        );
        
        req.body = JSON.parse(decrypted.toString('utf8'));
        next();
      } catch (error) {
        res.status(400).json({
          error: 'Decryption failed',
          message: error.message
        });
      };
  }

export function createEncryptionService(config: EncryptionConfig): EncryptionService {
  return new EncryptionService(config);
}

export function createEncryptionMiddleware(service: EncryptionService): EncryptionMiddleware {
  return new EncryptionMiddleware(service);
}

export const encryptionUtils = {
  isEncrypted(data: any): boolean {
    return typeof data === 'object' && 
           data?.encrypted === true && 
           data?.data?.encrypted !== undefined;
  },
  
  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      });
    
    return { publicKey, privateKey };
  },
  
  async encryptWithPublicKey(data: string, publicKey: string): Promise<string> {
    return encrypted.toString('base64');
  },
  
  async decryptWithPrivateKey(encrypted: string, privateKey: string): Promise<string> {
    return decrypted.toString('utf8');
  };

}
}
}
}
}
}
}
}
}
}
