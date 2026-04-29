#!/bin/zsh
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECR_WEB_REPOSITORY:?ECR_WEB_REPOSITORY is required}"
: "${EKS_CLUSTER_NAME:?EKS_CLUSTER_NAME is required}"
: "${K8S_NAMESPACE_WEB:?K8S_NAMESPACE_WEB is required}"
: "${WEB_HOST:?WEB_HOST is required}"
: "${NEXT_PUBLIC_API_BASE_URL:?NEXT_PUBLIC_API_BASE_URL is required}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
WEB_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_WEB_REPOSITORY}:${IMAGE_TAG}"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
docker build -t "$WEB_IMAGE" "$ROOT_DIR/web"
docker push "$WEB_IMAGE"
aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"
kubectl create namespace "$K8S_NAMESPACE_WEB" --dry-run=client -o yaml | kubectl apply -f -
WEB_IMAGE="$WEB_IMAGE" WEB_HOST="$WEB_HOST" NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" K8S_NAMESPACE_WEB="$K8S_NAMESPACE_WEB" envsubst < "$ROOT_DIR/k8s/web/deployment.yaml" | kubectl apply -f -
kubectl rollout status deployment/lumine-web -n "$K8S_NAMESPACE_WEB"
