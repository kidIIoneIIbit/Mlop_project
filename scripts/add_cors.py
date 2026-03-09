"""
Patches backend/main.py to add FastAPI CORSMiddleware.
Called automatically by setup.sh — safe to run multiple times.

Usage:
    python scripts/add_cors.py backend/main.py
"""

import sys
import re

CORS_IMPORT = "from fastapi.middleware.cors import CORSMiddleware"

CORS_BLOCK = """
# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""

def patch(path: str) -> None:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Skip if already patched
    if "CORSMiddleware" in content:
        print(f"  ⏭  CORS already present in {path}, skipping.")
        return

    # 1. Add the import after the last existing `from fastapi` import line
    content = re.sub(
        r"(from fastapi(?:\.[\w]+)? import [^\n]+\n)(?!from fastapi)",
        r"\1" + CORS_IMPORT + "\n",
        content,
        count=1,
    )

    # 2. Insert the middleware call right after `app = FastAPI(...)`
    #    Handles both single-line and multi-line FastAPI(...) constructors
    content = re.sub(
        r"(app\s*=\s*FastAPI\([^)]*\)\s*\n)",
        r"\1" + CORS_BLOCK,
        content,
        count=1,
        flags=re.DOTALL,
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  ✅ CORS middleware added to {path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_cors.py <path/to/main.py>")
        sys.exit(1)
    patch(sys.argv[1])
