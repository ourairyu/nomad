const { resolve: resolvePath } = require('path');
const { existsSync } = require('fs');

const { resolveRootPath, scanAndSortByAsc, ensureDirExists, getLocalDataRoot } = require('../helper');
const { createDailyGenerator } = require('../generator');

module.exports = {
  execute: dataSource => {
    const srcPath = resolvePath(resolveRootPath(), dataSource || process.env.KSIO_DS);

    if (!existsSync(srcPath)) {
      return;
    }

    ensureDirExists(getLocalDataRoot(), true);

    const sourceRootPath = resolvePath(srcPath, 'data');
    const sharedRootPath = resolvePath(srcPath, 'shared');

    const generators = {
      dailies: createDailyGenerator(sourceRootPath, sharedRootPath),
    };

    scanAndSortByAsc(sharedRootPath).forEach(collection => generators[collection] && generators[collection]());
  },
};
