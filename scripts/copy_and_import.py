#!/usr/bin/env python3
import os, shutil

# Copy the SQL file to the execution cwd
src = "/vercel/share/v0-project/scripts/product-import.sql"
dst = os.path.join(os.getcwd(), "product-import.sql")
shutil.copy2(src, dst)
print(f"Copied {src} -> {dst}")
