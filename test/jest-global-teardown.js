// eslint-disable-next-line @typescript-eslint/no-var-requires
require('ts-node').register({
  transpileOnly: true,
});
require('tsconfig-paths/register');

module.exports = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { closeApp } = require('./setup');
  await closeApp();
};
