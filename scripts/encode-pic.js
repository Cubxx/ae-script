import { readFile, unlink, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import * as _ from 'soil-ts';

async function ptc2hex(path) {
  const buffer = await readFile(path);
  const hexString = [...buffer]
    .map((b) => '\\x' + b.toString(16).padStart(2, '0'))
    .join('');
  return hexString;
}
async function copy(text) {
  const temp = '.tmp';
  await writeFile(temp, text);
  exec(`type "${temp}" | clip`, (error, stdout, stderr) => {
    if (error) {
      console.error('error', error);
      return;
    }
    if (stderr) {
      console.error('stderr', stderr);
      return;
    }
    unlink(temp).finally(() => {
      console.log('copied to clipboard');
    });
  });
}

ptc2hex('D:/test.jpg').then(copy);
_.encodeImageString;
