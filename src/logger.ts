import Pino, { LevelWithSilent } from 'pino';

const isProd = process.env.NODE_ENV === 'production';
const isTest = !!process.env.TEST;

const getLogLevel = (): LevelWithSilent => {
  switch (true) {
    case isTest:
      return 'silent';
    case isProd:
      return 'info';
    default:
      return 'trace';
  }
};

const logger = Pino({
  name: 'RedirectService',
  messageKey: 'message',
  useLevel: 'silent',
});
logger.level = getLogLevel();

export default logger;
