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
        - make deploy-sonarqube
        - make "$action"-"$pipeline"
      plugins: 
        - docker-login#v2.0.1:
            server: df-integrations-docker.artifacts.tabdigital.com.au
            username: sa_ci_cd_artifactory
            password-env: ARTIFACTORY_PASSWORD
      allow_dependency_failure: true
EOF
