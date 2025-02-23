FROM continuumio/miniconda3
LABEL maintainer="cianmckenna"


ENV PYTHONBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=dashboard.settings

RUN mkdir -p /app
WORKDIR /app

COPY ENV.yml .

# Add the conda-forge channel -> fix for whitenoise missing
RUN conda config --add channels conda-forge
RUN conda env create -f ENV.yml

# RUN command should use the new environment
SHELL [ "conda", "run", "-n", "airgead_geo", "/bin/bash", "-c" ]

# Install pip-only dependencies
RUN pip install django-rest-knox
RUN pip install django-rest-passwordreset
RUN pip install django-q2

RUN echo "conda activate airgead_geo" >> ~/.bashrc
SHELL ["/bin/bash", "--login", "-c"]

# Copy everything in your Django project to the image.

COPY . /app
ENV PYTHONPATH="/app"

ENTRYPOINT ["conda", "run", "--no-capture-output", "-n", "airgead_geo"]


# EXPOSE the port that container will operate on 
EXPOSE 8001

# SHELL [ "python", "manage.py", "createsuperuser" ]
# Finally, start the server
CMD [ "python", "manage.py", "runserver", "0.0.0.0:8001" ]
