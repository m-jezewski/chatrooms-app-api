import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('DEV', 'PROD', 'TEST').default('DEV'),

  PORT: Joi.number().default(3000),
  WEBSOCKET_PORT: Joi.number().default(3001),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  SESSION_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'SESSION_SECRET must be at least 32 characters',
    'any.required': 'SESSION_SECRET is required',
  }),
  SESSION_MAX_AGE: Joi.number().default(1800000), // 30 minutes
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required',
  }),

  POSTGRES_USER: Joi.string().optional(),
  POSTGRES_PASSWORD: Joi.string().optional(),
  POSTGRES_DB: Joi.string().optional(),
  PGADMIN_DEFAULT_EMAIL: Joi.string().optional(),
  PGADMIN_DEFAULT_PASSWORD: Joi.string().optional(),
});
