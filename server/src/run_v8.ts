import { up } from './migration_v8';

const run = async () => {
  try {
    await up();
    console.log('Migration v8 finished');
    process.exit(0);
  } catch (e) {
    console.error('Migration v8 failed', e);
    process.exit(1);
  }
};

run();
