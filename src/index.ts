import MemoryStore from 'storage/mem';
import RedirectService from 'service';
import ExpressServer from 'rest/express/app';
import { Config } from 'types';

const DEFAULT_CONFIG: Config = {
  port: 3000,
  hostname: 'localhost',
};

const loadConfig = (): Config => DEFAULT_CONFIG;

const run = async () => {
  const config = loadConfig();
  const repo = MemoryStore();
  const service = RedirectService(repo);
  const server = ExpressServer(service);

  console.log(`Listening on ${ config.hostname } : ${ config.port } ...`);
  server.listen(config.port, config.hostname);
};

run().catch((err) => {
  console.log('Error starting app:', err);
  process.exit(1);
});
