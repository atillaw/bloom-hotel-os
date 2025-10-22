from __future__ import annotations

from django.apps import AppConfig


class FrontendConfig(AppConfig):
    """Configuration for the frontend app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "frontend"
