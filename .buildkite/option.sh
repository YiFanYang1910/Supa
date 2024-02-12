#!/usr/bin/env bash
set -euo pipefail

cat <<EOF
steps:
EOF

cat <<EOF
  - input: ":pick: action"
    fields:
      - select: "action"
        key: "action"
        required: true
        options:
          - label: ":aws: deploy aws service"
            value: "deploy"
          - label: ":aws: destroy current aws service"
            value: "destroy"
          - label: ":aws: refresh terraform state"
            value: "refresh"
  - input: ":pipeline: pipeline"
    fields:
      - select: "pipeline"
        key: "pipeline"
        required: true
        options:
          - label: ":pipeline: terraform state"
            value: "state"
          - label: ":robot_face: Uipath robot green"
            value: "robot-green"
          - label: ":blue_heart: Uipath robot blue"
            value: "robot-blue"
          - label: ":buildah: Uipath all Lambda Function"
            value: "lambda"
          - label: ":aws-logo: Uipath S3 Storage Bucket"
            value: "uipath"
          - label: ":chrome: Uipath chrome extension"
            value: "chrome-green"
          - label: ":browserstack: Uipath chrome extension for blue"
            value: "chrome-blue"
EOF
