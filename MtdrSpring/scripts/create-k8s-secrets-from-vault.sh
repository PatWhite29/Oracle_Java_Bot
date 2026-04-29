#!/bin/bash
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-mtdrworkshop}"

read_secret() {
  local secret_ocid="$1"
  oci secrets secret-bundle get \
    --secret-id "$secret_ocid" \
    --query 'data."secret-bundle-content".content' \
    --raw-output | base64 --decode
}

if [ -z "${DB_PASSWORD_SECRET_OCID:-}" ]; then
  echo "DB_PASSWORD_SECRET_OCID is required"
  exit 1
fi

if [ -z "${TELEGRAM_BOT_TOKEN_SECRET_OCID:-}" ]; then
  echo "TELEGRAM_BOT_TOKEN_SECRET_OCID is required"
  exit 1
fi

kubectl create secret generic dbuser \
  --namespace "$NAMESPACE" \
  --from-literal=dbpassword="$(read_secret "$DB_PASSWORD_SECRET_OCID")" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic telegrambot \
  --namespace "$NAMESPACE" \
  --from-literal=token="$(read_secret "$TELEGRAM_BOT_TOKEN_SECRET_OCID")" \
  --dry-run=client -o yaml | kubectl apply -f -

if [ -n "${UI_PASSWORD_SECRET_OCID:-}" ]; then
  kubectl create secret generic frontendadmin \
    --namespace "$NAMESPACE" \
    --from-literal=password="$(read_secret "$UI_PASSWORD_SECRET_OCID")" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

if [ -n "${DEEPSEEK_API_KEY_SECRET_OCID:-}" ]; then
  kubectl create secret generic deepseek \
    --namespace "$NAMESPACE" \
    --from-literal=api-key="$(read_secret "$DEEPSEEK_API_KEY_SECRET_OCID")" \
    --dry-run=client -o yaml | kubectl apply -f -
fi
