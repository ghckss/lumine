output "ecr_repository_name" {
  value = aws_ecr_repository.server.name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.server.repository_url
}

output "web_ecr_repository_name" {
  value = aws_ecr_repository.web.name
}

output "web_ecr_repository_url" {
  value = aws_ecr_repository.web.repository_url
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

output "eks_cluster_name" {
  value = aws_eks_cluster.main.name
}

output "database_secret_arn" {
  value     = aws_db_instance.postgres.master_user_secret[0].secret_arn
  sensitive = true
}

output "database_jdbc_url" {
  value     = "jdbc:postgresql://${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${var.db_name}?sslmode=require"
  sensitive = true
}

output "rds_endpoint" {
  value     = aws_db_instance.postgres.endpoint
  sensitive = true
}
