import fs from 'fs';
// otherwise MissingSchemaError: Schema hasn't been registered for model "Upload"
import '../model/upload';
import mongoose from 'mongoose';
import { logError } from '../service/logger';
import { MONGO_URL, RDS_CA_NAME } from '../config';
import { createPendingPayouts } from '../service/payouts';

// Connect to database
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsCAFile: RDS_CA_NAME
});

mongoose.Promise = global.Promise;

const LOCK_FILE_PATH = './.payout.lock';

const createLock = () => fs.writeFileSync(LOCK_FILE_PATH, '');
const checkLock = () => fs.existsSync(LOCK_FILE_PATH);
const removeLock = () => fs.unlinkSync(LOCK_FILE_PATH);

(async () => {
  if (checkLock()) {
    logError('Lock exists');
  } else {
    createLock();
    try {
      await createPendingPayouts();
    } catch (error) {
      logError('Failed at processing payouts');
      logError(error);
    }
  }

  removeLock();
  process.exit(0);
})();
