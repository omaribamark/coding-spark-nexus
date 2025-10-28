# HAKIKISHA Backend Implementation Guide
## Scalable Node.js/PostgreSQL Architecture for 5 Million Users on AWS

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [AWS Infrastructure](#aws-infrastructure)
5. [Scalability Strategy](#scalability-strategy)

---

## Architecture Overview

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL (Amazon RDS)
- **Caching**: Redis (Amazon ElastiCache)
- **File Storage**: Amazon S3
- **Message Queue**: Amazon SQS
- **Authentication**: JWT tokens
- **Deployment**: AWS ECS/EKS with Auto Scaling

---

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    points INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active' -- active, suspended, deleted
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
```

### 2. User Roles Table
```sql
CREATE TYPE app_role AS ENUM ('user', 'fact_checker', 'admin');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

### 3. Claims Table
```sql
CREATE TYPE claim_status AS ENUM ('pending', 'ai_processing', 'human_review', 'verified', 'false', 'misleading', 'needs_context');
CREATE TYPE claim_category AS ENUM ('politics', 'health', 'economy', 'education', 'technology', 'environment');

CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category claim_category NOT NULL,
    status claim_status DEFAULT 'pending',
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_date TIMESTAMP DEFAULT NOW(),
    verdict_date TIMESTAMP,
    verdict TEXT,
    video_link VARCHAR(500),
    source_link VARCHAR(500),
    image_url VARCHAR(500),
    is_trending BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_category ON claims(category);
CREATE INDEX idx_claims_submitted_by ON claims(submitted_by);
CREATE INDEX idx_claims_trending ON claims(is_trending);
CREATE INDEX idx_claims_submitted_date ON claims(submitted_date DESC);
```

### 4. Claim Sources Table
```sql
CREATE TABLE claim_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    source_name VARCHAR(255),
    added_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claim_sources_claim_id ON claim_sources(claim_id);
```

### 5. Fact Checker Activity Table
```sql
CREATE TABLE fact_checker_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    fact_checker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verdict_status claim_status NOT NULL,
    verdict_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    time_spent_minutes INTEGER,
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_verdicts_claim_id ON fact_checker_verdicts(claim_id);
CREATE INDEX idx_verdicts_checker_id ON fact_checker_verdicts(fact_checker_id);
```

### 6. Blogs Table
```sql
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    read_time VARCHAR(50),
    image_url VARCHAR(500),
    published_date TIMESTAMP DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blogs_published_date ON blogs(published_date DESC);
CREATE INDEX idx_blogs_category ON blogs(category);
```

### 7. Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```javascript
// Request Body
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
```javascript
// Request Body
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/forgot-password
#### POST /api/auth/reset-password
#### GET /api/auth/me (Protected)

### User Profile Endpoints

#### GET /api/user/profile (Protected)
#### PUT /api/user/profile (Protected)
#### POST /api/user/profile-picture (Protected, Multipart)
#### POST /api/user/change-password (Protected)
#### DELETE /api/user/account (Protected)

### Claims Endpoints

#### POST /api/claims/submit (Protected)
#### GET /api/claims/my-claims (Protected)
#### GET /api/claims/:claimId
#### GET /api/claims/search?q=query
#### GET /api/claims/trending

### Fact Checker Endpoints (Protected - Fact Checker Role)

#### GET /api/fact-checker/pending-claims
#### POST /api/fact-checker/submit-verdict
#### GET /api/fact-checker/stats

### Admin Endpoints (Protected - Admin Role)

#### GET /api/admin/users
#### POST /api/admin/register-fact-checker
#### POST /api/admin/user-action (suspend/delete/activate)
#### GET /api/admin/dashboard-stats
#### GET /api/admin/fact-checker-activity

### Blog Endpoints

#### GET /api/blogs
#### GET /api/blogs/:blogId
#### POST /api/blogs/create (Protected - Fact Checker/Admin)

---

## AWS Infrastructure for 5 Million Users

### 1. Database Layer
```yaml
Primary Database:
  - Amazon RDS PostgreSQL (db.r6g.4xlarge)
  - Multi-AZ deployment for high availability
  - Automated backups with 7-day retention
  
Read Replicas:
  - 3-5 read replicas across different AZs
  - Route read traffic (80%) to replicas
  - Connection pooling with PgBouncer

Caching Layer:
  - Amazon ElastiCache for Redis (cache.r6g.xlarge)
  - 2-node cluster with replication
  - Cache frequently accessed data (user profiles, trending claims)
```

### 2. Application Layer
```yaml
Container Orchestration:
  - Amazon EKS (Kubernetes) or ECS
  - Auto Scaling Groups (10-100 pods/instances)
  - Target CPU utilization: 70%
  
Load Balancing:
  - Application Load Balancer (ALB)
  - Health checks every 30 seconds
  - Sticky sessions for user context

Instance Types:
  - t3.xlarge for API servers (4 vCPU, 16GB RAM)
  - Scale horizontally based on traffic
```

### 3. Storage Layer
```yaml
File Storage:
  - Amazon S3 for images/documents
  - CloudFront CDN for fast delivery
  - Lifecycle policies for cost optimization
  
Bucket Structure:
  - hakikisha-user-profiles/
  - hakikisha-claim-evidence/
  - hakikisha-blog-images/
```

### 4. Message Queue
```yaml
Amazon SQS:
  - Queue for async tasks (email, notifications)
  - Dead Letter Queue for failed messages
  - Lambda functions as workers
```

### 5. Monitoring & Logging
```yaml
CloudWatch:
  - Application metrics (response time, error rate)
  - Database metrics (CPU, connections, IOPS)
  - Custom alarms for critical issues

CloudWatch Logs:
  - Centralized application logs
  - 30-day retention
  - Log insights for debugging
```

---

## Scalability Strategy

### Database Scaling

**Vertical Scaling (Up to 1M users)**
- Increase RDS instance size (db.r6g.8xlarge)
- Add more IOPS for faster queries

**Horizontal Scaling (1M-5M users)**
- Implement database sharding by user_id
- Use Citus for distributed PostgreSQL
- Partition tables by date ranges

**Query Optimization**
```sql
-- Use materialized views for analytics
CREATE MATERIALIZED VIEW trending_claims_view AS
SELECT c.*, COUNT(v.id) as view_count
FROM claims c
LEFT JOIN claim_views v ON c.id = v.claim_id
WHERE c.submitted_date >= NOW() - INTERVAL '7 days'
GROUP BY c.id
ORDER BY view_count DESC;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY trending_claims_view;
```

### Application Scaling

**Stateless Design**
- Store sessions in Redis, not in-memory
- Use JWT tokens for authentication
- Enable horizontal pod/instance scaling

**Rate Limiting**
```javascript
// Implement per-user rate limits
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

### Caching Strategy
```javascript
// Cache frequently accessed data
const cacheKeys = {
  userProfile: (userId) => `user:${userId}:profile`,
  trendingClaims: () => 'claims:trending',
  claimDetails: (claimId) => `claim:${claimId}`,
};

// TTL values
const cacheTTL = {
  userProfile: 3600, // 1 hour
  trendingClaims: 300, // 5 minutes
  claimDetails: 1800, // 30 minutes
};
```

### Cost Optimization

**Estimated Monthly Costs (5M users)**
- RDS PostgreSQL (primary + replicas): $2,500
- ElastiCache Redis: $800
- EKS/ECS (20-30 instances): $3,000
- S3 + CloudFront: $500
- Data Transfer: $1,000
- **Total: ~$8,000/month**

---

## Implementation Checklist

- [ ] Set up AWS account and IAM roles
- [ ] Create VPC with public/private subnets
- [ ] Deploy RDS PostgreSQL instance
- [ ] Set up ElastiCache Redis cluster
- [ ] Create S3 buckets with proper policies
- [ ] Implement Node.js API server
- [ ] Set up JWT authentication
- [ ] Implement role-based access control
- [ ] Create database migrations
- [ ] Set up CloudWatch monitoring
- [ ] Configure Auto Scaling policies
- [ ] Implement rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Load testing with 100k+ concurrent users
- [ ] Security audit and penetration testing

---

## Security Best Practices

1. **Never store plain passwords** - Use bcrypt with salt rounds ≥ 12
2. **Validate all inputs** - Prevent SQL injection and XSS
3. **Use prepared statements** - Never concatenate SQL queries
4. **Implement HTTPS only** - SSL/TLS certificates via ACM
5. **Enable RLS on sensitive tables** - Row Level Security in PostgreSQL
6. **Regular security updates** - Patch OS and dependencies
7. **API rate limiting** - Prevent DDoS attacks
8. **Audit logging** - Track all sensitive operations

---

## Next Steps

1. Review and approve this architecture
2. Set up AWS infrastructure
3. Implement database schema
4. Build API endpoints incrementally
5. Load test with realistic traffic patterns
6. Deploy to production with monitoring

For questions or clarifications, refer to the detailed API documentation in BACKEND_API_DOCUMENTATION.md.
