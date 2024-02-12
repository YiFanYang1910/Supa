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
  - input: ":pipeline: pipeline"
    fields:
      - select: "pipeline"
        key: "pipeline"
        required: true
        options:
          - label: ":pipeline: all stack"
            value: "all"
          - label: ":robot_face: EcrStack"
            value: "EcrStack"
          - label: ":blue_heart: CloudWatchStack"
            value: "CloudWatchStack"
          - label: ":buildah: AutoScalingFargateService"
            value: "AutoScalingFargateService"
          - label: ":aws-logo: FrontendStack"
            value: "FrontendStack"
EOF
