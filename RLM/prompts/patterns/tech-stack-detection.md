# Tech Stack Detection Pattern

## Purpose

Automatically detect technologies, frameworks, and libraries from RLM project artifacts to enable automatic documentation lookup.

## When to Apply

Use this pattern when:
- Starting discovery phase with a new project idea
- Generating technical specifications from PRD
- Creating tasks that require library-specific implementation
- Implementing tasks that reference external APIs or libraries

---

## Detection Sources

### Primary Sources (Always Scan - HIGH Confidence)

| Source | Priority | What to Extract |
|--------|----------|-----------------|
| `package.json` | 1 | dependencies, devDependencies |
| `requirements.txt` | 1 | Python packages |
| `go.mod` | 1 | Go modules |
| `Cargo.toml` | 1 | Rust crates |
| `RLM/specs/constitution.md` | 2 | Technology Stack section |
| `RLM/specs/PRD.md` | 3 | Technology Stack Recommendation section |

### Secondary Sources (Scan When Available - MEDIUM Confidence)

| Source | What to Extract |
|--------|-----------------|
| `RLM/specs/features/*/spec.md` | Technical Design, API Endpoints |
| `RLM/tasks/active/*.md` | Technical Details, Dependencies |
| User's idea/description | Technology mentions in text |
| Import statements in code | `import`, `require`, `from` |

---

## Technology Categories

### Standard Web Stack

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **React** | `"react"`, `from 'react'`, `import React` | https://react.dev |
| **Next.js** | `"next"`, `next.config`, `app/` router | https://nextjs.org/docs |
| **Vue** | `"vue"`, `.vue` files, `createApp` | https://vuejs.org |
| **Angular** | `"@angular/core"`, `angular.json` | https://angular.io/docs |
| **Svelte** | `"svelte"`, `.svelte` files | https://svelte.dev/docs |
| **SvelteKit** | `"@sveltejs/kit"` | https://kit.svelte.dev/docs |
| **Remix** | `"@remix-run"` | https://remix.run/docs |
| **Astro** | `"astro"`, `astro.config` | https://docs.astro.build |

### Database & ORM

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Prisma** | `"prisma"`, `"@prisma/client"`, `schema.prisma` | https://www.prisma.io/docs |
| **Drizzle** | `"drizzle-orm"` | https://orm.drizzle.team |
| **TypeORM** | `"typeorm"` | https://typeorm.io |
| **Mongoose** | `"mongoose"` | https://mongoosejs.com/docs |
| **Sequelize** | `"sequelize"` | https://sequelize.org |
| **PostgreSQL** | `"pg"`, `postgres`, `PostgreSQL` in text | https://www.postgresql.org/docs |
| **MongoDB** | `"mongodb"`, `MongoDB` in text | https://www.mongodb.com/docs |
| **Redis** | `"redis"`, `"ioredis"` | https://redis.io/docs |

### Authentication

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Auth.js/NextAuth** | `"next-auth"`, `"@auth/core"` | https://authjs.dev |
| **Clerk** | `"@clerk/nextjs"`, `"@clerk/clerk-react"` | https://clerk.com/docs |
| **Auth0** | `"@auth0"`, `auth0` | https://auth0.com/docs |
| **Supabase Auth** | `supabase.auth`, `@supabase/auth-helpers` | https://supabase.com/docs/guides/auth |
| **Firebase Auth** | `"firebase/auth"` | https://firebase.google.com/docs/auth |
| **Passport.js** | `"passport"` | https://www.passportjs.org |
| **Lucia** | `"lucia"`, `"lucia-auth"` | https://lucia-auth.com |

### Payments

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Stripe** | `"stripe"`, `"@stripe/stripe-js"` | https://stripe.com/docs |
| **PayPal** | `"@paypal"`, `paypal` | https://developer.paypal.com/docs |
| **Square** | `"square"` | https://developer.squareup.com/docs |
| **Lemon Squeezy** | `"@lemonsqueezy"` | https://docs.lemonsqueezy.com |

### UI Libraries

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Tailwind CSS** | `"tailwindcss"`, `tailwind.config` | https://tailwindcss.com/docs |
| **shadcn/ui** | `components/ui/`, `@/components/ui` | https://ui.shadcn.com |
| **Material UI** | `"@mui/material"` | https://mui.com/material-ui |
| **Chakra UI** | `"@chakra-ui"` | https://chakra-ui.com/docs |
| **Radix UI** | `"@radix-ui"` | https://www.radix-ui.com/docs |
| **Ant Design** | `"antd"` | https://ant.design/docs |
| **Mantine** | `"@mantine/core"` | https://mantine.dev/docs |

