import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;

class HandlerModel {
  constructor(server) {
    this.server = server;
    this.db = null;
  }

  async connect() {
    this.server.logs('Connecting to database ...');
    try {
      if (!global.prisma) {

        const pool = new Pool({ connectionString: process.env.DATABASE_URL });

        const adapter = new PrismaPg(pool);

        global.prisma = new PrismaClient({
          adapter,
          log: this.server.env.DB_LOGGING === 'true' ? ['query', 'error'] : ['error']
        });
      }

      this.db = global.prisma;

      this.server.logs('Database Connected');

    } catch (err) {
      this.server.logs('Database Connection Failed: ' + err);
      return -1;
    }

    return this.db;
  }
}

export default HandlerModel;