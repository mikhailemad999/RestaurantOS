"""
RestaurantOS — Custom Exception Handler
Returns consistent API error responses: {success, message, errors, data}
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON responses.

    Response format:
    {
        "success": false,
        "message": "Human-readable error message",
        "errors": { ... } or [...],
        "data": null
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'success': False,
            'message': _get_error_message(exc, response),
            'errors': _get_error_details(response.data),
            'data': None,
        }
        response.data = custom_response
        return response

    # Handle Django's ValidationError
    if isinstance(exc, DjangoValidationError):
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': exc.message_dict if hasattr(exc, 'message_dict') else {'detail': exc.messages},
            'data': None,
        }, status=status.HTTP_400_BAD_REQUEST)

    # Handle 404
    if isinstance(exc, Http404):
        return Response({
            'success': False,
            'message': 'Resource not found',
            'errors': None,
            'data': None,
        }, status=status.HTTP_404_NOT_FOUND)

    # Log unhandled exceptions
    logger.exception(f'Unhandled exception: {exc}')

    return Response({
        'success': False,
        'message': 'An unexpected error occurred',
        'errors': None,
        'data': None,
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _get_error_message(exc, response):
    """Extract a human-readable error message."""
    if response.status_code == 401:
        return 'Authentication credentials were not provided or are invalid'
    if response.status_code == 403:
        return 'You do not have permission to perform this action'
    if response.status_code == 404:
        return 'Resource not found'
    if response.status_code == 429:
        return 'Too many requests. Please try again later'
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, str):
            return exc.detail
        if isinstance(exc.detail, dict) and 'detail' in exc.detail:
            return str(exc.detail['detail'])
    return 'An error occurred'


def _get_error_details(data):
    """Format error details from DRF response data."""
    if isinstance(data, dict):
        # Remove 'detail' key if it's the only meaningful error
        if 'detail' in data and len(data) == 1:
            return None
        return data
    if isinstance(data, list):
        return data
    return None


class APIError(Exception):
    """Custom API error for use in services."""

    def __init__(self, message, status_code=400, errors=None):
        self.message = message
        self.status_code = status_code
        self.errors = errors
        super().__init__(message)
