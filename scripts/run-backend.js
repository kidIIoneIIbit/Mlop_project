/**
 * run-backend.js — Start the FastAPI backend using the local venv
 */
const { spawn } = require('child_process');
const path = require('path');

const BACKEND  = path.resolve(__dirname, '..', 'backend');
const isWin    = process.platform === 'win32';
const UVICORN  = isWin
  ? path.join(BACKEND, '.venv', 'Scripts', 'uvicorn.exe')
  : path.join(BACKEND, '.venv', 'bin', 'uvicorn');

const proc = spawn(UVICORN, ['main:app', '--reload', '--port', '8000'], {
  cwd:   BACKEND,
  stdio: 'inherit',
  shell: false,
});

proc.on('error', (err) => {
  console.error('\n❌ Failed to start backend:', err.message);
  console.error('   Have you run "npm run setup" yet?\n');
  process.exit(1);
});

proc.on('exit', (code) => process.exit(code ?? 0));
