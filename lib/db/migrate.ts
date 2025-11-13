import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import 'dotenv/config'
import path from 'path'

async function main() {
  const sqlite = new Database(
    process.env.SQLITE_DATABASE_PATH || path.join(process.cwd(), 'sqlite.db')
  )
  const db = drizzle(sqlite)

  console.log('Running migrations...')

  await migrate(db, { migrationsFolder: './drizzle' })

  console.log('Migrated successfully!')

  sqlite.close() // 关闭数据库连接
}

main().catch(err => {
  console.error('Migration failed!', err)
  process.exit(1)
})
