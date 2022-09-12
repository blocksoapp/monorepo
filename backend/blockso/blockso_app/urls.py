# std lib imports

# third party imports
from django.urls import path

# our imports
from .views import ProfileCreateRetrieveUpdate


urlpatterns = [
        path("<str:address>/profile/", ProfileCreateRetrieveUpdate.as_view())
]
