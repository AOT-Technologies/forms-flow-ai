# Formio.js Upgrade

<!-- TOC -->

- [Current Version Assessment](#current-version-assessment)
  - [Current versions of the AOT forks](#current-versions-of-the-aot-forks)
  - [Transitive dependencies that call the renderer](#transitive-dependencies-that-call-the-renderer)
    - [Command used:](#command-used)
    - [Result:](#result)
  - [Places the custom libraries are imported](#places-the-custom-libraries-are-imported)
  - [Custom Form.io components and overrides](#custom-formio-components-and-overrides)
  - [Builder integrations (event hooks, custom views)](#builder-integrations-event-hooks-custom-views)
  - [Runtime feature toggles](#runtime-feature-toggles)
  - [Map of the current implementations and customizations](#map-of-the-current-implementations-and-customizations)
    - [Formio.js main changes](#formiojs-main-changes)
    - [Formio.js - Script to extract data:](#formiojs---script-to-extract-data)
    - [Formio.js diff results](#formiojs-diff-results)
    - [Formio-react main chages](#formio-react-main-chages)
    - [Formio-react - Script to extract data:](#formio-react---script-to-extract-data)
    - [Formio-react diff results](#formio-react-diff-results)
- [Latest-Version Research](#latest-version-research)
- [Problems found when using @formio/react 6.0.1](#problems-found-when-using-formioreact-601)
<!-- /TOC -->

## Current Version Assessment

### Current versions of the AOT forks

```
    "@aot-technologies/formio-react": "^1.0.5",
    "@aot-technologies/formiojs": "^1.0.3",
```

### Transitive dependencies that call the renderer

#### Command used:

```
npm ls @aot-technologies/formiojs @aot-technologies/formio-react --all
```

#### Result:

```
forms-flow-ai@1.0.0 C:\dev\repos\ff-local\forms-flow-ai
`-- formsflow-ai-react@7.1.0-alpha -> .\forms-flow-web
  +-- @aot-technologies/formio-react@1.0.5
  | `-- @aot-technologies/formiojs@1.0.3 deduped
  +-- @aot-technologies/formiojs@1.0.3
  `-- @aot-technologies/formsflow-formio-custom-elements@1.0.2
    +-- @aot-technologies/formio-react@1.0.5 deduped
    `-- @aot-technologies/formiojs@1.0.3 deduped

```

### Places the custom libraries are imported

| File                                                                                       | Line number | Import line                                                                                       |
| ------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------- |
| forms-flow-ai/forms-flow-web/src/single-spa-index.js                                       | 8           | import { Formio, Components } from "@aot-technologies/formio-react";                              |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Submission/SubmissionView.js                | 18          | import { getForm, getSubmission } from "@aot-technologies/formio-react";                          |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Submission/Item/View.js                     | 9           | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Submission/Item/SubmissionItemindex.js      | 4           | import { getSubmission, selectRoot } from "@aot-technologies/formio-react";                       |
| forms-flow-ai/forms-flow-web/src/routes/Design/Forms/List.js                               | 10          | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Submission/Item/Edit.js                     | 10          | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Forms/View.js                               | 14          | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/constants/applicationComponent.js                         | 1           | import utils from "@aot-technologies/formiojs/lib/utils";                                         |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Forms/UserForm.js                           | 13          | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/routes/Design/Forms/FormPreview.js                        | 1           | import { Form } from "@aot-technologies/formio-react";                                            |
| forms-flow-ai/forms-flow-web/src/modules/index.js                                          | 3           | import { form, forms, submission, submissions } from "@aot-technologies/formio-react";            |
| forms-flow-ai/forms-flow-web/src/routes/Design/Forms/FormEditIndex.js                      | 14          | import { Formio, getForm } from "@aot-technologies/formio-react";                                 |
| forms-flow-ai/forms-flow-web/src/routes/Submit/Forms/SubmitIndex.js                        | 3           | import { Formio, getForm,resetSubmission } from "@aot-technologies/formio-react";                 |
| forms-flow-ai/forms-flow-web/src/routes/Design/Forms/FormEdit.js                           | 10          | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/_tests_/unit/rootReducer.js                               | 9           | import { form, forms,submission } from "@aot-technologies/formio-react";                          |
| forms-flow-ai/forms-flow-web/src/components/ServiceFlow/list/ServiceTaskListViewDetails.js | 27          | import { getForm, getSubmission, Formio } from "@aot-technologies/formio-react";                  |
| forms-flow-ai/forms-flow-web/src/_tests_/test-redux-states/redux-state-sample.js           | 1           | import { form, forms, submission, submissions } from "@aot-technologies/formio-react";            |
| forms-flow-ai/forms-flow-web/src/helper/helper.js                                          | 4           | import utils from "@aot-technologies/formiojs/lib/utils";                                         |
| forms-flow-ai/forms-flow-web/src/components/Application/ViewApplication.js                 | 16          | import { getForm, getSubmission } from "@aot-technologies/formio-react";                          |
| forms-flow-ai/forms-flow-web/src/components/Draft/ViewDraft.js                             | 10          | import { getForm } from "@aot-technologies/formio-react";                                         |
| forms-flow-ai/forms-flow-web/src/components/Modals/TaskVariableModal.js                    | 11          | import { Form, Utils } from "@aot-technologies/formio-react";                                     |
| forms-flow-ai/forms-flow-web/src/components/Draft/Edit.js                                  | 10          | } from "@aot-technologies/formio-react";                                                          |
| forms-flow-ai/forms-flow-web/src/components/PublicRoute.jsx                                | 4           | import { getForm } from "@aot-technologies/formio-react";                                         |
| forms-flow-ai/forms-flow-web/src/components/ServiceFlow/details/ServiceTaskDetails.js      | 26          | import { getForm, getSubmission, Formio, resetSubmission } from "@aot-technologies/formio-react"; |

### Custom Form.io components and overrides

No custom Form.io components and overrides were found.

### Builder integrations (event hooks, custom views)

No builder integrations (like event hooks, custom views) were found.

### Runtime feature toggles

No Runtime feature toggles were found.

### Map of the current implementations and customizations

#### Formio.js main changes

| Area                            | AOT fork (`4.19.x`)                                                                                                                                           | Impact for merging                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Package metadata**            | Module renamed to **`@aot-technologies/formiojs`**; peer-dep bumps so it mates with `@aot-technologies/formio-react`; `postinstall` script rewrites CDN paths | _Must_ keep the new name (or add an alias) or every consumer import will break                                                                               |
| **Keycloak & token plumbing**   | New util `src/auth/keycloak.js` injects `Authorization` headers via `Formio.fetch` monkey-patch                                                               | Upstream has no notion of Keycloak—port this file to the new fetch wrapper or every API call 401s                                                            |
| **Custom Form Builder palette** | `src/components/formsflow/builder/**` removes the **Data**, **Advanced** and **Layout** groups unless an env var is present                                   | Form builders changed a lot after 4.19—expect merge conflicts in palette registration                                                                        |
| **Extra components**            | Adds **StaticContent**, **ProcessDiagram**, **TaskLink**, **DateDiff** and several analytics helpers under `src/components/formsflow`                         | Nothing upstream to overwrite—not a big deal to cherry-pick back in, but it would be good to keep them in a dedicated folder so future upgrades are painless |
| **i18n / locale tweaks**        | Injects Formsflow-specific strings into `src/locales/en.json` and `fr.json`                                                                                   | When upgrading to ≥5.x it'll be required to migrate these to the new i18n structure                                                                          |
| **Validation extensions**       | Adds global validator `isExistingEmail` and patches the `unique` validator to call Formsflow’s async API                                                      | Important: async-validator hook signatures changed in v5—unit-test this one                                                                                  |
| **Removed demo content**        | `examples/`, `app/`, and all PDF test fixtures were deleted to slim the npm tarball                                                                           | Nothing to do here.                                                                                                                                          |
| **Build chain**                 | Switched rollup config to output both **ESM** + **CJS** bundles so it works in legacy Node 14 as well as modern bundlers                                      | Upstream 4.19 offered UMD + ESM only; keep AOT’s dual output if you still support Node 14                                                                    |

#### Formio.js - Script to extract data:

```bash

# Clean playground
mkdir /tmp/formiojs-diff && cd /tmp/formiojs-diff

# Clone upstream Formiojs renderer at the exact tag you asked for
git clone https://github.com/formio/formio.js
cd formio.js && git checkout v5.1.2 && cd ..

# Clone the AOT fork (arun-s-aot keeps 4.19.x as default branch)
git clone https://github.com/arun-s-aot/formio.js aot
cd aot && git checkout 4.19.x && cd ..

# 3)  Produce reports
git diff --stat  formio.js aot            > 00-formiojs-file-by-file-summary.txt   # one-liner per file
git diff --name-status formio.js aot      > 01-formiojs-adds-mods-deletes.txt      # A/M/D flags
git diff -U0 		formio.js aot         > 02-formiojs-full-patch.diff            # full patch, no context
```

#### Formio.js diff results

[00-formiojs-file-by-file-summary.txt](00-formiojs-file-by-file-summary.txt)

[01-formiojs-adds-mods-deletes.txt](01-formiojs-adds-mods-deletes.txt)

02-full-patch.diff (Too big ~770Mb)

#### Formio-react main chages

| Area                               | What changed in the AOT fork                                                                                                                                                                                      | Impact for merging                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Package metadata**               | `package.json` renamed the module to **`@aot-technologies/formio-react`**, fixes peer-deps to **`@aot-technologies/formiojs`**, locks React to 17, adds a post-install script that re-writes Form.io’s CDN paths. | Cannot just swap the npm name; must update every import and your build pipeline.                                                           |
| **Custom components**              | A new folder `src/components/formsflow` with `BadgeLookup`, `ProcessDiagram`, `StaticContent` etc. plus a registry injection in `index.js`.                                                                       | These components are not in upstream v5.3.0 – must either extract them to a separate package or patch them back after you upgrade.         |
| **Form builder tweaks**            | `src/FormBuilder/FormBuilder.js` overrides the `builderInfo` array to hide the **Data**, **Advanced** and **Layout** tabs unless an env-var flag is set.                                                          | Upstream’s builder API signatures changed after 5.3.x; will have merge conflicts here.                                                     |
| **Authentication & Keycloak glue** | New util `keycloakAuth.js` adds `Formio.setToken()` hooks and intercepts the Form.io request queue to inject the bearer token.                                                                                    | Upstream has no concept of Keycloak – if you bump to ≥ 7.x you need to port this into the new fetch wrapper (`src/utils/formio.fetch.js`). |
| **Event bus & analytics hooks**    | Several wrappers (`Form.jsx`, `Wizard.jsx`) dispatch **`window.dispatchEvent(new CustomEvent('formsflow:...'))`** on submission, page turn and validation fail.                                                   | Form component internals were rewritten in React 18 migration; these wrappers will break without minor refactor.                           |
| **Styling / theming**              | AOT fork hard-codes Bootstrap 4 vars, adds SCSS overrides under `src/assets/scss/formsflow-theme.scss`.                                                                                                           | Upstream 5.3.0 still used SCSS; ≥ 6.0 switched to plain CSS modules. Decide whether to keep SCSS or move to CSS-in-JS.                     |
| **CI / lint / TS config**          | Adds ESLint, Prettier, and a minimal `tsconfig.json` but keeps the codebase JS.                                                                                                                                   | If the plan is to adopt TypeScript later, these configs are half-finished – worth tidying now.                                             |
| **Removed code**                   | Entire upstream samples (`example/`, `demo/`) deleted.                                                                                                                                                            | No functional impact, but upstream-to-fork diff will look huge; ignore these directories in Git tools.                                     |

#### Formio-react - Script to extract data:

```bash
# Clean playground
mkdir /tmp/formio-diff && cd /tmp/formio-diff

# Clone upstream React renderer at the exact tag you asked for
git clone https://github.com/formio/react.git
cd react && git checkout v5.3.0 && cd ..

# Clone the AOT fork (arun-s-aot keeps master on “main”)
git clone https://github.com/arun-s-aot/formio-react.git aot
cd aot && git checkout main && cd ..

# Produce reports
git diff --stat  react aot            > 00-file-by-file-summary.txt   # one-liner per file
git diff --name-status react aot      > 01-adds-mods-deletes.txt      # A/M/D flags
git diff -U0        react aot         > 02-full-patch.diff            # full patch, no context
```

#### Formio-react diff results

[00-file-by-file-summary.txt](00-file-by-file-summary.txt)

[01-adds-mods-deletes.txt](01-adds-mods-deletes.txt)

[02-full-patch.diff](./02-full-patch.diff)

## Latest-Version Research

| Library             | Latest stable (May 2025)                                        | Release note entry you must read                     |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| **formio renderer** | **@formio/js 5.1.2** (namespace replaces _formiojs_) ([npm][1]) | “Renderer Library Update / 5 → 5.0.0” ([Form.io][2]) |
| **React wrapper**   | **@formio/react 6.0.1** ([npm][3])                              | CHANGELOG “v6.x” section ([GitHub][4])               |

[1]: https://www.npmjs.com/package/%40formio/js/v/5.1.2-rc.5?utm_source=chatgpt.com "formio/js - NPM"
[2]: https://form.io/release-notes/formio-enterprise-9-3-0/?utm_source=chatgpt.com "Formio-Enterprise 9.3.0 - Form.io"
[3]: https://www.npmjs.com/package/%40formio/react?utm_source=chatgpt.com "@formio/react - npm"
[4]: https://github.com/formio/react-formio/blob/master/Changelog.md?utm_source=chatgpt.com "react/Changelog.md at master · formio/react - GitHub"

Suggested reading list:

- Webinar recap “What’s New in Formio/js 5.0.0 – Breaking Changes” ([Form.io](https://form.io/webinars/whats-new-in-formio-js-5-0-0/?utm_source=chatgpt.com))
- Form.io Release Notes 9.3.0 (renderer 5.0.0) ([Form.io](https://form.io/release-notes/?utm_source=chatgpt.com))
- Enterprise Migration / Maintenance guide (namespace & API tweaks) ([Form.io Documentation](https://help.form.io/deployments/maintenance-and-migration?utm_source=chatgpt.com))

## Problems found when using @formio/react 6.0.1

- index.js doesn't export `Formio`. Added `Formio`: `export { Components, Formio, Utils, Templates } from '@formio/js';`
