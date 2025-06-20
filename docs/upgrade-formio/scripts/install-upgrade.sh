#!/bin/bash

CHECKPOINT_FILE="/tmp/forms_flow_install_checkpoints"
ACCEPT_ALL=false

if [[ "$1" == "--yes" ]]; then
  ACCEPT_ALL=true
fi


# Initialize checkpoint file
touch "$CHECKPOINT_FILE"

has_passed() {
  grep -q "$1" "$CHECKPOINT_FILE"
}

mark_passed() {
  echo "$1" >> "$CHECKPOINT_FILE"
}

prompt_or_skip() {
  local milestone="$1"
  if has_passed "$milestone"; then
    return 1  # skip this step silently (already marked)
  fi
  if $ACCEPT_ALL; then
    return 0
  fi

  echo -e "\nMilestone: $milestone"
  read -p "Do you want to execute this step? [Y/n] " ans
  case "$ans" in
    [Nn]*) return 1 ;;
    *) return 0 ;;
  esac
}

ALL_MILESTONES=(
  "1. Cloning forms-flow-ai repository"
  "2. Cloning forms-flow-ai dependencies for formio.js"
  "3. Cloning forms-flow-ai-react dependencies for formio-react"
  "4. Checking out formio.js version"
  "5. Creating tarball for formio.js"
  "6. Checking out formio-react version"
  "7. Creating tarball for formio-react"
  "8. Replacing formio.js and formio-react dependencies in forms-flow-web"
  "9. Installing and building forms-flow-web"
  "10. Installing and building forms-flow-web-root-config"
)

# Show which checkpoints are already passed
echo "Checking passed milestones from $CHECKPOINT_FILE..."
SKIPPED=0
for milestone in "${ALL_MILESTONES[@]}"; do
  if grep -Fxq "$milestone" "$CHECKPOINT_FILE"; then
    echo "✓ Already completed: $milestone"
    ((SKIPPED++))
  else
    break
  fi
done

if [[ $SKIPPED -gt 0 ]]; then
  echo -e "\n▶️ Skipping the first $SKIPPED milestone(s) that are already completed."
fi


echo "Starting installation of forms-flow-ai dependencies..."
echo -e "Creating local environment for forms-flow-ai...\n"

if prompt_or_skip "1. Cloning forms-flow-ai repository"; then
  mkdir -p ff-local && cd ff-local
  echo -e "\nCloning repositories..."
  git clone https://github.com/andrepestana-aot/forms-flow-ai forms-flow-ai
  cd ..
  mark_passed "1. Cloning forms-flow-ai repository"
fi

if prompt_or_skip "2. Cloning forms-flow-ai dependencies for formio.js"; then
  cd ff-local
  git clone https://github.com/arun-s-aot/formio.js aot-formiojs
  cd ..
  mark_passed "2. Cloning forms-flow-ai dependencies for formio.js"
fi

if prompt_or_skip "3. Cloning forms-flow-ai-react dependencies for formio-react"; then
  cd ff-local
  git clone https://github.com/arun-s-aot/formio-react aot-formio-react
  cd ..
  mark_passed "3. Cloning forms-flow-ai-react dependencies for formio-react"
fi

if prompt_or_skip "4. Checking out formio.js version"; then
  cd ff-local/aot-formiojs
  git remote add upstream https://github.com/formio/formio.js
  git fetch upstream --tags
  git rm --cached docs/class/src/formio.js~Formio.html
  git checkout -b formio_upgrade_from_v5.0.1 v5.0.1
  if [[ "$(git branch --show-current)" != "formio_upgrade_from_v5.0.1" ]]; then
    echo -e "\nError: Failed to checkout formio.js version v5.0.1"
    echo "Please check the repository and try again."
    cd ../..
    exit 1
  fi

  cd ../..
  mark_passed "4. Checking out formio.js version"
fi

if prompt_or_skip "5. Creating tarball for formio.js"; then
  echo -e "\nNPM installing and building formio.js..."
  cd ff-local/aot-formiojs

  sed -i 's/if (\(this\.root\)\.hasExtraPages && \(this\.page !== this\.root\.page\)) {/if (\1?.hasExtraPages && \2) {/' src/components/_classes/nested/NestedComponent.js


  npm install
  npm install typescript@5.4.5 --save-dev
  npm run build
  echo -e "\nCreating tarball for formio.js..."
  npm pack
  formio_tarball=$(ls formio*tgz)
  cd ../..
  mark_passed "5. Creating tarball for formio.js"
fi

if prompt_or_skip "6. Checking out formio-react version"; then
  cd ff-local/aot-formio-react
  git remote add upstream https://github.com/formio/react
  git fetch upstream --tags
  git checkout tags/v6.0.1 -b formio_react_upgrade_from_v6.0.1
  if [[ "$(git branch --show-current)" != "formio_react_upgrade_from_v6.0.1" ]]; then
    echo -e "\nError: Failed to checkout formio-react version v6.0.1"
    echo "Please check the repository and try again."
    cd ../..
    exit 1
  fi
  cd ../..
  mark_passed "6. Checking out formio-react version"
fi

