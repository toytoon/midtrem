# Software Requirements Specification (SRS)
## Grade Guardian - Student Grade Management System

---

## Document Control

| Property | Value |
|----------|-------|
| **Document Title** | Software Requirements Specification |
| **Project Name** | Grade Guardian (نتيجة درجات الطلاب) |
| **Version** | 2.0 |
| **Date** | November 19, 2025 |
| **Document Owner** | Development Team |
| **Status** | Final |
| **Classification** | Internal |

---

## Executive Summary

Grade Guardian is a comprehensive web-based student grade management system designed for educational institutions. The system provides secure authentication, role-based access control, and intuitive interfaces for both students and administrators to manage academic information efficiently.

**Key Objectives:**
- Provide secure student grade access
- Enable efficient admin data management
- Support bulk data import/export
- Ensure data security and audit trails
- Deliver responsive, user-friendly interface

**Target Users:**
- Students: View personal grades
- Administrators: Manage all system data
- Institution Management: Monitor system usage

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Database Design](#database-design)
6. [Security Requirements](#security-requirements)
7. [Test Requirements](#test-requirements)
8. [Deployment Requirements](#deployment-requirements)
9. [Compliance & Standards](#compliance--standards)
10. [Appendix](#appendix)

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) document defines the complete functional and non-functional requirements for the Grade Guardian system. It serves as a contract between the development team, quality assurance team, and stakeholders.

## 1.2 Scope

The Grade Guardian system encompasses:

**In Scope:**
- Student authentication and grade viewing
- Admin authentication and comprehensive dashboard
- Full CRUD operations for students, courses, and grades
- Bulk data import via Excel files
- Real-time data management
- Responsive web interface for all devices
- Arabic language support (RTL)
- Security features (authentication, encryption, audit logging)

**Out of Scope:**
- Mobile native applications
- Email/SMS notifications
- Advanced analytics/reporting
- Integration with external systems (LDAP, Active Directory)
- Video conferencing features

## 1.3 Definitions and Acronyms

| Term | Definition |
|------|-----------|
| **SPA** | Single Page Application |
| **RLS** | Row Level Security |
| **CRUD** | Create, Read, Update, Delete |
| **UUID** | Universally Unique Identifier |
| **Bcrypt** | Cryptographic password hashing algorithm |
| **RTL** | Right-to-Left text direction |
| **JWT** | JSON Web Token |
| **API** | Application Programming Interface |

---

# 2. System Overview

## 2.1 System Architecture

### Frontend Stack
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** TanStack React Query 5.83.0
- **Routing:** React Router DOM 6.30.1
- **Forms:** React Hook Form 7.61.1 + Zod 3.25.76

### Backend Stack
- **Database:** Supabase (PostgreSQL 14+)
- **Authentication:** Custom (Bcrypt)
- **Security:** Row Level Security (RLS)
- **Real-time:** Supabase Subscriptions
- **API:** RESTful via Supabase

### Deployment Stack
- **Hosting:** Vercel
- **CDN:** Global (Vercel Edge Network)
- **Database Hosting:** Supabase Cloud
- **SSL/TLS:** Automatic via Vercel

## 2.2 System Components

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)          │
│                                          │
│  ┌────────────────┐  ┌──────────────┐  │
│  │ Student Module │  │ Admin Module │  │
│  │                │  │              │  │
│  │ • Login        │  │ • Dashboard  │  │
│  │ • View Grades  │  │ • CRUD Ops   │  │
│  │ • Logout       │  │ • Bulk Upload│  │
│  │ • Search       │  │ • Reports    │  │
│  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────┘
              ↓ HTTP/HTTPS ↓
┌─────────────────────────────────────────┐
│    Backend (Supabase PostgreSQL)         │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │    PostgreSQL Relational DB      │  │
│  │  • Students • Courses            │  │
│  │  • Grades   • Admins             │  │
│  │  • Audit Logs • Sessions         │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  Security & RLS Policies         │  │
│  │  • Row Level Security            │  │
│  │  • Password Verification         │  │
│  │  • Audit Logging                 │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 2.3 Key Features

### Student Features
- ✅ Login with student code
- ✅ View personal grades across all courses
- ✅ Search grades by course
- ✅ Responsive mobile interface
- ✅ Dark/Light theme support
- ✅ Arabic language interface

### Admin Features
- ✅ Secure admin login (Bcrypt hashed)
- ✅ Student management (Add, Edit, Delete, Search)
- ✅ Course management (Add, Edit, Delete)
- ✅ Grade management (Add, Edit, Delete, Search)
- ✅ Bulk data import from Excel
- ✅ Brute-force protection (5 attempts, 5-min lockout)
- ✅ Audit logging (all operations tracked)
- ✅ Session management (24-hour tokens)

---

# 3. Functional Requirements

## 3.1 Student Module

### FR-3.1.1 Student Login
**Description:** Student authentication via student code

**Requirements:**
- Student must have valid code in database
- No password required for students
- Display success message with student name
- Redirect to grades page on success
- Show error message on invalid code
- Case-insensitive student code lookup

**Error Handling:**
- Invalid code: " الكود الاكاديمي غير صحيح"
- Empty field: "الرجاء إدخال  الكود الاكاديمي"
- Database error: "حدث خطأ في النظام"

### FR-3.1.2 View Grades
**Description:** Display student's grades across all courses

**Display Information:**
- Course name
- Grade value (0-30 scale)
- Date added

**Features:**
- Search by course code/name
- Pagination (10 items per page)
- Loading skeleton during fetch
- Responsive table layout

**Sorting:**
- By course name (A-Z)
- By grade (ascending/descending)
- By date (newest first)

### FR-3.1.3 Logout
**Description:** Terminate student session

**Behavior:**
- Clear session storage
- Remove student data
- Redirect to home page
- Display confirmation message

---

## 3.2 Admin Module

### FR-3.2.1 Admin Authentication
**Description:** Secure admin login with password verification

**Credentials:**
- Admin Code: Unique identifier
- Password: Bcrypt hashed
- Session Token: 24-hour validity

**Security Features:**
- Bcrypt hashing (strength 4)
- Brute-force protection (5 attempts = 5-min lockout)
- Failed attempt counter
- Session timeout after 24 hours
- Audit log entry for each login

### FR-3.2.2 Student Management
**Operations:**

**Create Student:**
- Input validation (code, name, status)
- Unique constraint on student code
- Default status: Active
- Success/error toast notification

**Read Students:**
- Display all students in table format
- Show: Code, Name, Status, Created Date, Actions
- Pagination (10 items per page)
- Loading skeleton

**Update Student:**
- Edit name, status
- Validation on code (prevent changes)
- Cascading update to grades
- Audit log entry

**Delete Student:**
- Confirmation dialog
- Cascade delete related grades
- Audit log entry
- Success notification

**Search & Filter:**
- Search by code or name
- Real-time filtering
- Partial matching support

### FR-3.2.3 Course Management
**Operations:**

**Create Course:**
- Unique course name constraint
- Success notification
- Update course list immediately

**Read Courses:**
- Display all courses
- Show: Name, Created Date, Actions
- Pagination support

**Update Course:**
- Modify course name
- Enforce uniqueness
- Cascade update to grades

**Delete Course:**
- Cascade delete related grades
- Confirmation required
- Audit log entry

### FR-3.2.4 Grade Management
**Operations:**

**Create Grade:**
- Select student from dropdown
- Select course from dropdown
- Enter grade (0-30 validation)
- Unique constraint: one grade per student per course
- Success notification

**Read Grades:**
- Display all grades with student code, course, grade value
- Pagination (10 items per page)
- Loading indicators

**Update Grade:**
- Modify grade value only
- Validate 0-30 range
- Cascade update if student/course changes

**Delete Grade:**
- Confirmation required
- Update audit log
- Immediate removal from table

**Search:**
- Filter by student code
- Real-time results

### FR-3.2.5 Bulk Upload
**Supported Operations:**
- Bulk import students
- Bulk import courses
- Bulk import grades

**File Format:**
- Excel (.xlsx, .xls only)
- UTF-8 encoding
- Specific column headers required

**Data Validation:**
- Check required columns
- Validate data types
- Check constraints (unique codes, grade ranges)
- Show row-level errors

**Error Handling:**
- Skip invalid rows, continue with valid ones
- Show summary: Total/Added/Skipped
- Option to download error report
- Rollback on critical errors

**Performance:**
- Support 1000+ records
- Complete import < 10 seconds
- Progress indicator if possible

### FR-3.2.6 Session Management
**Requirements:**
- Session token: 64-character random string
- Validity: 24 hours from login
- Storage: SessionStorage (encrypted in production)
- Auto-logout on expiration
- Force logout on logout action

---

# 4. Non-Functional Requirements

## 4.1 Performance

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 1 second |
| Database Query Time | < 500ms |
| Search Response | < 300ms |
| Bulk Import (500 records) | < 10 seconds |
| First Contentful Paint | < 2 seconds |
| Largest Contentful Paint | < 3 seconds |

**Performance Optimization:**
- Database indexes on frequently queried columns
- Pagination (10 items per page)
- Code splitting with Vite
- Image optimization
- CSS/JS minification
- Caching strategies

## 4.2 Security

### Authentication
- Bcrypt password hashing (strength 4)
- Session token generation (cryptographically secure)
- Token expiration (24 hours)
- Brute-force protection (5 attempts, 5-minute lockout)

### Data Protection
- HTTPS/TLS encryption for all data in transit
- Row Level Security (RLS) policies
- Input sanitization (prevent XSS)
- SQL injection prevention (parameterized queries)
- CORS configuration

### Audit & Compliance
- Audit logging for all admin actions
- Immutable audit logs (no delete/update)
- Track: admin_code, operation, data changed, timestamp
- Failed login attempt logging

### Vulnerability Management
- Regular dependency updates
- Security scanning (npm audit)
- OWASP Top 10 compliance

## 4.3 Availability & Reliability

| Requirement | Target |
|------------|--------|
| System Uptime | 99.5% |
| Backup Frequency | Daily |
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 1 hour |
| Mean Time Between Failures (MTBF) | > 168 hours |

## 4.4 Usability

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios (4.5:1 for text)

### Internationalization
- Arabic language support (RTL)
- English support
- Proper text directionality
- Date/number formatting by locale

### User Experience
- Responsive design (mobile, tablet, desktop)
- Dark/Light mode support
- Loading states with skeleton loaders
- Clear error messages
- Toast notifications
- Confirmation dialogs for destructive actions

## 4.5 Compatibility

### Browsers
- Chrome 120+ (Desktop & Mobile)
- Firefox 121+ (Desktop & Mobile)
- Safari 17+ (Desktop & Mobile)
- Edge 120+ (Desktop)

### Screen Sizes
- Mobile: 320px - 480px (portrait & landscape)
- Tablet: 480px - 1024px
- Desktop: 1024px+

### Operating Systems
- Windows 10+
- macOS 10.15+
- iOS 14+
- Android 10+

---

# 5. Database Design

## 5.1 Database Schema

### Students Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Grades Table
```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, course_id)
);
```

### Admins Table
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_code TEXT UNIQUE NOT NULL,
  admin_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_code TEXT NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  changed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 5.2 Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| students | student_code | Fast lookups |
| students | status | Filter active students |
| courses | course_name | Unique constraint |
| admins | admin_code | Login lookup |
| grades | student_id | Query by student |
| grades | course_id | Query by course |
| audit_logs | admin_code | Admin action tracking |
| audit_logs | created_at | Chronological queries |

## 5.3 Row Level Security (RLS)

**Students Table:**
- SELECT: Allow all (app validates)
- INSERT: Allow all (app validates)
- UPDATE: Allow all (app validates)
- DELETE: Allow all (app validates)

**Courses Table:**
- SELECT: Allow all
- INSERT: Allow all (app validates)
- UPDATE: Allow all (app validates)
- DELETE: Allow all (app validates)

**Grades Table:**
- SELECT: Allow all
- INSERT: Allow all (app validates)
- UPDATE: Allow all (app validates)
- DELETE: Allow all (app validates)

**Admins Table:**
- SELECT: Allow all (needed for login)
- INSERT: Block (migrations only)
- UPDATE: Block (migrations only)
- DELETE: Block (migrations only)

**Audit Logs Table:**
- SELECT: Allow all
- INSERT: Allow all (app logs)
- UPDATE: Block (immutable)
- DELETE: Block (immutable)

---

# 6. Security Requirements

## 6.1 Authentication

**Student Authentication:**
- No password required
- Student code verification only
- Case-insensitive lookup
- Error message generic ("Invalid code" - no hint)

**Admin Authentication:**
- Admin code + password required
- Bcrypt hashing algorithm (strength 4)
- Case-sensitive lookup
- Brute-force protection active

## 6.2 Password Policy

**Hashing:**
- Algorithm: Bcrypt (strength/cost: 4)
- Never store plaintext passwords
- Verify using secure comparison

**Strength Requirements:**
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Enforced only for new admin passwords

## 6.3 Brute Force Protection

**Mechanism:**
- Track failed login attempts
- Lock after 5 consecutive failures
- Lockout duration: 5 minutes
- Auto-unlock after duration expires
- Reset counter on successful login

**User Notification:**
- Show attempt counter (e.g., "2/5 attempts")
- Display lockout message when locked
- Show countdown timer if possible

## 6.4 Session Management

**Token Generation:**
- Use cryptographically secure random generator
- Token length: 64 hexadecimal characters
- Generated on each login

**Token Storage:**
- SessionStorage (not localStorage)
- Never expose in URL
- Encrypted in production (if using cookies)

**Token Validation:**
- Verify expiration on each page load
- Auto-logout if expired
- Prompt user to re-login

**Token Expiration:**
- Standard validity: 24 hours
- Reset on each activity (sliding window, optional)

## 6.5 Audit Logging

**Logged Events:**
- Admin login (success/failure)
- All CRUD operations
- Failed authentication attempts
- Bulk uploads

**Log Information:**
- Timestamp (UTC)
- Admin code
- Operation type (INSERT/UPDATE/DELETE/SELECT)
- Table affected
- Changed data (before/after for updates)
- IP address (if available)

**Log Protection:**
- Immutable (no deletes/updates allowed)
- Automatic backup
- Retention: Minimum 1 year

## 6.6 Input Validation

**Student Code:**
- Alphanumeric + hyphens/underscores only
- Length: 3-20 characters
- Trimmed whitespace
- Case-insensitive

**Student Name:**
- No special characters (except spaces)
- Maximum 255 characters
- Required field

**Grade Value:**
- Integer only
- Range: 0-30
- Required field

**Course Name:**
- Alphanumeric + spaces only
- Length: 2-100 characters
- Unique (case-insensitive)

## 6.7 Data Sanitization

**XSS Prevention:**
- Remove HTML/script tags
- Escape special characters
- Use parameterized queries

**SQL Injection Prevention:**
- Use ORM (Supabase abstraction)
- Prepared statements
- Input parameterization

---

# 7. Test Requirements

## 7.1 Test Coverage

| Category | Test Cases | Target Coverage |
|----------|-----------|-----------------|
| Functional | 40+ | > 80% |
| Integration | 15+ | > 70% |
| Security | 10+ | 100% |
| Performance | 5+ | > 90% |
| UI/UX | 10+ | > 80% |
| **Total** | **80+** | **> 85%** |

## 7.2 Test Types

**Unit Tests:**
- Input validation functions
- Authentication logic
- Error handling

**Integration Tests:**
- Database operations
- API endpoints
- Search functionality

**E2E Tests:**
- Complete user workflows
- Login to logout scenarios
- Bulk import processes

**Performance Tests:**
- Page load time
- API response time
- Database queries

**Security Tests:**
- XSS attempts
- SQL injection attempts
- Brute force attacks
- Session timeouts

## 7.3 Acceptance Criteria

**Functional Acceptance:**
- ✅ All CRUD operations work correctly
- ✅ Search and pagination functional
- ✅ Bulk import succeeds with valid data
- ✅ Error messages display correctly

**Performance Acceptance:**
- ✅ Page loads < 3 seconds
- ✅ API responds < 1 second
- ✅ Bulk import completes < 10 seconds

**Security Acceptance:**
- ✅ Passwords hashed with Bcrypt
- ✅ Brute-force protection active
- ✅ Session tokens secure
- ✅ Audit logs immutable

**UI/UX Acceptance:**
- ✅ Responsive on all devices
- ✅ Arabic text displays correctly (RTL)
- ✅ Dark/light mode works
- ✅ Error messages clear

---

# 8. Deployment Requirements

## 8.1 Environment Setup

**Production Environment:**
```
Frontend Hosting: Vercel
Backend Database: Supabase (PostgreSQL)
SSL/TLS: Automatic (Let's Encrypt)
CDN: Vercel Edge Network
Monitoring: Vercel Analytics
```

**Environment Variables:**
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
NODE_ENV=production
```

## 8.2 Deployment Checklist

- [ ] All code committed and pushed
- [ ] Tests passing (> 85% coverage)
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Backups configured
- [ ] SSL certificate valid
- [ ] Error monitoring enabled
- [ ] Analytics configured
- [ ] Admin password changed
- [ ] CORS configured
- [ ] Rate limiting enabled

## 8.3 Build & Release

**Build Command:**
```bash
npm run build
```

**Build Output:**
- Directory: `dist/`
- Format: Minified, optimized
- Size: < 5MB

**Release Process:**
1. Tag release in Git
2. Push to main branch
3. Vercel auto-deploys
4. Run smoke tests
5. Monitor for errors

---

# 9. Compliance & Standards

## 9.1 Accessibility Standards
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- Color contrast ratios

## 9.2 Data Privacy
- GDPR compliance (if applicable)
- Data retention policies
- User data protection
- Privacy policy required

## 9.3 Code Standards
- TypeScript strict mode
- ESLint configuration
- Code formatting (Prettier)
- Git conventions

## 9.4 Documentation
- Code comments for complex logic
- README.md maintained
- API documentation
- Deployment guide
- Testing guide

---

# 10. Appendix

## A. Glossary

| Term | Definition |
|------|-----------|
| **Admin** | System administrator with full CRUD access |
| **Student** | End user who views grades |
| **Grade** | Numerical score (0-30) for a course |
| **Course** | Academic subject or module |
| **Audit Log** | Immutable record of system actions |
| **RLS** | Database-level access control |
| **Bcrypt** | Password hashing algorithm |
| **JWT** | Signed token for session management |

## B. References

- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Vite:** https://vitejs.dev
- **WCAG:** https://www.w3.org/WAI/WCAG21/quickref/
- **OWASP:** https://owasp.org/

## C. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 15, 2025 | Dev Team | Initial draft |
| 1.5 | Nov 17, 2025 | Dev Team | Added test requirements |
| 2.0 | Nov 19, 2025 | Dev Team | Final version |

## D. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | ________________ | ________ | ________ |
| QA Lead | ________________ | ________ | ________ |
| Product Owner | ________________ | ________ | ________ |
| Project Manager | ________________ | ________ | ________ |

---

**END OF DOCUMENT**

---

## 📄 How to Convert to PDF

**Option 1: Using VS Code**
1. Install extension: "Markdown PDF"
2. Right-click this file
3. Select "Markdown PDF: Export"
4. Choose output folder

**Option 2: Using Online Tools**
1. Copy file content
2. Go to: https://pandoc.org/try/
3. Paste and convert

**Option 3: Using Your Browser**
1. Open file in browser
2. Print (Ctrl+P)
3. Save as PDF

---

**Project Deployment URL:** https://your-project.vercel.app  
**Repository:** [Your GitHub URL]  
**Last Updated:** November 19, 2025

