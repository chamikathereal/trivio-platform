export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  DATABASE_TEST_URL?: string;
  CORS_ORIGINS: string[];
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const port = Number(config['PORT'] ?? 4000);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: ${config['PORT']}`);
  }

  const nodeEnv = (config['NODE_ENV'] as string) ?? 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}. Must be 'development', 'production', or 'test'.`);
  }

  const databaseUrl = config['DATABASE_URL'] as string | undefined;
  if (!databaseUrl && nodeEnv === 'production') {
    throw new Error('DATABASE_URL is mandatory in production environment.');
  }

  const rawOrigins = (config['CORS_ORIGINS'] as string) ?? 'http://localhost:3000,http://localhost:3001,http://localhost:3002';
  const corsOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

  return {
    PORT: port,
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test',
    DATABASE_URL: databaseUrl ?? 'postgresql://postgres:postgres@localhost:5432/trivio_dev?schema=public',
    DATABASE_TEST_URL: config['DATABASE_TEST_URL'] as string | undefined,
    CORS_ORIGINS: corsOrigins,
  };
}
