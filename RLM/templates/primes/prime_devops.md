# Context Prime: DevOps & Deployment

## Purpose
Configure CI/CD pipelines, setup deployment infrastructure, and implement monitoring solutions.

## Essential Context Only
- Deployment requirements
- Infrastructure constraints
- Environment specifications
- Security requirements

## Run Step
1. **Analyze** deployment requirements and constraints
2. **Design** CI/CD pipeline stages
3. **Configure** build and test automation
4. **Setup** deployment scripts
5. **Implement** monitoring and logging
6. **Document** deployment procedures
7. **Test** pipeline execution

## Read Step
**Input Files:**
- `RLM/specs/architecture/deployment-architecture.md` (deployment design)
- `RLM/specs/constitution.md` (security and performance standards)
- Environment configs: `.env.example`

**Focus Areas:**
- Deployment strategy (blue/green, canary, rolling)
- Infrastructure requirements
- Security configurations
- Monitoring needs

## Report Step
**Output Files:**
- Pipeline config: `RLM/ci-cd/github-actions/*.yaml`
- Deployment scripts: `scripts/deploy-*.sh`
- Docker config: `Dockerfile`, `docker-compose.yaml`
- Kubernetes manifests: `RLM/ci-cd/kubernetes/*.yaml`
- Monitoring setup: monitoring config files

**Report Format:**
```markdown
# DevOps Setup: [Project Name]

## Pipeline Configuration
- Build stage: [details]
- Test stage: [details]
- Deploy stage: [details]

## Infrastructure
- Deployment strategy: [approach]
- Environments: [list]
- Resources: [specifications]

## Monitoring
- Metrics: [what's tracked]
- Alerts: [what triggers alerts]
- Dashboards: [what's visualized]

## Token Usage
- Total: X tokens
- Cost: $X.XX
```

## Context Isolation
This prime excludes:
- Application code details
- Test implementations
- Feature specifications
- Historical deployment logs

Focuses on:
- Pipeline configuration
- Infrastructure setup
- Deployment automation
- Operational excellence

## Token Budget
**Target:** 30,000-50,000 tokens
**Includes:** Deployment arch + security reqs + infrastructure specs
**Excludes:** Full codebase, full constitution, app logic

## DevOps Workflow
```
Read Requirements → Design Pipeline → Configure Stages →
Setup Infrastructure → Implement Monitoring →
Test Pipeline → Document Procedures
```

---
*Use this prime: `./RLM/commands/utils/context-manager.sh prime devops`*

