# Analytics Engine

![Redash](https://img.shields.io/badge/Redash-24.04.0-blue)

**formsflow.ai** leverages [Redash](https://github.com/getredash/redash) to build interactive
dashboards and gain insights. To create meaningful visualization for
your use case with formsflow.ai checkout [Redash Knowledge base](https://redash.io/help/).

## Analytics Setup

[Instructions for analytics setup](../deployment/Individual-deployment/README.md)

### Required secrets

`REDASH_COOKIE_SECRET` and `REDASH_SECRET_KEY` have no default values and must be set in `.env`
before starting the stack; `docker compose up` fails if either is empty. Generate a unique random
value for each, for example:

```bash
openssl rand -hex 32
```

> **Security notice:** earlier versions of `sample.env` shipped `redash-selfhosted` as the value of
> both secrets. Anyone who knows these values can forge Redash admin sessions. If your deployment
> uses them (or any other value copied from a sample file), rotate both secrets immediately and
> restart all Redash services. Rotating `REDASH_COOKIE_SECRET` signs out all users. Data source
> credentials are encrypted with `REDASH_SECRET_KEY` (falling back to `REDASH_COOKIE_SECRET` when it
> is not set), so re-enter the data source credentials after rotating it.

### Additional reference

Check out the [installation documentation](https://aot-technologies.github.io/forms-flow-installation-doc/) for installation instructions and [features documentation](https://aot-technologies.github.io/forms-flow-ai-doc) to explore features and capabilities in detail.
