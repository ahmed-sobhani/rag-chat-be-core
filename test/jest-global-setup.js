// eslint-disable-next-line @typescript-eslint/no-var-requires
require('ts-node').register({
  transpileOnly: true,
});
require('tsconfig-paths/register');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getApp } = require('./setup');
module.exports = async () => {
  await getApp(); // boot once
};
