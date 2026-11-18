"""Sandboxed Jinja environments for rendering templates.

Custom PDF templates are supplied by API callers, so they must never be
rendered with a plain Jinja ``Environment``: that allows access to Python
internals (e.g. ``''.__class__.__mro__``) and leads to remote code execution.
All template rendering in this service goes through an
``ImmutableSandboxedEnvironment``, which blocks unsafe attribute access and
mutation of objects passed into the template.

Caller-supplied templates are rendered with ``create_sandboxed_environment``,
which has no Flask globals at all. Flask's own environment is also sandboxed
(``SandboxedFlaskEnvironment``) as defense in depth, and refuses any access to
the application ``Config`` so secrets can never be read or changed from a
template.
"""

from flask.config import Config
from jinja2.sandbox import ImmutableSandboxedEnvironment, SecurityError

# Flask globals / context entries that templates in this service never need.
FLASK_TEMPLATE_GLOBALS_TO_REMOVE = ("config", "request", "session", "g")


def _reject_config(obj):
    """Raise if a template tries to touch the Flask application config."""
    if isinstance(obj, Config):
        raise SecurityError("access to the application config is not allowed")


class _ConfigBlockingSandbox(ImmutableSandboxedEnvironment):
    """Immutable sandbox that also blocks all access to a Flask ``Config``.

    The sandbox falls back from attribute to item lookup (``config.SECRET``
    reads ``config['SECRET']``), so both paths are blocked, as well as calls
    to methods bound to a Config (e.g. ``config.from_mapping``).
    """

    def getattr(self, obj, attribute):
        """Block attribute access (and its item fallback) on a Flask Config."""
        _reject_config(obj)
        return super().getattr(obj, attribute)

    def getitem(self, obj, argument):
        """Block item access (``config['SECRET']``) on a Flask Config."""
        _reject_config(obj)
        return super().getitem(obj, argument)

    def is_safe_callable(self, obj):
        """Disallow calling methods bound to a Flask Config."""
        if isinstance(getattr(obj, "__self__", None), Config):
            return False
        return super().is_safe_callable(obj)


class SandboxedFlaskEnvironment(_ConfigBlockingSandbox):
    """Sandboxed drop-in replacement for ``flask.templating.Environment``.

    Assigned to ``Flask.jinja_environment`` so that ``flask.render_template``
    also renders inside the sandbox.
    """

    def __init__(self, app, **options):
        """Create the environment, using the app's global loader by default."""
        if "loader" not in options:
            options["loader"] = app.create_global_jinja_loader()
        super().__init__(**options)
        self.app = app


def harden_flask_templates(app):
    """Remove Flask globals and context entries that expose app internals.

    Flask adds ``config`` as a template global and injects ``request``,
    ``session`` and ``g`` into every ``render_template`` context. None of the
    service's templates use them, and they expose secrets and server internals.
    """
    for name in FLASK_TEMPLATE_GLOBALS_TO_REMOVE:
        app.jinja_env.globals.pop(name, None)
    # Drop Flask's default context processor (injects request, session and g).
    app.template_context_processors[None] = []


def create_sandboxed_environment(loader, **options) -> ImmutableSandboxedEnvironment:
    """Return a sandboxed, autoescaping Jinja environment for the given loader."""
    options.setdefault("autoescape", True)
    return _ConfigBlockingSandbox(loader=loader, **options)
