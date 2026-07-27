import app from '../src/app';
import { connectDB } from '../src/config/db';
import { ensureSuperAdmin } from '../src/seeds/ensureSuperAdmin';

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB();
      await ensureSuperAdmin();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless DB Error]:', err);
    }
  }
  return app(req, res);
}
