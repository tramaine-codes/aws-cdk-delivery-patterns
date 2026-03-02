# Architecture Diagrams

## Stack Dependencies

```mermaid
graph TD
    A[LoggingStack<br/>Shared] --> C[DeliveryPipelineStack]
    B[RepositoryStack] --> C
    C --> D[ApplicationStage: Dev]
    D --> E[LoggingStack<br/>Stage-Local]
    D --> F[ApplicationStack]
    E --> F
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#f0e1ff
    style E fill:#e1f5ff
    style F fill:#e1ffe1
```

## Pipeline Flow

```mermaid
graph LR
    A[CodeCommit<br/>Push to main] --> B[Source Stage]
    B --> C[Build/Synth Stage<br/>npm ci<br/>npm run build<br/>npx cdk synth]
    C --> D{Pipeline<br/>Changed?}
    D -->|Yes| E[UpdatePipeline<br/>Self-Mutation]
    D -->|No| F[Deploy: Dev Stage]
    E --> G[Restart Pipeline]
    G --> F
    F --> H[LoggingStack]
    F --> I[ApplicationStack]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#fff4e1
    style D fill:#ffe1e1
    style E fill:#fff4e1
    style F fill:#f0e1ff
    style G fill:#ffe1e1
    style H fill:#e1ffe1
    style I fill:#e1ffe1
```

## Logging Architecture

```mermaid
graph TD
    subgraph "Pipeline Level"
        A[Pipeline Artifacts Bucket<br/>KMS Encrypted] -.->|access logs| B[Shared Server Access<br/>Logs Bucket<br/>S3 Managed]
    end
    
    subgraph "Dev Stage"
        C[Application Bucket<br/>Versioned<br/>S3 Managed] -.->|access logs| D[Stage-Local Server<br/>Access Logs Bucket<br/>S3 Managed]
    end
    
    subgraph "Prod Stage (Future)"
        E[Application Bucket<br/>Versioned<br/>S3 Managed] -.->|access logs| F[Stage-Local Server<br/>Access Logs Bucket<br/>S3 Managed]
    end
    
    style A fill:#fff4e1
    style B fill:#e1f5ff
    style C fill:#e1ffe1
    style D fill:#e1f5ff
    style E fill:#e1ffe1
    style F fill:#e1f5ff
```

## Resource Encryption

```mermaid
graph TD
    A[ArtifactsKey<br/>KMS Customer-Managed<br/>Rotation: Enabled] --> B[Pipeline Artifacts Bucket]
    C[S3-Managed Encryption<br/>AES256] --> D[Shared Server Access<br/>Logs Bucket]
    C --> E[Stage-Local Server<br/>Access Logs Bucket]
    C --> F[Application Bucket]
    
    style A fill:#ffe1e1
    style B fill:#fff4e1
    style C fill:#e1f5ff
    style D fill:#e1ffe1
    style E fill:#e1ffe1
    style F fill:#e1ffe1
```

## Deployment Sequence

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git (Local)
    participant CC as CodeCommit
    participant CP as CodePipeline
    participant CB as CodeBuild
    participant CFN as CloudFormation
    
    Dev->>Git: git commit -m "feat: add feature"
    Dev->>Git: git push codecommit main
    Git->>CC: Push to main branch
    CC->>CP: Trigger pipeline
    CP->>CB: Start Synth stage
    CB->>CB: npm ci
    CB->>CB: npm run build
    CB->>CB: npx cdk synth
    CB->>CP: Return CloudFormation templates
    
    alt Pipeline code changed
        CP->>CB: Start UpdatePipeline stage
        CB->>CFN: Update pipeline stack
        CFN->>CP: Pipeline updated
        CP->>CP: Restart pipeline
    end
    
    CP->>CB: Start Deploy Dev stage
    CB->>CFN: Deploy LoggingStack
    CFN->>CB: Stack deployed
    CB->>CFN: Deploy ApplicationStack
    CFN->>CB: Stack deployed
    CP->>Dev: Pipeline succeeded
