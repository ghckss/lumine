#!/bin/zsh
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECR_SERVER_REPOSITORY:?ECR_SERVER_REPOSITORY is required}"
: "${EKS_CLUSTER_NAME:?EKS_CLUSTER_NAME is required}"
: "${K8S_NAMESPACE_SERVER:?K8S_NAMESPACE_SERVER is required}"
: "${API_HOST:?API_HOST is required}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
SERVER_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_SERVER_REPOSITORY}:${IMAGE_TAG}"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
docker build -t "$SERVER_IMAGE" "$ROOT_DIR/server"
docker push "$SERVER_IMAGE"
aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"
kubectl create namespace "$K8S_NAMESPACE_SERVER" --dry-run=client -o yaml | kubectl apply -f -
SERVER_IMAGE="$SERVER_IMAGE" API_HOST="$API_HOST" K8S_NAMESPACE_SERVER="$K8S_NAMESPACE_SERVER" envsubst < "$ROOT_DIR/k8s/server/deployment.yaml" | kubectl apply -f -
kubectl rollout status deployment/lumine-server -n "$K8S_NAMESPACE_SERVER"
