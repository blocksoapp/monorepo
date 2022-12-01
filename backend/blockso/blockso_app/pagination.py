"""
Module containing classes that define paginators.
Note: keeping pagination classes explicit even though there
is redundant code.
"""
# std lib imports

# third party imports
from rest_framework.pagination import PageNumberPagination

# our imports


class CommentPagination(PageNumberPagination):
    """
    Pagination for listing Comments.
    """
    page_size = 5
    max_page_size = 5 


class NotificationPagination(PageNumberPagination):
    """
    Pagination for listing Notifications.
    """
    page_size = 20
    max_page_size = 20 


class PostsPagination(PageNumberPagination):
    """
    Pagination for listing Posts.
    """
    page_size = 20
    max_page_size = 20


class FeedPagination(PageNumberPagination):
    """
    Pagination for user's feed.
    """
    page_size = 25
    max_page_size = 25


class UserPagination(PageNumberPagination):
    """
    Pagination for listing Users.
    """
    page_size = 20
    max_page_size = 20
