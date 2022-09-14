# std lib imports

# third party imports
from django.urls import path

# our imports
from .views import auth_nonce, auth_login, auth_logout, \
        ProfileCreateRetrieveUpdate


urlpatterns = [
        path("<str:address>/profile/", ProfileCreateRetrieveUpdate.as_view()),
        path("auth/nonce/", auth_nonce),
        path("auth/login/", auth_login),
        path("auth/logout/", auth_logout),
]