### AI/ML Tools

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **OpenAI** | `"openai"`, `OpenAI`, `GPT`, `ChatGPT` | https://platform.openai.com/docs |
| **Anthropic Claude** | `"@anthropic-ai/sdk"`, `Claude`, `Anthropic` | https://docs.anthropic.com |
| **LangChain** | `"langchain"`, `"@langchain"` | https://js.langchain.com/docs |
| **LlamaIndex** | `"llamaindex"` | https://docs.llamaindex.ai |
| **Vercel AI SDK** | `"ai"`, `"@ai-sdk"` | https://sdk.vercel.ai/docs |
| **Hugging Face** | `"@huggingface"`, `transformers` | https://huggingface.co/docs |
| **Replicate** | `"replicate"` | https://replicate.com/docs |

### Vector Databases

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Pinecone** | `"@pinecone-database"` | https://docs.pinecone.io |
| **Weaviate** | `"weaviate-client"` | https://weaviate.io/developers/weaviate |
| **Chroma** | `"chromadb"` | https://docs.trychroma.com |
| **Milvus** | `"@zilliz/milvus2-sdk-node"` | https://milvus.io/docs |
| **Qdrant** | `"@qdrant/js-client-rest"` | https://qdrant.tech/documentation |

### Cloud Services

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Vercel** | `vercel.json`, `VERCEL_` env vars | https://vercel.com/docs |
| **Supabase** | `"@supabase/supabase-js"` | https://supabase.com/docs |
| **Firebase** | `"firebase"`, `firebase.json` | https://firebase.google.com/docs |
| **PlanetScale** | `DATABASE_URL` with `pscale`, planetscale | https://planetscale.com/docs |
| **Neon** | `DATABASE_URL` with `neon.tech` | https://neon.tech/docs |
| **Cloudflare** | `"wrangler"`, `wrangler.toml` | https://developers.cloudflare.com |
| **Railway** | `railway.json`, `RAILWAY_` env vars | https://docs.railway.app |
| **Render** | `render.yaml` | https://render.com/docs |

### AWS Services

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **AWS SDK** | `"@aws-sdk"`, `"aws-sdk"` | https://docs.aws.amazon.com/sdk-for-javascript |
| **S3** | `"@aws-sdk/client-s3"`, `S3Client` | https://docs.aws.amazon.com/s3 |
| **Lambda** | `"@aws-sdk/client-lambda"`, `serverless` | https://docs.aws.amazon.com/lambda |
| **DynamoDB** | `"@aws-sdk/client-dynamodb"` | https://docs.aws.amazon.com/dynamodb |
| **SES** | `"@aws-sdk/client-ses"` | https://docs.aws.amazon.com/ses |
| **SQS** | `"@aws-sdk/client-sqs"` | https://docs.aws.amazon.com/sqs |
| **SNS** | `"@aws-sdk/client-sns"` | https://docs.aws.amazon.com/sns |

### Testing

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Jest** | `"jest"`, `jest.config` | https://jestjs.io/docs |
| **Vitest** | `"vitest"`, `vitest.config` | https://vitest.dev |
| **Playwright** | `"@playwright/test"` | https://playwright.dev/docs |
| **Cypress** | `"cypress"`, `cypress.config` | https://docs.cypress.io |
| **Testing Library** | `"@testing-library"` | https://testing-library.com/docs |

### State Management

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **Zustand** | `"zustand"` | https://docs.pmnd.rs/zustand |
| **Redux** | `"@reduxjs/toolkit"`, `"redux"` | https://redux-toolkit.js.org |
| **Jotai** | `"jotai"` | https://jotai.org |
| **Recoil** | `"recoil"` | https://recoiljs.org |
| **TanStack Query** | `"@tanstack/react-query"` | https://tanstack.com/query |

### API & Data Fetching

| Technology | Detection Patterns | Official Docs URL |
|------------|-------------------|-------------------|
| **tRPC** | `"@trpc/server"`, `"@trpc/client"` | https://trpc.io/docs |
| **GraphQL** | `"graphql"`, `"@apollo/client"` | https://graphql.org/learn |
| **Axios** | `"axios"` | https://axios-http.com/docs |
| **SWR** | `"swr"` | https://swr.vercel.app |

---

## Detection Algorithm

### Step 1: Scan Primary Sources

