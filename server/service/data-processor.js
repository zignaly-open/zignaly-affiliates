import { loadChainsAndVisits, loadCustomerData } from './data-importer';
import Chain from '../model/chain';
import Visit from '../model/visit';
import { logError } from './logger';
import processChain from './chain-processor';
import processVisit from './visit-processor';

const tryProcess = async f => {
  try {
    await f();
  } catch (error) {
    logError('Failed at processing an event');
    logError(error);
  }
};

async function saveDataFromPostgresToMongo(clear) {
  const { chains, visits } = await loadChainsAndVisits();
  const customerData = await loadCustomerData();
  if (clear) await Chain.remove({});
  await Visit.remove({});

  for (const chain of chains) {
    await tryProcess(() => processChain(chain, customerData[chain.userId]));
  }

  for (const visit of visits) {
    await tryProcess(() => processVisit(visit));
  }
}

export default saveDataFromPostgresToMongo;
