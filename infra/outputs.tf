output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "github_deploy_role_arn" {
  description = "Set as the AWS_ROLE_ARN repository variable in GitHub"
  value       = aws_iam_role.github_deploy.arn
}

output "service_url" {
  value = var.deploy_service ? "https://${aws_apprunner_service.app[0].service_url}" : null
}

output "service_arn" {
  description = "Set as the APPRUNNER_SERVICE_ARN repository variable in GitHub"
  value       = var.deploy_service ? aws_apprunner_service.app[0].arn : null
}
