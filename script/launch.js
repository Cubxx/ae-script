import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const { AE_PATH, TEST_FILE } = process.env;
const appPath = path.join(AE_PATH, 'AfterFX.exe');
const projPath = path.join(process.cwd(), TEST_FILE);
exec(`"${appPath}" ${projPath}`, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
});
