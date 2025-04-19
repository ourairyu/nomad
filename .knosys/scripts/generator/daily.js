const { noop, pick } = require('@ntks/toolbox');

const { sortByDate, readMetadata } = require('../helper');
const { isItemValid, getItemSourceDir, cacheClassifyItems, createGenerator } = require('./helper');

const collectionName = 'dailies';

function resolveItemData(sourceRootPath, id, item, _, cache) {
  const sourceDir = getItemSourceDir(sourceRootPath, item);
  const note = { ...readMetadata(sourceDir), id };

  if (!isItemValid(note)) {
    return null;
  }

  const [category, collection, ...args] = item.source.split('/');

  cacheClassifyItems(cache, id, note);

  return pick(note, ['id', 'title', 'description', 'date', 'tags', 'share']);
}

module.exports = {
  createDailyGenerator: (sourceRootPath, sharedRootPath) => createGenerator(sourceRootPath, sharedRootPath, collectionName, {
    transformItem: resolveItemData.bind(null, sourceRootPath),
    transformData: items => {
      const sequence = sortByDate(Object.keys(items).map(key => items[key])).map(({ id }) => id);
      const yearly = {};

      sequence.forEach(id => {
        const year = items[id].date.substr(0, 4);

        if (!yearly[year]) {
          yearly[year] = [];
        }

        yearly[year].push(id);
      });

      return { items, sequence, yearly: Object.keys(yearly).sort().map(year => ({ year, ids: yearly[year] })) };
    },
    readEach: noop,
  }),
};
