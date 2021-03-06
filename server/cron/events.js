import fs from 'fs';
import mongoose from 'mongoose';
import loadNewChains from '../service/chain-importer';
import processChain from '../service/chain-processor';
import { logError } from '../service/logger';
import Chain from '../model/chain';
import { MONGO_URL } from '../config';

// Connect to database
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

const LOCK_FILE_PATH = './.lock';

const createLock = () => fs.writeFileSync(LOCK_FILE_PATH, '');
const checkLock = () => fs.existsSync(LOCK_FILE_PATH);
const removeLock = () => fs.unlinkSync(LOCK_FILE_PATH);

(async () => {
  if (checkLock()) {
    logError('Lock exists');
  } else {
    createLock();
    try {
      const chains = await loadNewChains();
      await Chain.remove({});
      for (const chain of chains) {
        try {
          await processChain(chain);
        } catch (error) {
          logError('Failed at processing an eve reent');
          logError(error);
        }
      }
    } catch (error) {
      logError('Failed at processing events');
      logError(error);
    }
  }

  removeLock();
  process.exit(0);
})();
