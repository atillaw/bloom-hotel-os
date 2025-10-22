"""Views for serving the React single-page application."""

from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.http import Http404, HttpResponse
from django.views import View


class FrontendAppView(View):
    """Serve the compiled React application through Django."""

    http_method_names = ["get", "head"]

    def get(self, request, *_args, **_kwargs):  # type: ignore[override]
        return self._render_react_index()

    def head(self, request, *_args, **_kwargs):  # type: ignore[override]
        return self._render_react_index()

    def _render_react_index(self) -> HttpResponse:
        index_path: Path = settings.FRONTEND_INDEX_PATH
        if not index_path.exists():
            raise Http404(
                "Vite build not found. Run 'npm install' and 'npm run build' before starting the Django server."
            )

        html = index_path.read_text(encoding="utf-8")
        assets_prefix = f"{settings.STATIC_URL.rstrip('/')}/assets/"
        html = html.replace("/assets/", assets_prefix)

        return HttpResponse(html)
