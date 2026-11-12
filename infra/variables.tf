variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "name" {
  type    = string
  default = "ts-spc-analyzer"
}

variable "github_repo" {
  description = "GitHub repository allowed to deploy, as owner/name"
  type        = string
  default     = "Anopprut/ts-spc-analyzer"
}

variable "create_oidc_provider" {
  description = "Set to false if the account already has the GitHub OIDC provider"
  type        = bool
  default     = true
}

variable "deploy_service" {
  description = "Create the App Runner service. Needs an image in ECR first (see README)"
  type        = bool
  default     = false
}

variable "image_tag" {
  type    = string
  default = "latest"
}
