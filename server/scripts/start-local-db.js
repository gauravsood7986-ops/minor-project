import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/db');

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

console.log('[CampusGig Local DB] Starting local MongoDB instance on port 27017...');

try {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
    },
  });

  console.log('[CampusGig Local DB] MongoDB successfully listening on port 27017');
  console.log('[CampusGig Local DB] Connection URI: mongodb://127.0.0.1:27017/campusgig');
  console.log('[CampusGig Local DB] Persistent database path:', dbPath);

  const cleanup = async () => {
    console.log('[CampusGig Local DB] Stopping local MongoDB...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
} catch (err) {
  console.error('[CampusGig Local DB] Error starting local MongoDB:', err.message);
  process.exit(1);
}
