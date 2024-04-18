# # The first instruction is what image we want to base our container on
# # We Use an official Python runtime as a parent image
# FROM python:3.9

# # The enviroment variable ensures that the python output is set straight
# # to the terminal with out buffering it first
# ENV PYTHONUNBUFFERED 1

# # create root directory for our project in the container
# RUN mkdir /national-park-explorer

# # Set the working directory to /music_service
# WORKDIR /national-park-explorer

# # Copy the current directory contents into the container at /music_service
# ADD . /national-park-explorer

# # Install any needed packages specified in requirements.txt
# RUN pip install -r requirements.txt

# EXPOSE 8000

# # Run server
# CMD gunicorn -b 0.0.0.0:8000 server.wsgi



# FROM python:3.9-alpine

# WORKDIR /code

# ENV PYTHONDONTWRITEBYTECODE=1
# ENV PYTHONUNBUFFERED=1 
# # Allows docker to cache installed dependencies between builds
# COPY requirements.txt /code/requirements.txt
# RUN apk update
# RUN apk add postgresql-dev gcc python3-dev musl-dev
# RUN pip install --no-cache-dir -r requirements.txt

# # Mounts the application code to the image
# COPY . /code

# EXPOSE 8000

# RUN python manage.py makemigrations
# RUN python manage.py migrate

# CMD ["gunicorn", "--config", "gunicorn_config.py", "server.wsgi:application"]




# # Use an official Python runtime as a parent image
# FROM python:3.10

# # Set the working directory to /app
# WORKDIR /app

# # Copy the requirements file into the container
# COPY requirements.txt .

# # Install any needed packages specified in requirements.txt
# RUN apt-get update
# # RUN apt-get add postgresql-dev gcc python3-dev musl-dev
# # RUN apt-get install postgresql
# RUN systemctl start postgresql
# RUN pip install --no-cache-dir -r requirements.txt

# # Set environment variables
# ENV DATABASE_NAME=npe_db
# ENV DATABASE_USER=mheyda
# ENV DATABASE_PASSWORD=password
# ENV NPS_API_KEY=***REMOVED***
# ENV OPEN_WEATHER_API_KEY=***REMOVED***
# ENV SECRET_KEY="***REMOVED***"
# ENV DISABLE_COLLECTSTATIC=1

# # Install PostgreSQL
# RUN apt-get update && apt-get install -y postgresql postgresql-contrib

# # Create the database
# RUN service postgresql start && \
#     su postgres -c "psql -c \"CREATE DATABASE ${DATABASE_NAME};\"" && \
#     service postgresql stop

# # Copy the Django project into the container
# COPY . .

# # Run Django migrations to create the necessary tables in the database
# RUN python manage.py migrate

# # Expose the default Django port
# EXPOSE 8000

# # Start the Django development server
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


FROM python:3.10

WORKDIR /national_park_explorer

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

RUN python manage.py collectstatic

CMD gunicorn -b 0.0.0.0:80 server.wsgi
# CMD ["gunicorn", "--config", "gunicorn_config.py", "server.wsgi:application"]
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]