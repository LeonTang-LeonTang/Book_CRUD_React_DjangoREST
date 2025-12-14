# Book CRUD (React + Django REST)

Simple CRUD demo: React frontend + Django REST backend for managing books.

## Tech stack
- Frontend: React + Vite ([client/app/package.json](client/app/package.json))
- Backend: Django + Django REST Framework + django-cors-headers ([server/djangoProject/djangoProject/settings.py](server/djangoProject/djangoProject/settings.py))
- DB: SQLite ([server/djangoProject/db.sqlite3](server/djangoProject/db.sqlite3))

## Quick start

Backend
```bash
cd server/djangoProject
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install django djangorestframework django-cors-headers
python [manage.py](http://_vscodecontentref_/0) migrate
python [manage.py](http://_vscodecontentref_/1) runserver
