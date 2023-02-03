# std lib imports

# third party imports
from django.urls import path

# our imports
from .views import alchemy_notify_webhook, auth_nonce, auth_login, auth_logout, auth_session, \
        CommentCreateList, CommentLikeCreateListDestroy, CommentRetrieve, \
        ExploreList, FeedCreateList, FeedsFollowedByMeList, FeedFollowersList, \
        FeedFollowingList, FeedFollowCreateDestroy, FeedFollowingCreateRetrieveDestroy, \
        FeedsOwnedOrEditableList, FeedItemsList, FeedRetrieveUpdateDestroy, \
        MyFeedList, FollowCreateDestroy, FollowersList, FollowingList, \
        NotificationListUpdate, PostCreate, PostList, PostRetrieveUpdateDestroy, \
        PostLikeCreateListDestroy, ProfileCreateRetrieveUpdate, RepostDestroy, \
        UserList, UserRetrieve


urlpatterns = [
        path("alchemy-notify-webhook/", alchemy_notify_webhook),
        path("auth/nonce/", auth_nonce),
        path("auth/login/", auth_login),
        path("auth/logout/", auth_logout),
        path("auth/session/", auth_session),
        path("<str:address>/profile/", ProfileCreateRetrieveUpdate.as_view()),
        path("<str:address>/posts/", PostList.as_view()),
        path("<str:address>/follow/", FollowCreateDestroy.as_view()),
        path("<str:address>/followers/", FollowersList.as_view()),
        path("<str:address>/following/", FollowingList.as_view()),
        path("post/", PostCreate.as_view()),
        path("post/<int:id>/", PostRetrieveUpdateDestroy.as_view()),
        path("post/<int:id>/likes/", PostLikeCreateListDestroy.as_view()),
        path("post/<int:id>/repost/", RepostDestroy.as_view()),
        path("posts/<int:post_id>/comments/", CommentCreateList.as_view()),
        path("posts/<int:post_id>/comments/<int:comment_id>/", CommentRetrieve.as_view()),
        path(
            "posts/<int:post_id>/comments/<int:comment_id>/likes/",
            CommentLikeCreateListDestroy.as_view()
        ),
        path("explore/", ExploreList.as_view()),
        path("feed/", MyFeedList.as_view()),
        path("feeds/", FeedCreateList.as_view()),
        path("feeds/followed-by-me/", FeedsFollowedByMeList.as_view()),
        path("feeds/owned-or-editable/", FeedsOwnedOrEditableList.as_view()),
        path("feeds/<int:id>/", FeedRetrieveUpdateDestroy.as_view()),
        path("feeds/<int:id>/items/", FeedItemsList.as_view()),
        path("feeds/<int:id>/follow/", FeedFollowCreateDestroy.as_view()),
        path("feeds/<int:id>/followers/", FeedFollowersList.as_view()),
        path("feeds/<int:id>/following/", FeedFollowingList.as_view()),
        path(
            "feeds/<int:id>/following/<str:address>/",
            FeedFollowingCreateRetrieveDestroy.as_view()
        ),
        path("notifications/", NotificationListUpdate.as_view()),
        path("user/", UserRetrieve.as_view()),
        path("users/", UserList.as_view()),
]
