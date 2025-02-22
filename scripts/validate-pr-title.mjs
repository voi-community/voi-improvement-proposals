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

  pattern = /^VIP-[0-9]{2}-[0-9]{4}: (\d*[A-Z][a-zA-Z0-9]*|\d+[a-zA-Z0-9]*)( (\d*[A-Z][a-zA-Z0-9]*|\d+[a-zA-Z0-9]*))*$/;

  if (!pattern.test(title)) {
    logger.error(`title "${title}" is invalid`);

    process.exit(1);
  }

  logger.success('title is valid!');

  process.exit(0);
})();
