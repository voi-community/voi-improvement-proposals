// utils
import createLogger from './utils/createLogger.mjs';

(() => {
  const args = process.argv.slice(2);
  const logger = createLogger();
  const title = args[0];
  let pattern;

  if (!title) {
    logger.error('no title provided');

    process.exit(1);
  }

  pattern = /^VIP-\d{2}-\d{4}: (([A-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?][A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*) ?)+$/;

  if (!pattern.test(title)) {
    logger.error(`title "${title}" is invalid`);

    process.exit(1);
  }

  logger.success('title is valid!');

  process.exit(0);
})();
