/**
 * setup.js — Cross-platform one-time setup for Pet Nutrition AI
 * Run with: npm run setup
 */
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const ROOT    = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');

const isWin = process.platform === 'win32';
const VENV_PYTHON = isWin
  ? path.join(BACKEND, '.venv', 'Scripts', 'python.exe')
  : path.join(BACKEND, '.venv', 'bin', 'python');
const VENV_PIP = isWin
  ? path.join(BACKEND, '.venv', 'Scripts', 'pip.exe')
  : path.join(BACKEND, '.venv', 'bin', 'pip');

function run(cmd, cwd = ROOT) {
  console.log(`  > ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

/** Find the first Python command that actually works. */
function detectPython() {
  for (const cmd of ['python3', 'python', 'py']) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch (_) { /* try next */ }
  }
  throw new Error(
    'Python not found. Please install Python 3 from https://www.python.org/downloads/'
  );
}

const PYTHON = detectPython();
console.log(`  🐍 Using Python: ${PYTHON}`);

function step(title) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(50));
}

console.log('\n========================================');
console.log('  Pet Nutrition AI — Project Setup');
console.log('========================================');

// ── 1. Python venv ───────────────────────────────────────────
step('🐍 Creating Python virtual environment...');
if (fs.existsSync(VENV_PYTHON)) {
  console.log('  ✅ venv already exists, skipping.');
} else {
  run(`${PYTHON} -m venv .venv`, BACKEND);
  console.log('  ✅ venv created.');
}

// ── 2. Python dependencies ───────────────────────────────────
step('📦 Installing Python dependencies...');
run(`"${VENV_PYTHON}" -m pip install --upgrade pip -q`, BACKEND);
run(`"${VENV_PYTHON}" -m pip install -r requirements.txt`, BACKEND);
console.log('  ✅ Python dependencies installed.');

// ── 3. Root npm dependencies (concurrently) ──────────────────
step('📦 Installing root Node dependencies...');
run('npm install --silent', ROOT);
console.log('  ✅ Root Node dependencies installed.');

// ── 4. Frontend npm dependencies ─────────────────────────────
step('📦 Installing frontend dependencies...');
run('npm install --silent', path.join(ROOT, 'frontend'));
console.log('  ✅ Frontend dependencies installed.');

// ── Done ──────────────────────────────────────────────────────
console.log('\n========================================');
console.log('  ✅ Setup complete!');
console.log('');
console.log('  Run the project with:');
console.log('    npm run dev');
console.log('');
console.log('  Frontend  → http://localhost:3000');
console.log('  Backend   → http://localhost:8000');
console.log('  API docs  → http://localhost:8000/docs');
console.log('========================================\n');
