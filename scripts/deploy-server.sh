#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECR_SERVER_REPOSITORY:?ECR_SERVER_REPOSITORY is required}"
: "${EKS_CLUSTER_NAME:?EKS_CLUSTER_NAME is required}"

IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
SERVER_IMAGE="${REGISTRY}/${ECR_SERVER_REPOSITORY}:${IMAGE_TAG}"

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker buildx build --platform linux/amd64 --tag "$SERVER_IMAGE" --push "$ROOT_DIR/server"
aws eks update-kubeconfig --name "$EKS_CLUSTER_NAME" --region "$AWS_REGION"
kubectl -n lumine apply -f "$ROOT_DIR/infra/k8s/base/server.yaml"
kubectl -n lumine set image deployment/lumine-server server="$SERVER_IMAGE"
kubectl -n lumine rollout status deployment/lumine-server --timeout=10m
