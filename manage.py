#!/usr/bin/env python
"""
Root proxy manage.py for UNBUmi Detector.
Redirects commands directly to backend/manage.py for ease of execution from root.
"""
import os
import sys
from pathlib import Path

if __name__ == '__main__':
    backend_dir = Path(__file__).resolve().parent / 'backend'
    os.chdir(backend_dir)
    sys.path.insert(0, str(backend_dir))
    sys.path.insert(0, str(backend_dir / 'apps'))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
