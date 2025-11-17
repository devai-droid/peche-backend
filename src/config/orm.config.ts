import { DataSource, DataSourceOptions } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import * as path from "path"

export const ormConfig: DataSourceOptions = {
  type: "postgres",
  logging: false /*process.env.STAGE == "dev"*/,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PW,
  synchronize: false,
  entities: [path.join(__dirname, "..", "/**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "..", "/migrations/*{.ts,.js}")],
  migrationsTableName: "migrations_typeorm",
  migrationsRun: true,
  namingStrategy: new SnakeNamingStrategy(),
  extra: !process.env.IS_LOCAL_ENV ? { ssl: { rejectUnauthorized: false } } : undefined,
}

// for migration
export default new DataSource(ormConfig)
