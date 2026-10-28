#!/usr/bin/env python3
"""Package the current checkout, excluding credentials, git history and build output."""
from pathlib import Path
import os
import stat
import zipfile

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'dist' / 'humoon-holding-full.zip'
EXCLUDED_DIRS = {'.git', 'dist', 'node_modules', '.cache', '__pycache__', '.venv', 'hamun-private'}
EXCLUDED_FILES = {'.env', '.netrc', '.git-credentials'}
EXCLUDED_SUFFIXES = {'.pem', '.key', '.p12', '.pfx'}


def files():
    for directory, dirs, names in os.walk(ROOT, followlinks=False):
        here = Path(directory)
        dirs[:] = sorted(name for name in dirs if name not in EXCLUDED_DIRS and not (here / name).is_symlink())
        for name in sorted(names):
            path = here / name
            if path.is_symlink() or name in EXCLUDED_FILES or name.startswith('.env.') or path.suffix.lower() in EXCLUDED_SUFFIXES:
                continue
            if path.is_file():
                yield path


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUTPUT.with_suffix('.zip.tmp')
    try:
        with zipfile.ZipFile(temp, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for path in files():
                entry = zipfile.ZipInfo(path.relative_to(ROOT).as_posix(), (2020, 1, 1, 0, 0, 0))
                entry.compress_type = zipfile.ZIP_DEFLATED
                entry.external_attr = (stat.S_IFREG | (path.stat().st_mode & 0o777)) << 16
                archive.writestr(entry, path.read_bytes())
        os.replace(temp, OUTPUT)
    finally:
        temp.unlink(missing_ok=True)
    print(f'Created {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size:,} bytes)')


if __name__ == '__main__':
    build()
