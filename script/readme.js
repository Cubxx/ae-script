import fs from 'fs';
import path from 'path';

function parseJSDoc(text) {
    const lines = text.split('\n');
    const result = {};
    let currentKey = null;
    let currentValue = '';
    for (let line of lines) {
        if (line.startsWith('@')) {
            if (currentKey) {
                result[currentKey] = currentValue;
            }
            const parts = line.split(' ');
            currentKey = parts[0].slice(1);
            currentValue = parts.slice(1).join(' ');
        } else {
            currentValue += '\n' + line;
        }
    }
    if (currentKey) {
        result[currentKey] = currentValue;
    }
    return result;
}

function toMarkdowmTable(configs) {
    const keys = Object.keys(configs[0]);
    const header = `| ${keys.join(' | ')} |`;
    const separator = `| ${keys.map(() => '---').join(' | ')} |`;
    const rows = configs.map((config) => `| ${keys.map((key) => config[key]).join(' | ')} |`);
    return [header, separator, ...rows].join('\n');
}
