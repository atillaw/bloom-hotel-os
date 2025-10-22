"""hotel_site URL Configuration."""

from __future__ import annotations

from django.contrib import admin
from django.urls import path, re_path

from frontend.views import FrontendAppView

urlpatterns = [
    path("admin/", admin.site.urls),
    re_path(r"^(?:.*)/?$", FrontendAppView.as_view(), name="frontend"),
]
