# std lib imports

# third party imports
from django.urls import path

# our imports
from .views import auth_nonce, auth_login, auth_logout, FeedList, \
        FollowCreateDestroy, PostCreateList, PostRetrieveUpdateDestroy, \
        ProfileCreateRetrieveUpdate, UserRetrieve


urlpatterns = [
        path("<str:address>/profile/", ProfileCreateRetrieveUpdate.as_view()),
        path("<str:address>/follow/", FollowCreateDestroy.as_view()),
        path("user/", UserRetrieve.as_view()),
        path("feed/", FeedList.as_view()),
        path("posts/<str:address>/", PostCreateList.as_view()),
        path("post/<int:id>/", PostRetrieveUpdateDestroy.as_view()),
        path("auth/nonce/", auth_nonce),
        path("auth/login/", auth_login),
        path("auth/logout/", auth_logout),
]
