"""
Module containing classes that define paginators.
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


class PostsPagination(PageNumberPagination):
    """
    Pagination for listing Posts.
    """
    page_size = 20
    max_page_size = 20


class UserPagination(PageNumberPagination):
    """
    Pagination for listing Users.
    """
    page_size = 20
    max_page_size = 20
