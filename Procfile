release: cd ./backend/blockso && python manage.py migrate
web: gunicorn --pythonpath ./blockso blockso.wsgi
