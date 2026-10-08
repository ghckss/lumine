#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECR_SERVER_REPOSITORY:?ECR_SERVER_REPOSITORY is required}"
: "${APP_RUNNER_SERVICE_ARN:?APP_RUNNER_SERVICE_ARN is required}"

IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
SERVER_IMAGE="${REGISTRY}/${ECR_SERVER_REPOSITORY}"

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker buildx build \
  --platform linux/amd64 \
  --tag "${SERVER_IMAGE}:${IMAGE_TAG}" \
  --tag "${SERVER_IMAGE}:latest" \
  --push \
  "$ROOT_DIR/server"

operation_id="$(aws apprunner start-deployment \
  --region "$AWS_REGION" \
  --service-arn "$APP_RUNNER_SERVICE_ARN" \
  --query OperationId \
  --output text)"

for _ in $(seq 1 40); do
  status="$(aws apprunner list-operations \
    --region "$AWS_REGION" \
    --service-arn "$APP_RUNNER_SERVICE_ARN" \
    --query "OperationSummaryList[?Id=='${operation_id}'].Status | [0]" \
    --output text)"
  echo "App Runner deployment status: $status"
  case "$status" in
    SUCCEEDED) exit 0 ;;
    FAILED|ROLLBACK_SUCCEEDED|ROLLBACK_FAILED) exit 1 ;;
  esac
  sleep 15
done

echo "Timed out waiting for App Runner deployment."
exit 1
