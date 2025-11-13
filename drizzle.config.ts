import { defineConfig } from 'drizzle-kit'
import type { Config } from 'drizzle-kit'

const { LOCAL_DB_PATH } = process.env

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: LOCAL_DB_PATH || './sqlite.db'
  }
} as Config)
