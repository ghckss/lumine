output "ecr_repository_name" {
  value = aws_ecr_repository.server.name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.server.repository_url
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_deploy.arn
}

output "apprunner_service_arn" {
  value = try(aws_apprunner_service.server[0].arn, null)
}

output "api_base_url" {
  value = try("https://${aws_apprunner_service.server[0].service_url}", null)
}

output "rds_endpoint" {
  value     = aws_db_instance.postgres.endpoint
  sensitive = true
}
