import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envFile = readFileSync(envPath, 'utf8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
  Object.assign(process.env, envVars);
} catch (error) {
  console.log('Could not load .env.local, using process.env');
}

const UserSchema = new mongoose.Schema({
  privyId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
}, { strict: false, collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function clearUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Counting users before deletion...');
    const countBefore = await User.countDocuments({});
    console.log(`   Found ${countBefore} users`);

    console.log('🗑️  Deleting all users...');
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users from database`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

clearUsers();

