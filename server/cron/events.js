import fs from 'fs';
import mongoose from 'mongoose';
import { connect, disconnect } from '../service/data-importer';
import { logError } from '../service/logger';
import { MONGO_URL, RDS_CA_NAME } from '../config';
import '../model/upload';
import saveDataFromPostgresToMongo from '../service/data-processor';

// Connect to database
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsCAFile: RDS_CA_NAME
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
      await connect();
      await saveDataFromPostgresToMongo(process.argv[2] === 'clear');
      await disconnect();
    } catch (error) {
      logError('Failed at processing events');
      logError(error);
    }
  }

  removeLock();
  process.exit(0);
  // eslint-disable-next-line no-console
})().catch(console.error);
