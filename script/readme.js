import fs from 'fs/promises';
import path from 'path';

async function parseFile(name) {
    const comments = [];
    const f = await fs.open(path.join('src', name + '.tsx'));
    for await (const line of f.readLines()) {
        const match = line.match(/^(\/\/|\/\*\*?| \*\/?)([^\n]*)$/);
        if (match) {
            const comment = match?.[2].trim();
            comment && comments.push(comment);
        } else {
            break;
        }
    }
    const fileName = name + '.jsx';
    const miniName = name + '.min.jsx';
    return {
        原版: `_[${fileName}](dist/${fileName})_`,
        压缩版: `_[${miniName}](dist/${miniName})_`,
        描述: comments.join('<br>'),
    };
}
function toMarkdowmTable(data) {
    const keys = Object.keys(data[0]);
    const header = `| ${keys.join(' | ')} |`;
    const separator = `| ${keys.map(() => '---').join(' | ')} |`;
    const rows = data.map(
        (config) => `| ${keys.map((key) => config[key]).join(' | ')} |`,
    );
    return [header, separator, ...rows];
}
async function replaceContent(filepath, newLines) {
    const f = await fs.open(filepath);
    const lines = [];
    let state = 0;
    const stateFn = {
        0(line) {
            lines.push(line);
            line === '## 脚本列表' && state++;
        },
        1(line) {
            if (line[0] === '#') {
                state--;
                lines.push('', ...newLines, '', line);
            }
        },
    };
    for await (const line of f.readLines()) {
        stateFn[state](line);
    }
    if (state !== 0 || lines.length === 0) {
        throw '无法获取文本更新范围';
    }
    fs.writeFile(filepath, lines.join('\n'));
}
async function main() {
    const files = (await fs.readdir('dist')).filter((file) =>
        /(?<!\.min)\.jsx$/.test(file),
    );
    const data = await Promise.all(
        files.map((file) => parseFile(file.slice(0, -4))),
    );
    const table = toMarkdowmTable(data);
    replaceContent('README.md', table);
}
main();