```markdown
For each primary source file:
  1. If package.json exists:
     - Extract all keys from "dependencies"
     - Extract all keys from "devDependencies"
     - Match against technology patterns
     - Assign confidence: HIGH

  2. If constitution.md exists:
     - Find "Technology Stack" section
     - Extract mentioned technologies
     - Assign confidence: HIGH

  3. If PRD.md exists:
     - Find "Technology Stack Recommendation" section
     - Extract mentioned technologies
     - Assign confidence: MEDIUM
```

### Step 2: Scan Secondary Sources

```markdown
For each secondary source:
  1. Scan feature specs for:
     - API endpoint implementations
     - Library mentions in Technical Design
     - Assign confidence: MEDIUM

  2. Scan task files for:
     - Dependencies listed
     - Technical requirements
     - Assign confidence: MEDIUM

  3. Scan user input for:
     - Technology names in text
     - Framework mentions
     - Assign confidence: LOW
```

### Step 3: Deduplicate and Prioritize

```markdown
1. Group detected technologies by name
2. Keep highest confidence level for each
3. Sort by:
   - Confidence (HIGH > MEDIUM > LOW)
   - Category priority (Framework > Database > Auth > UI > Utilities)
4. Return top technologies for documentation lookup
```

---

## Output Format

```json
{
  "detected_at": "2026-01-11T10:00:00Z",
  "source_files_scanned": [
    "package.json",
    "RLM/specs/PRD.md",
    "RLM/specs/constitution.md"
  ],
  "technologies": [
    {
      "name": "Next.js",
      "version": "15.x",
      "confidence": "HIGH",
      "source": "package.json",
      "category": "framework",
      "doc_url": "https://nextjs.org/docs",
      "doc_priority": "critical",
      "topics_needed": ["app-router", "server-components", "api-routes"]
    },
    {
      "name": "Prisma",
      "version": "5.x",
      "confidence": "HIGH",
      "source": "package.json",
      "category": "database",
      "doc_url": "https://www.prisma.io/docs",
      "doc_priority": "high",
      "topics_needed": ["schema", "queries", "migrations"]
    },
    {
      "name": "Stripe",
      "version": null,
      "confidence": "MEDIUM",
      "source": "RLM/specs/PRD.md",
      "category": "payments",
      "doc_url": "https://stripe.com/docs",
      "doc_priority": "high",
      "topics_needed": ["checkout", "webhooks", "subscriptions"]
    }
  ],
  "summary": "Detected 3 technologies from 3 sources. Critical: Next.js. High priority: Prisma, Stripe."
}
```

---

## Integration with Documentation Lookup

After detection, hand off to Research Agent with:

```markdown
## Documentation Lookup Request

### Technologies Detected
[List from detection output]

### Priority Order
1. **Critical** - Core frameworks (Next.js, React, Vue)
2. **High** - Data layer (Prisma, databases), Auth, Payments
3. **Medium** - UI libraries, utilities
4. **Low** - Dev tools, testing (unless specifically needed)

### Topics to Fetch
For each technology, fetch documentation for:
- Getting started / setup
- Core concepts relevant to the project
- API reference for features mentioned in PRD/specs
- Error handling and best practices

### Cache Location
Save to: `RLM/research/docs/[technology-name]/`
Update index: `RLM/research/docs/index.json`
```

---

## Confidence Levels

| Level | Definition | Action |
|-------|------------|--------|
| **HIGH** | Found in package.json, go.mod, or constitution.md | Fetch docs automatically |
| **MEDIUM** | Mentioned in PRD, specs, or user input | Fetch docs automatically |
| **LOW** | Inferred from context or ambiguous mention | Ask user to confirm before fetching |

---

## Version Detection

When detecting versions:

1. **From package.json**: Use exact version or range
   - `"next": "^15.0.0"` → `15.x`
   - `"react": "~18.2.0"` → `18.2.x`

2. **From text**: Look for version mentions
   - "Next.js 15" → `15.x`
   - "React 19 Server Components" → `19.x`

3. **Default**: If no version found
   - Use "latest" for documentation lookup
   - Flag for user confirmation if critical

---

## Error Handling

### No Technologies Detected

```markdown
No technologies detected from project artifacts.

Please provide one of:
1. A package.json file in the project root
2. Technology preferences in your project description
3. Fetch documentation for [technology] via web search
```

### Ambiguous Detection

```markdown
Found ambiguous technology references:

- "auth" could be: NextAuth, Auth0, Clerk, or custom implementation
- "database" could be: PostgreSQL, MongoDB, or SQLite

Please clarify which technologies you're using, or I'll proceed with the most common choice for your stack.
```
