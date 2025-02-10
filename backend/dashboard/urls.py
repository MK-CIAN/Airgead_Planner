from django.contrib import admin
from django.urls import path, include
from django.urls import re_path
from knox import views as knox_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ✅ Prefix all URLs with "api/"
    path('api/', include('users.urls')),
    path('api/data/', include('data.urls')),
    path('api/chat/', include('chat.urls')),

    # Knox Authentication & Password Reset APIs
    path('api/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path('api/auth/', include('knox.urls')),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
