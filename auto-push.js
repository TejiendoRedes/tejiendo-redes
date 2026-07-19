const { spawn } = require('child_process');

const proc = spawn('npx.cmd', ['drizzle-kit', 'push', '--accept-data-loss'], { stdio: ['pipe', 'inherit', 'inherit'] });

proc.stdin.write('\n\n\n\n\n\n\n\n\n\n\n\n\n');
setInterval(() => {
    try {
        proc.stdin.write('\n');
    } catch(e) {}
}, 500);

proc.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
    process.exit(code);
});
