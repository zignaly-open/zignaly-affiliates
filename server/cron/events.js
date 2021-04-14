import fs from 'fs';
import mongoose from 'mongoose';
import loadChainsAndVisits from '../service/data-importer';
import processChain from '../service/chain-processor';
import { logError } from '../service/logger';
import Chain from '../model/chain';
import { MONGO_URL } from '../config';
import processVisit from '../service/visit-processor';
import Visit from '../model/visit';

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
      const { chains, visits } = await loadChainsAndVisits();
      await Visit.remove({});
      await Chain.remove({});

      const tryProcess = async f => {
        try {
          await f();
        } catch (error) {
          logError('Failed at processing an eveent');
          logError(error);
        }
      };

      for (const chain of chains) {
        await tryProcess(() => processChain(chain));
      }

      for (const visit of visits) {
        await tryProcess(() => processVisit(visit));
      }
    } catch (error) {
      logError('Failed at processing events');
      logError(error);
    }
  }

  removeLock();
  process.exit(0);
})();
