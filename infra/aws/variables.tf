variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Resource name prefix."
  type        = string
  default     = "lumine"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "production"
}

variable "github_oidc_subject" {
  description = "Exact GitHub OIDC sub claim allowed to deploy. Check the repository token claim before production apply."
  type        = string
  default     = "repo:ghckss/lumine:environment:production"
}

variable "github_oidc_provider_arn" {
  description = "Existing GitHub OIDC provider ARN. Leave null to create one in this account."
  type        = string
  default     = null
  nullable    = true
}

variable "create_apprunner_service" {
  description = "Legacy migration switch. Keep enabled only until traffic has moved from App Runner to EKS."
  type        = bool
  default     = false
}

variable "eks_public_access_cidrs" {
  description = "CIDRs allowed to reach the public EKS API endpoint. Restrict this after GitHub-hosted deployment is replaced by a private runner."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "lumine"
}

variable "db_username" {
  description = "PostgreSQL master username. Password is generated and rotated by RDS."
  type        = string
  default     = "lumine_admin"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_deletion_protection" {
  description = "Protect the production database from accidental deletion."
  type        = bool
  default     = true
}

variable "jwt_secret_arn" {
  description = "Secrets Manager ARN containing a random JWT signing secret as a plain secret string."
  type        = string
}

variable "openai_api_key_secret_arn" {
  description = "Optional Secrets Manager ARN containing the OpenAI API key. Rule-based generation is used when omitted."
  type        = string
  default     = null
  nullable    = true
}

variable "google_client_ids" {
  description = "Comma-separated Google OAuth client IDs accepted by the server."
  type        = string
  default     = ""
}

variable "kakao_app_ids" {
  description = "Comma-separated numeric Kakao app IDs accepted by the server."
  type        = string
  default     = ""
}

variable "openai_model" {
  description = "OpenAI model used for generated messages when an API key is configured."
  type        = string
  default     = "gpt-5.2"
}
