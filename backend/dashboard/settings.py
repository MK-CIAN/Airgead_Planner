"""
Django settings for Airgead Planner dashboard.
"""

from pathlib import Path
import os
import socket
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

from decouple import config
# Load sensitive variables from .env
API_KEY = config("API_KEY")
BASE_URL = config("BASE_URL")
DEFAULT_COUNTRY = config("DEFAULT_COUNTRY")
DEFAULT_CATEGORY = config("DEFAULT_CATEGORY")
KEYWORD_QUERY = config("KEYWORD_QUERY")
FETCH_ARTICLES_INTERVAL_DAYS = config("FETCH_ARTICLES_INTERVAL_DAYS", default=7, cast=int)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")
DEPLOY_SECURE = config("DEPLOY_SECURE", default="False").lower() == "true"
POSTGRES_PORT = config("POSTGRES_PORT")


# Detect if running locally or in Docker
if socket.gethostname() == "Cians-Air":  # Adjust for your local machine name
    IS_LOCAL = True
else:
    IS_LOCAL = False

# =======================
# DATABASE CONFIGURATION
# =======================
#LOCAL VARS
#NAME: postgres
#USER: admin
#PASSWORD: password123

#DOCKER VARS
#'NAME': config("POSTGRES_DB"),
#'USER': config("POSTGRES_USER"),
#'PASSWORD': config("POSTGRES_PASSWORD"),
IS_LOCAL = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'admin',
        'PASSWORD': 'password123',
        'HOST': "localhost" if IS_LOCAL else "postgres",  # Use 'postgis' as host in Docker
        'PORT': POSTGRES_PORT if IS_LOCAL else "5432",
        'OPTIONS': {
            'options': '-c search_path=airgead_planner'
        }
    }
}

# =======================
# 🔹 DEBUG & SECURITY SETTINGS
# =======================
if DEPLOY_SECURE:
    DEBUG = False
    TEMPLATES = [{
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "debug": False,
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }]
    ALLOWED_HOSTS = ['airgeadplanner.com', 'www.airgeadplanner.com']
    CSRF_TRUSTED_ORIGINS = ['https://airgeadplanner.com']
    CORS_ALLOWED_ORIGINS = ['https://airgeadplanner.com']
    
    STATIC_URL = '/static/'
    STATIC_ROOT = '/usr/share/nginx/html/static'

    MEDIA_URL = '/media/'
    MEDIA_ROOT = '/app/media'
else:
    DEBUG = True
    TEMPLATES = [{
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "debug": True,
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }]
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "airgeadplanner"]
    CORS_ALLOW_ALL_ORIGINS = True  # Allow all CORS during development
    
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, "static")

    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# =======================
# 🔹 APPLICATION CONFIGURATION
# =======================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'data',
    'users',
    'rest_framework',
    'corsheaders',
    'knox',
    'django_rest_passwordreset',
    'chat',
    'django_q',
]

MIDDLEWARE = [
    'dashboard.middleware.CustomCORSMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",
]

AUTH_USER_MODEL = 'users.CustomUser'
AUTHENTICATION_BACKENDS = [
    'users.auth_backend.EmailAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

ROOT_URLCONF = 'dashboard.urls'

WSGI_APPLICATION = 'dashboard.wsgi.application'
REST_FRAMEWORK = { 'DEFAULT_AUTHENTICATION_CLASSES': ('knox.auth.TokenAuthentication',) }



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# =======================
# 🔹 EMAIL SETTINGS
# =======================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'Airgead Planner'


# Auto Updates for Stock Data
Q_CLUSTER = {
    'name': 'DjangoQ',
    'workers': 4,  # Number of worker processes
    'timeout': 90,
    'retry': 120,
    'queue_limit': 500,
    'bulk': 10,
    'orm': 'default'  # Use Django ORM for queue storage
}


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