```

## Security Controls Flow

```mermaid
graph TD
    A[Developer writes CDK code] --> B[Run: npx cdk synth]
    B --> C[cdk-nag AwsSolutionsChecks]
    C --> D{Violations<br/>found?}
    D -->|Yes| E{Can be<br/>fixed?}
    D -->|No| F[Synthesis succeeds]
    E -->|Yes| G[Fix in code]
    E -->|No| H[Add NagSuppression<br/>with reason]
    G --> B
    H --> B
    F --> I[Deploy to AWS]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1e1
    style D fill:#ffe1e1
    style E fill:#ffe1e1
    style F fill:#e1ffe1
    style G fill:#fff4e1
    style H fill:#fff4e1
    style I fill:#e1ffe1
```

## CDK App Structure

```mermaid
graph TD
    A[bin/aws-cdk-delivery-patterns.ts<br/>CDK App Entry Point] --> B[LoggingStack]
    A --> C[RepositoryStack]
    A --> D[DeliveryPipelineStack]
    
    D --> E[ArtifactsKey]
    D --> F[ArtifactsBucket]
    D --> G[CodePipeline]
    
    G --> H[ApplicationStage: Dev]
    
    H --> I[LoggingStack<br/>Stage-Local]
    H --> J[ApplicationStack]
    
    B -.->|serverAccessLogsBucket| F
    C -.->|repository| G
    I -.->|serverAccessLogsBucket| J
    
    style A fill:#ffe1e1
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#fff4e1
    style E fill:#fff4e1
    style F fill:#fff4e1
    style G fill:#fff4e1
    style H fill:#f0e1ff
    style I fill:#e1ffe1
    style J fill:#e1ffe1
```

## Git Workflow

```mermaid
gitGraph
    commit id: "Initial commit"
    commit id: "feat: add LoggingStack"
    commit id: "feat: add RepositoryStack"
    commit id: "feat: add DeliveryPipelineStack"
    branch codecommit
    checkout codecommit
    commit id: "Push to CodeCommit"
    commit id: "Pipeline triggered" type: HIGHLIGHT
    commit id: "Dev stage deployed" type: HIGHLIGHT
    checkout main
    merge codecommit
    commit id: "feat: add new feature"
    checkout codecommit
    commit id: "Push update"
    commit id: "Pipeline auto-deploys" type: HIGHLIGHT
```

## AWS Resource Map

```mermaid
graph TB
    subgraph "us-east-1"
        subgraph "Pipeline Resources"
            CC[CodeCommit Repository<br/>aws-cdk-delivery-patterns]
            CP[CodePipeline<br/>AwsCdkDeliveryPatternsPipeline]
            CB1[CodeBuild: Synth]
            CB2[CodeBuild: SelfMutation]
            AB[S3: Artifacts Bucket<br/>KMS Encrypted]
            AK[KMS: Artifacts Key<br/>Rotation Enabled]
            SL1[S3: Server Access Logs<br/>Shared]
        end
        
        subgraph "Dev Stage"
            SL2[S3: Server Access Logs<br/>Stage-Local]
            APP[S3: Application Bucket<br/>Versioned]
        end
    end
    
    CC --> CP
    CP --> CB1
    CP --> CB2
    CP --> AB
    AK --> AB
    AB -.->|logs| SL1
    APP -.->|logs| SL2
    
    style CC fill:#e1f5ff
    style CP fill:#fff4e1
    style CB1 fill:#fff4e1
    style CB2 fill:#fff4e1
    style AB fill:#fff4e1
    style AK fill:#ffe1e1
    style SL1 fill:#e1ffe1
    style SL2 fill:#e1ffe1
    style APP fill:#e1ffe1
```

## Legend

- 🔵 Blue: Logging/Infrastructure
- 🟡 Yellow: Pipeline/Build
- 🟣 Purple: Stage/Grouping
- 🟢 Green: Application Resources
- 🔴 Red: Security/Keys/Decisions
