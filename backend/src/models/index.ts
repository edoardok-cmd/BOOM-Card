import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Type representing any Sequelize Model's static class, used for dynamic loading.
 * It's generic as we don't know the specific model attributes or creation attributes at this point.
 */
type AnyModelStatic = ModelStatic<Model<any, any>>;

/**
 * Interface for the database object that will be exported,
 * containing the Sequelize instance and all initialized models.
 */
export interface DB {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  // This index signature allows for dynamic addition of models to the DB object,
  // where the key is the model name (string) and the value is the model's static class.
  // We also explicitly list sequelize and Sequelize to ensure type safety.
  [key: string]: AnyModelStatic | Sequelize | typeof Sequelize;
}

// --- Constants and Configuration ---

/**
 * The base name of the current file, used to exclude itself when dynamically loading models.
 */
const basename: string = path.basename(__filename);

/**
 * The current environment (e.g., 'development', 'production', 'test').
 * Defaults to 'development' if not set.
 */
const env: string = process.env.NODE_ENV || 'development';

/**
 * Database configuration object, loaded from environment variables.
 * This structure matches common Sequelize configuration options.
 */
const config: {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  dialect: 'postgres';
  dialectOptions?: {
    ssl: {
      require: boolean;
      rejectUnauthorized: boolean; // Set to false in dev, true in production with valid certs
    };
  };
  logging?: boolean;
} = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development', // Log SQL queries in development

  // SSL configuration for production environments (e.g., Heroku Postgres)
  ...(process.env.NODE_ENV === 'production' && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // You might want to set this to true for strict production environments with valid CAs
      },
    },
  }),
};

// backend/src/models/index.ts - PART 2
// Assuming Part 1 initialized:
// import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
// import fs from 'fs';
// import path from 'path';
// import process from 'process';
// interface DbConfig { ... }
// const getAppConfig = (): { [env: string]: DbConfig } => ({ ... });
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = getAppConfig()[env];
// interface ModelInitializer { ... }
// interface Db { ... }
// const db: Db = {} as Db;

let sequelize: Sequelize;

// Main class/function implementation: Initialize Sequelize instance
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]!, config);
} else {
  sequelize = new Sequelize(config.database!, config.username!, config.password!, {
    host: config.host,
    dialect: config.dialect!,
    logging: config.logging,
    pool: config.pool,
    // Other options specific to your environment/dialect can go here
  });
}

// Assign sequelize instance and the Sequelize class to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Core business logic: Dynamically load and initialize all model definitions
// This loop reads all files in the current directory (models/),
// excludes index.ts itself and declaration files,
// then requires each model file and initializes it with the Sequelize instance.
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.ts' || file.slice(-3) === '.js') && // Include .ts and .js files
      !file.endsWith('.d.ts') // Exclude TypeScript declaration files
    );
  })
  .forEach(file => {
    // Each model file (e.g., user.ts, card.ts) is expected to export a default function
    // that takes (sequelize, DataTypes) and returns the initialized model.
    // Example: export default (sequelize: Sequelize, DataTypes: typeof Sequelize.DataTypes) => { ... }
    const modelInitializer: ModelInitializer = require(path.join(__dirname, file)).default;
    const model = modelInitializer(sequelize, DataTypes);
    db[model.name] = model;
    console.log(`Model loaded: ${model.name}`); // Log for debugging
  });

// Core business logic: Apply associations between models
// After all models are loaded, iterate through them and call their 'associate' method,
// if defined. This method typically takes the 'db' object itself to access other models.
Object.keys(db).forEach(modelName => {
  // Ensure the property is a Model and has an 'associate' method
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
    console.log(`Associations applied for: ${modelName}`); // Log for debugging
  });

// Main class/function implementation: Database connection test
// This function ensures the database connection is successful when the models are loaded.
async function connectAndSyncDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Optionally, synchronize models with the database.
    // In production, often migrations are preferred over `sync`.
    // For development, `sync({ alter: true })` is useful.
    // await db.sequelize.sync({ alter: true }); // Use { force: true } only for development/testing if you want to drop tables
    // console.log('All models were synchronized successfully.');

  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
    // Exit the process if the database connection fails, as the application cannot function without it.
    process.exit(1);
  }

// Execute the database connection and sync when this module is initialized.
connectAndSyncDatabase();

// Export the db object which contains the sequelize instance and all models.
// This is the primary export of this file.
export default db;

// Note: Middleware functions and Route handlers are not included here as they
// do not belong in a model definition file. This file's purpose is specifically
// for database model setup and export.

}
}
