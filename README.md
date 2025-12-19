# DevOps CI/CD Pipeline Demo

A complete end-to-end CI/CD pipeline demonstrating modern DevOps practices using GitHub Actions, Terraform, Docker, and AWS.


## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Pipeline Flow](#pipeline-flow)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project showcases a production-ready CI/CD pipeline for a simple Todo application. It demonstrates:

- **Continuous Integration**: Automated testing and code quality checks
- **Continuous Deployment**: Automated deployment to AWS EC2
- **Infrastructure as Code**: Reproducible infrastructure using Terraform
- **Containerization**: Docker for consistent environments
- **Monitoring**: Health checks and deployment verification

# Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Developer  │────▶|   GitHub    │────▶│   GitHub    │
│             │     │  Repository  │     │   Actions   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                    ┌────────────────────────────────────┐
                    │         CI Pipeline                │
                    │  ┌──────┐  ┌──────┐  ┌──────┐    │
                    │  │ Lint │─▶│ Test │─▶│Build │    │
                    │  └──────┘  └──────┘  └──────┘    │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │         CD Pipeline                │
                    │  ┌────────┐  ┌─────────────┐      │
                    │  │ Deploy │─▶│Health Check │      │
                    │  └────────┘  └─────────────┘      │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │         AWS EC2                    │
                    │  ┌───────┐         ┌──────────┐   │
                    │  │ Nginx │────────▶│ Node.js  │   │
                    │  │  :80  │         │  :3000   │   │
                    │  └───────┘         └──────────┘   │
                    └────────────────────────────────────┘
```

## Tech Stack

### Application
- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript (Single Page App)
- **Testing**: Jest + Supertest

### DevOps Tools
- **CI/CD**: GitHub Actions 
- **IaC**: Terraform (Infrastructure as Code)
- **Containerization**: Docker + Docker Hub
- **Cloud**: AWS EC2 t2.micro 
- **Web Server**: Nginx (Reverse Proxy)

### Why These Tools?

| Tool | Reason | Alternative |
|------|--------|-------------|
| **GitHub Actions** | Native GitHub integration, 2000 free minutes | Jenkins, GitLab CI |
| **Terraform** | Declarative IaC, cloud-agnostic, state management | CloudFormation, Ansible |
| **Docker** | Consistent environments, easy rollbacks | Traditional deployment |
| **AWS** | 12 months free, industry standard | Azure, GCP |
| **Nginx** | Lightweight, industry standard reverse proxy | Apache, Caddy |

##  Features

### Application Features
- ✅ Create, read, update, delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Real-time statistics (total, completed, pending)
- ✅ Responsive design
- ✅ Health check endpoint for monitoring

### DevOps Features
- ✅ Automated testing on every push
- ✅ Code quality checks (ESLint)
- ✅ Automated Docker image builds
- ✅ Zero-downtime deployments
- ✅ Automatic rollback on failure
- ✅ Health checks after deployment
- ✅ Infrastructure as Code (reproducible)

##  Prerequisites

1. **GitHub Account** 
2. **AWS Account** 
3. **Docker Hub Account** 
4. **Local Tools**:
   - Git
   - Terraform (≥ 1.0)
   - AWS CLI
   - SSH key pair

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/felixanxy/todo_app.git
cd todo-app
```

### 2. Set Up AWS Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the infrastructure plan
terraform plan

# Create the infrastructure
terraform apply
```

**Note the outputs**: You'll need the EC2 IP address for the next steps.

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and add:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DOCKERHUB_USERNAME` | Docker Hub username | From Docker Hub profile |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Docker Hub → Account Settings → Security |
| `EC2_HOST` | EC2 public IP address | From Terraform output |
| `EC2_SSH_KEY` | Private SSH key | Content of `~/.ssh/id_rsa` |

### 4. Push to GitHub (Triggers Pipeline)

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 5. Watch the Magic

Go to your GitHub repository → Actions tab and watch the pipeline run!

##  Project Structure

```
todo-app/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions pipeline
├── public/
│   └── index.html             # Frontend application
├── terraform/
│   ├── main.tf                # AWS infrastructure
│   ├── variables.tf           # Terraform variables
│   └── outputs.tf             # Terraform outputs
├── scripts/
│   └── deploy.sh              # Deployment script
├── server.js                  # Node.js application
├── server.test.js             # Unit tests
├── Dockerfile                 # Container definition
├── package.json               # Node.js dependencies
├── .eslintrc.json             # Code quality rules
└── README.md                  # This file
```

## 🔄 Pipeline Flow

### Stage 1: Continuous Integration (CI)

```
Code Push → Checkout → Install Dependencies → Lint → Test → Build
```

**What happens:**
1. Code is checked out from GitHub
2. Dependencies are installed
3. ESLint checks code quality
4. Jest runs unit tests
5. Docker image is built and pushed to Docker Hub

**Duration**: ~2-3 minutes

### Stage 2: Continuous Deployment (CD)

```
Build Success → SSH to EC2 → Pull Image → Deploy → Health Check
```

**What happens:**
1. SSH connection established to EC2
2. Latest Docker image pulled
3. Old container stopped (if exists)
4. New container started
5. Health check verifies deployment
6. Old images cleaned up

**Duration**: ~1-2 minutes

### Total Pipeline Time: ~4-5 minutes ⚡

##  Deployment

### Manual Deployment (Optional)

SSH into your EC2 instance:

```bash
ssh -i ~/.ssh/id_rsa ubuntu@YOUR_EC2_IP
```

Run the deployment script:

```bash
cd ~/app
./deploy.sh
```

### Rollback

If something goes wrong, the pipeline automatically rolls back to the previous version. You can also manually rollback:

```bash
ssh ubuntu@YOUR_EC2_IP
docker stop todo-app
docker start todo-app-backup
docker rename todo-app-backup todo-app
```

##  Monitoring

### Health Check

```bash
curl http://YOUR_EC2_IP/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-18T10:30:00.000Z"
}
```

### View Application Logs

```bash
ssh ubuntu@YOUR_EC2_IP
docker logs todo-app -f
```

### Check Container Status

```bash
docker ps
docker stats todo-app
```

## 🐛 Troubleshooting

### Issue: Pipeline fails at "Test & Lint" stage

**Solution**: Check the logs in GitHub Actions. Common causes:
- ESLint errors (run `npm run lint:fix` locally)
- Test failures (run `npm test` locally)

### Issue: Deployment fails health check

**Solution**:
```bash
# SSH to EC2 and check logs
ssh ubuntu@YOUR_EC2_IP
docker logs todo-app

# Check if port 3000 is accessible
curl localhost:3000/health
```

### Issue: Cannot access application via browser

**Solution**:
1. Check security group allows port 80 (HTTP)
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check Nginx configuration: `sudo nginx -t`

### Issue: Terraform apply fails

**Solution**:
- Ensure AWS credentials are configured: `aws configure`
- Check AWS free tier limits aren't exceeded
- Verify SSH key exists at `~/.ssh/id_rsa.pub`

##  Learning Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)

##  License

MIT License - Feel free to use this for learning and teaching!

##  Contributing

This is a teaching project! Feel free to:
- Fork and experiment
- Suggest improvements
- Report issues
- Share your deployment

---