const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.join(__dirname, '..', 'figures');
(async () => {
  for (const name of ['03-mo-hinh-nang-luc', '04-luong-thiet-lap', '05-luong-van-hanh']) {
    await sharp(fs.readFileSync(path.join(root, name+'.svg')), {density:240}).png().toFile(path.join(root, name+'.png'));
  }
})();
