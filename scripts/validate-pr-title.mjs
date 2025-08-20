// utils
import createLogger from './utils/createLogger.mjs';

const validatePrTitle = (title) => {
  const logger = createLogger();
  let pattern;

  if (!title) {
    logger.error('no title provided');

    process.exit(1);
  }

  pattern = /^VIP-\d{2}-\d{4}: ([\x20-\x7E]+)+$/;

  if (!pattern.test(title)) {
    logger.error(`title "${title}" is invalid`);

    process.exit(1);
  }

  logger.success('title is valid!');

  process.exit(0);
};

validatePrTitle(process.argv.slice(2)[0]);
