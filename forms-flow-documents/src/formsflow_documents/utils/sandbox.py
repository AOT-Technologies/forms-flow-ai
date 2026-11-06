"""Sandboxed Jinja environments for rendering templates.

Custom PDF templates are supplied by API callers, so they must never be
rendered with a plain Jinja ``Environment``: that allows access to Python
internals (e.g. ``''.__class__.__mro__``) and leads to remote code execution.
All template rendering in this service goes through an
``ImmutableSandboxedEnvironment``, which blocks unsafe attribute access and
mutation of objects passed into the template.
"""

from jinja2.sandbox import ImmutableSandboxedEnvironment


class SandboxedFlaskEnvironment(ImmutableSandboxedEnvironment):
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


def create_sandboxed_environment(loader, **options) -> ImmutableSandboxedEnvironment:
    """Return a sandboxed, autoescaping Jinja environment for the given loader."""
    options.setdefault("autoescape", True)
    return ImmutableSandboxedEnvironment(loader=loader, **options)
