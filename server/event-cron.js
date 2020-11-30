import fs from 'fs';
import loadNewChains from './service/chain-importer';
import processChain from './service/chain-processor';
import { logError } from './service/logger';
import Chain from './model/chain';

const LOCK_FILE_PATH = './.lock';

const createLock = () => fs.writeFileSync(LOCK_FILE_PATH, '');
const checkLock = () => fs.existsSync(LOCK_FILE_PATH);
const removeLock = () => fs.unlinkSync(LOCK_FILE_PATH);

if (checkLock()) {
  logError('Lock exists');
} else {
  createLock();
  loadNewChains()
    .then(async chains => {
      await Chain.remove({});
      for (const chain of chains) {
        await processChain(chain);
      }
    })
    .catch(error => {
      logError(error);
    })
    .finally(removeLock);
}
