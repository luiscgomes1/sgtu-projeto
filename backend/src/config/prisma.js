import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'

const { DATABASE_URL } = process.env
if (!DATABASE_URL) {
  throw new Error('Configure DATABASE_URL no .env')
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