if prompt_or_skip "7. Creating tarball for formio-react"; then
  echo -e "\nNPM installing and building formio-react..."
  cd ff-local/aot-formio-react

  # Update formio.js export in src/index.ts
  sed -i 's|export { Components, Utils, Templates } from '\''@formio/js'\'';|export { Components, Formio, Utils, Templates } from '\''@formio/js'\'';|' src/index.ts

  # Remove the call to formiojs.currentUser() in auth actions
  sed -i 's/\(formiojs\.currentUser(),\)/\/\/ \1/' src/modules/auth/actions.js
  # Comment out the handleStaleToken function in FormioContext.tsx that also calls formiojs.currentUser()
  sed -i '/const handleStaleToken = async () => {/,/};/s/^/\/\//' src/contexts/FormioContext.tsx
  sed -i 's/\(handleStaleToken()\;\)/\/\/ \1/' src/contexts/FormioContext.tsx
  
  npm install
  npm install --save-dev typescript
  npm install
  npm run build
  echo -e "\nCreating tarball for formio-react..."
  npm pack
  formio_react_tarball=$(ls formio-react*tgz)
  cd ../..
  mark_passed "7. Creating tarball for formio-react"
fi

if prompt_or_skip "8. Replacing formio.js and formio-react dependencies in forms-flow-web"; then
  cd ff-local/forms-flow-ai/forms-flow-web
  echo -e "\nReplacing formio.js and formio-react dependencies in forms-flow-web..."

  find . -type f \( -name "*.ts" -o -name "*.js" \) -print0 | xargs -0 sed -i 's/\"@aot-technologies\/formiojs\"/\"@aot-technologies\/formiojs-updated\"/g'
  find . -type f \( -name "*.ts" -o -name "*.js" \) -print0 | xargs -0 sed -i 's/\"@aot-technologies\/formio-react\"/\"@aot-technologies\/formio-react-updated\"/g'

  sed -i -E "s#\"@aot-technologies/formiojs\": \".*\"#\"@aot-technologies/formiojs-updated\": \"file:../../aot-formiojs/${formio_tarball}\"#g" package.json
  sed -i -E "s#\"@aot-technologies/formio-react\": \".*\"#\"@aot-technologies/formio-react-updated\": \"file:../../aot-formio-react/${formio_react_tarball}\"#g" package.json
  
  # It's important to reinstall dependencies after modifying package.json
  npm install 
  cd ../../..
  mark_passed "8. Replacing formio.js and formio-react dependencies in forms-flow-web"
fi


if prompt_or_skip "9. Installing and building forms-flow-web"; then
  echo -e "\nInstalling and building forms-flow-web..."
  cd ff-local/forms-flow-ai/forms-flow-web
  cp ../../../.env .
  npm install
  npm run build
  cd ../../..
  mark_passed "9. Installing and building forms-flow-web"
fi


if prompt_or_skip "10. Installing and building forms-flow-web-root-config"; then
  echo -e "\nInstalling and building forms-flow-web-root-config..."
  cd ff-local/forms-flow-ai/forms-flow-web-root-config

  cat <<EOF > public/config/config.js
  window._env_ = {
    NODE_ENV: "production",
    REACT_APP_API_SERVER_URL: "http://localhost:3001",
    REACT_APP_API_PROJECT_URL: "http://localhost:3001",
    REACT_APP_KEYCLOAK_CLIENT: "forms-flow-web",
    REACT_APP_KEYCLOAK_URL_REALM: "forms-flow-ai",
    REACT_APP_KEYCLOAK_URL: "http://localhost:8080",
    REACT_APP_LANGUAGE: "en",
    REACT_APP_KEYCLOAK_URL_HTTP_RELATIVE_PATH: "/auth",
    REACT_APP_WEB_BASE_URL: "http://localhost:5000",
    REACT_APP_BPM_URL: "http://localhost:8000/camunda",
    REACT_APP_WEBSOCKET_ENCRYPT_KEY: "giert989jkwrgb@DR55",
    REACT_APP_APPLICATION_NAME: "formsflow.ai",
    REACT_APP_WEB_BASE_CUSTOM_URL: "",
    REACT_APP_CUSTOM_SUBMISSION_URL: "",
    REACT_APP_CUSTOM_SUBMISSION_ENABLED: "false",
    REACT_APP_ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK: "false",
    REACT_APP_MULTI_TENANCY_ENABLED: "false",
    REACT_APP_DRAFT_ENABLED: "false",
    REACT_APP_DRAFT_POLLING_RATE: "15000",
    REACT_APP_EXPORT_PDF_ENABLED: "false",
    REACT_APP_PUBLIC_WORKFLOW_ENABLED: "false",
    REACT_APP_DOCUMENT_SERVICE_URL: "http://localhost:5006",
    REACT_APP_CUSTOM_THEME_URL: "",
    REACT_APP_CUSTOM_RESOURCE_BUNDLE_URL: "",
    REACT_APP_MT_ADMIN_BASE_URL: "",
    REACT_APP_KEYCLOAK_ENABLE_CLIENT_AUTH: "false",
    REACT_APP_ENABLE_FORMS_MODULE: "true",
    REACT_APP_ENABLE_TASKS_MODULE: "true",
    REACT_APP_ENABLE_DASHBOARDS_MODULE: "true",
    REACT_APP_ENABLE_PROCESSES_MODULE: "true",
    REACT_APP_ENABLE_APPLICATIONS_MODULE: "true",
    REACT_APP_DATE_FORMAT: "DD-MM-YY",
    REACT_APP_TIME_FORMAT: "hh:mm:ss A",
    REACT_APP_USER_NAME_DISPLAY_CLAIM: ""
};
EOF

  npm install
  npm run build
  cd ../../..
  mark_passed "10. Installing and building forms-flow-web-root-config"
fi


echo -e "\nAll done!"
