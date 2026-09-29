const path = require('node:path');
const sharp = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..', 'figures');
(async () => {
  for (const name of ['01-tao-kich-ban', '02-van-hanh-tu-dong']) {
    await sharp(path.join(root, name + '.svg'), { density: 160 }).png().toFile(path.join(root, name + '.png'));
  }
  console.log('Rendered two flow diagrams.');
})().catch(error => { console.error(error); process.exitCode = 1; });
