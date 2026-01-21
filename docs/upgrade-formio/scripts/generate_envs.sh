#!/bin/bash

generate_env_with_local_ip() {
  local sample_env_path="$1"

  if [ ! -f "$sample_env_path" ]; then
    echo "❌ Error: File '$sample_env_path' does not exist."
    return 1
  fi

  local dir
  dir=$(dirname "$sample_env_path")
  local output_env_path="${dir}/.env"

  local local_ip
  #local_ip=$(hostname -I | awk '{print $1}')
  local_ip=localhost

  sed "s/{your-ip-address}/$local_ip/g" "$sample_env_path" > "$output_env_path"

  echo "✅ Created '$output_env_path' with IP: $local_ip"
}

generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-analytics/sample.env"
generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-forms/sample.env"
generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-api/sample.env"
generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-documents/sample.env"
generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-bpm/sample.env"
sed -i -E "s#http://keycloak#http://localhost#g" ./ff-local/forms-flow-ai/forms-flow-bpm/.env


generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-web/sample.env"
generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-web-root-config/sample.env"
generate_env_with_local_ip "./ff-local/forms-flow-ai/forms-flow-idm/keycloak/sample.env"




cd ff-local/forms-flow-ai/forms-flow-web-root-config/public/config
bash ../../env.sh 
