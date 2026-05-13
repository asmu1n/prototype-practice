import fs from 'node:fs/promises';
import { copyFile } from 'node:fs/promises';
import { stdin, stdout, exit } from 'node:process';
import path from 'node:path';
import readline from 'node:readline';

async function DirCopy(fileOrDirPath: string, targetFileOrDirPath: string) {
    try {
        const sourcePath = await fs.stat(fileOrDirPath);

        const isFile = sourcePath.isFile();

        if (isFile) {
            await copy(fileOrDirPath, targetFileOrDirPath);

            return;
        }

        const allFiles = await fs.readdir(fileOrDirPath, { withFileTypes: true });

        for (const file of allFiles) {
            const isDir = file.isDirectory();
            const fileName = file.name;
            const filePath = `${fileOrDirPath}/${fileName}`;
            const targetFilePath = `${targetFileOrDirPath}/${fileName}`;

            if (isDir) {
                await DirCopy(filePath, targetFilePath);
            } else {
                await copy(filePath, targetFilePath);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// 检测用户按键，返回 true 表示覆盖，false 表示取消
function askUserToOverwrite(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: stdin,
            output: stdout
        });

        // 保存原始终端设置
        const raw = stdin.isRaw;

        if (!stdin.isTTY) {
            console.warn('非 TTY 环境，默认取消覆盖');
            rl.close();
            resolve(false);

            return;
        }

        // 启用原始模式以检测 ESC 键
        if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
            readline.emitKeypressEvents(stdin);
            stdin.setRawMode(true);
        }

        console.log(`${filePath} ---目标文件已存在，按 Enter 覆盖，按 ESC 取消`);

        const listener = (str: string, key: readline.Key) => {
            if (key.name === 'return') {
                // Enter 键 - 覆盖
                cleanup();
                resolve(true);
            } else if (key.name === 'escape') {
                // ESC 键 - 取消
                cleanup();
                resolve(false);
            } else if (key.ctrl && key.name === 'c') {
                // Ctrl+C - 退出程序
                cleanup();
                exit();
            }
        };

        stdin.on('keypress', listener);

        function cleanup() {
            if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
                stdin.setRawMode(raw);
            }

            stdin.removeListener('keypress', listener);
            rl.close();
        }
    });
}

async function copy(originFilePath: string, targetFilePath: string) {
    const exist = await fs.exists(targetFilePath);

    if (!exist) {
        await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
    } else {
        const shouldOverwrite = await askUserToOverwrite(targetFilePath);

        if (!shouldOverwrite) {
            console.log('已取消复制');

            return;
        }
    }

    await copyFile(originFilePath, targetFilePath);
}

function main() {
    const sourcePath = path.resolve('node-practice');

    DirCopy(sourcePath, path.resolve('target/node-practice'));
}

main();
