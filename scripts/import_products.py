#!/usr/bin/env python3
"""
Product Import Script - uses Supabase REST API (no external deps needed)
Parses product-import.sql and POSTs each product via Supabase HTTP API.
"""

import os
import json
import re
import urllib.request
import urllib.error
import sys

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    sys.exit(1)

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=ignore-duplicates",
}

possible_paths = [
    "/vercel/share/v0-project/scripts/product-import.sql",
    os.path.join(os.getcwd(), "scripts", "product-import.sql"),
    os.path.join(os.getcwd(), "product-import.sql"),
]
sql_file = next((p for p in possible_paths if os.path.exists(p)), None)
if not sql_file:
    print(f"Error: product-import.sql not found. Tried: {possible_paths}")
    sys.exit(1)

print(f"Reading SQL from: {sql_file}")
with open(sql_file, "r", encoding="utf-8") as f:
    sql_content = f.read()

# Extract each INSERT block (one per product)
# Pattern: VALUES (...) ON CONFLICT ...
insert_pattern = re.compile(
    r"INSERT INTO products \(([^)]+)\)\s*VALUES\s*\(([\s\S]*?)\)\s*ON CONFLICT",
    re.MULTILINE
)

def parse_columns(cols_str):
    return [c.strip() for c in cols_str.split(",")]

def parse_values(vals_str):
    """
    Parse a PostgreSQL VALUES clause into a list of Python values.
    Handles: strings with '', ::jsonb casts, NULL, numbers, booleans.
    """
    values = []
    i = 0
    s = vals_str.strip()
    
    while i < len(s):
        # skip whitespace and commas between values
        while i < len(s) and s[i] in (' ', '\n', '\r', '\t'):
            i += 1
        if i >= len(s):
            break
        if s[i] == ',':
            i += 1
            continue

        # String value starting with '
        if s[i] == "'":
            j = i + 1
            result = []
            while j < len(s):
                if s[j] == "'" and j + 1 < len(s) and s[j+1] == "'":
                    result.append("'")
                    j += 2
                elif s[j] == "'":
                    j += 1
                    break
                else:
                    result.append(s[j])
                    j += 1
            token = "".join(result)
            # skip ::jsonb or ::text cast
            while j < len(s) and s[j] in (' ', '\n', '\r', '\t'):
                j += 1
            if s[j:j+2] == "::":
                while j < len(s) and s[j] not in (',', ')'):
                    j += 1
            values.append(token)
            i = j
        # NULL
        elif s[i:i+4].upper() == "NULL":
            values.append(None)
            i += 4
        # true/false
        elif s[i:i+4].lower() == "true":
            values.append(True)
            i += 4
        elif s[i:i+5].lower() == "false":
            values.append(False)
            i += 5
        # number
        elif s[i].isdigit() or (s[i] == '-' and i+1 < len(s) and s[i+1].isdigit()):
            j = i
            if s[j] == '-':
                j += 1
            while j < len(s) and (s[j].isdigit() or s[j] == '.'):
                j += 1
            num_str = s[i:j]
            values.append(float(num_str) if '.' in num_str else int(num_str))
            i = j
        else:
            # skip unknown char
            i += 1

    return values


matches = insert_pattern.findall(sql_content)
print(f"Found {len(matches)} product INSERT statements")

success = 0
skipped = 0
errors = 0

for cols_str, vals_str in matches:
    cols = parse_columns(cols_str)
    vals = parse_values(vals_str)

    if len(cols) != len(vals):
        print(f"  Warning: column/value mismatch ({len(cols)} cols, {len(vals)} vals) — skipping")
        errors += 1
        continue

    product = dict(zip(cols, vals))

    # Parse JSON strings for images and attributes
    for key in ("images", "attributes"):
        if isinstance(product.get(key), str):
            try:
                product[key] = json.loads(product[key])
            except json.JSONDecodeError:
                pass

    url = f"{SUPABASE_URL}/rest/v1/products"
    data = json.dumps(product).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=HEADERS, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            if status in (200, 201):
                print(f"  Inserted: {product.get('name', '?')} [{product.get('slug')}]")
                success += 1
            else:
                print(f"  Status {status}: {product.get('slug')}")
                skipped += 1
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "duplicate" in body.lower() or e.code == 409:
            print(f"  Skipped (duplicate): {product.get('slug')}")
            skipped += 1
        else:
            print(f"  Error {e.code} for {product.get('slug')}: {body[:120]}")
            errors += 1
    except Exception as ex:
        print(f"  Unexpected error for {product.get('slug')}: {ex}")
        errors += 1

print(f"\nDone! Inserted: {success} | Skipped (duplicates): {skipped} | Errors: {errors}")
