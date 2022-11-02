# std lib imports

# third party imports
from django.urls import path

# our imports
from .views import auth_nonce, auth_login, auth_logout, CommentCreateList, \
        ExploreList, FeedList, FollowCreateDestroy, FollowersList, \
        FollowingList, NotificationList, PostCreateList, \
        PostRetrieveUpdateDestroy, ProfileCreateRetrieveUpdate, UserList, \
        UserRetrieve


urlpatterns = [
        path("auth/nonce/", auth_nonce),
        path("auth/login/", auth_login),
        path("auth/logout/", auth_logout),
        path("<str:address>/profile/", ProfileCreateRetrieveUpdate.as_view()),
        path("<str:address>/follow/", FollowCreateDestroy.as_view()),
        path("<str:address>/followers/", FollowersList.as_view()),
        path("<str:address>/following/", FollowingList.as_view()),
        path("post/<int:id>/", PostRetrieveUpdateDestroy.as_view()),
        path("posts/<str:address>/", PostCreateList.as_view()),
        path("posts/<int:post_id>/comments/", CommentCreateList.as_view()),
        path("explore/", ExploreList.as_view()),
        path("feed/", FeedList.as_view()),
        path("notifications/", NotificationList.as_view()),
        path("user/", UserRetrieve.as_view()),
        path("users/", UserList.as_view()),
]
