#!/bin/bash
cd /vercel/share/v0-project/scripts
uv init --bare . 2>/dev/null || true
uv add psycopg2-binary 2>&1
uv run import_products.py
