# ts-spc-analyzer

Zero-dependency TypeScript tool for process-capability checks on production measurements: Cp, Cpk, a 3-sigma out-of-control check, and a small HTTP API. Runs on Node 22.18+ (native TypeScript type stripping, no build step). Uses synthetic data.

## Run
```bash
npm test                      # 6 tests (node:test)
npm run analyze               # CLI on data/measurements.csv with LSL 9.5 / USL 10.5
npm run serve                 # POST http://localhost:3000/analyze
```
```bash
curl -X POST localhost:3000/analyze -H "content-type: application/json" \
  -d '{"values":[9.9,10.1,10.0,10.2,9.8],"lsl":9.5,"usl":10.5}'
```

## Example (CLI)
`n=60, mean=10.039, sd=0.139, Cp=1.20, Cpk=1.11, out-of-control: [40], verdict: marginal`

## Notes
- Cpk = min((USL - mean) / 3s, (mean - LSL) / 3s) using the sample standard deviation (overall, not within-subgroup).
- Verdict thresholds: Cpk >= 1.33 capable, >= 1.0 marginal, otherwise not capable.
- One-sided specs return Cpk and no Cp.
- Not covered: subgroup control charts (Xbar-R), non-normal data, Ppk.

## Deploy to AWS (Docker + Terraform + GitHub Actions)

```
GitHub push (main) -> Actions: npm test -> docker build -> push to ECR -> App Runner start-deployment
```
Infrastructure (`infra/`): ECR repository with a lifecycle policy, an App Runner service (0.25 vCPU / 512 MB, health check on `/health`), and an IAM role that GitHub Actions assumes through OIDC, restricted to this repository's `main` branch. No AWS keys are stored in GitHub.

**Status:** written and reviewed but not yet applied to a real AWS account.

### One-time setup
Prerequisites: AWS account, AWS CLI logged in, Terraform >= 1.6, Docker.
```bash
cd infra
terraform init
# 1) registry + CI role only (App Runner needs an image first)
terraform apply
# 2) push a first image
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-southeast-1.amazonaws.com
docker build -t <ecr_repository_url>:latest .. && docker push <ecr_repository_url>:latest
# 3) create the service
terraform apply -var deploy_service=true
```
Then, in the GitHub repo settings, add these **repository variables**: `AWS_ROLE_ARN` (output `github_deploy_role_arn`), `APPRUNNER_SERVICE_ARN` (output `service_arn`), and optionally `AWS_REGION`. Every push to `main` after that tests, builds and deploys.

If the account already has the GitHub OIDC provider, add `-var create_oidc_provider=false`.

### Cost and cleanup
App Runner and ECR bill continuously (roughly a few USD per month for one small instance; check current AWS pricing). Remove everything with `terraform destroy` (delete the images in ECR first if destroy complains).
