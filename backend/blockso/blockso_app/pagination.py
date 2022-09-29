"""
Module containing classes that define paginators.
"""
# std lib imports

# third party imports
from rest_framework.pagination import PageNumberPagination

# our imports


class PostsPagination(PageNumberPagination):
    """
    Pagination for listing Posts.
    """
    page_size = 20
    max_page_size = 20
