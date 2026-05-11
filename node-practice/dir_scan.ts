import fs from 'node:fs/promises';
import path from 'node:path';

const IGNORE_CASE = ['node_modules', '.git'];

async function tree(dir: string, deep: number = Number.MAX_VALUE) {
    const rootName = path.basename(path.resolve(dir)) || dir;
    let fileCount = 0;
    let dirCount = 0;

    console.log(rootName + '/');

    await scanDir(dir, '', deep, (type: 'file' | 'dir') => {
        if (type === 'file') {
            fileCount++;
        } else {
            dirCount++;
        }
    });
    console.log(`
Total files: ${fileCount}, Total directories: ${dirCount}`);
}

async function scanDir(dir: string, prefix: string = '', deep: number = Number.MAX_VALUE, onCount: (type: 'file' | 'dir') => void) {
    const allFiles = await fs.readdir(dir, { withFileTypes: true });

    for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];

        if (IGNORE_CASE.includes(file.name)) {
            continue;
        }

        const isDir = file.isDirectory();

        onCount(isDir ? 'dir' : 'file');

        // 判断【当前元素】是不是这一层级的最后一个
        const currentIsLast = i === allFiles.length - 1;

        // 当前元素的连接符
        const connector = currentIsLast ? '└── ' : '├── ';
        const label = isDir ? file.name + '/' : file.name;

        // 打印当前行
        console.log(prefix + connector + label);

        if (isDir && deep > 0) {
            // 子层级的前缀应该由【当前文件夹】是否为上一级的最后一个元素决定
            const childPrefix = prefix + (currentIsLast ? '    ' : '│   ');

            await scanDir(path.join(dir, file.name), childPrefix, deep - 1, onCount);
        }
    }
}

function parseDepth(args: string[]): number {
    const depthArg = args.find(arg => arg.startsWith('--depth='));

    if (depthArg) {
        const value = parseInt(depthArg.split('=')[1]);

        return Number.isNaN(value) ? Number.MAX_VALUE : value;
    }

    return Number.MAX_VALUE;
}

const targetDir = process.argv[2] || '.';
const depth = parseDepth(process.argv.slice(2));

tree(targetDir, depth);
