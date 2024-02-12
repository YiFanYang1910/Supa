#!/usr/bin/env bash

set -euo pipefail
action=$(buildkite-agent meta-data get action)
pipeline=$(buildkite-agent meta-data get pipeline)
agent="$BUILDKITE_AGENT_META_DATA_QUEUE"

cat <<EOF
steps:
EOF

cat <<EOF
    - label: ":terraform: Deploy to AWS Environments"
      agents:
        queue: "${agent}"
      command:
        - make "$action"-"$pipeline"
      plugins: 
        - docker-login#v2.0.1:
            server: docker-url
            username: docker username
            password-env: docker password
      allow_dependency_failure: true
EOF
