#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECR_WEB_REPOSITORY:?ECR_WEB_REPOSITORY is required}"
: "${EKS_CLUSTER_NAME:?EKS_CLUSTER_NAME is required}"
: "${NEXT_PUBLIC_LUMINE_API_BASE_URL:?NEXT_PUBLIC_LUMINE_API_BASE_URL is required}"
: "${ACM_CERTIFICATE_ARN:?ACM_CERTIFICATE_ARN is required}"

IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
WEB_IMAGE="${REGISTRY}/${ECR_WEB_REPOSITORY}:${IMAGE_TAG}"

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker buildx build \
  --platform linux/amd64 \
  --build-arg "NEXT_PUBLIC_LUMINE_API_BASE_URL=$NEXT_PUBLIC_LUMINE_API_BASE_URL" \
  --file "$ROOT_DIR/client/apps/web/Dockerfile" \
  --tag "$WEB_IMAGE" \
  --push \
  "$ROOT_DIR/client"

aws eks update-kubeconfig --name "$EKS_CLUSTER_NAME" --region "$AWS_REGION"
kubectl -n lumine apply -f "$ROOT_DIR/infra/k8s/base/web.yaml"
kubectl -n lumine set image deployment/lumine-web web="$WEB_IMAGE"

ingress_file="$(mktemp)"
trap 'rm -f "$ingress_file"' EXIT
sed "s|REPLACE_ACM_CERTIFICATE_ARN|$ACM_CERTIFICATE_ARN|g" \
  "$ROOT_DIR/infra/k8s/overlays/production/ingress.yaml" > "$ingress_file"
kubectl apply -f "$ingress_file"
kubectl -n lumine rollout status deployment/lumine-web --timeout=10m

