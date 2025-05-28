# EquityMD Platform Testing Plan

## Overview
This comprehensive testing plan covers all critical user flows and features of the EquityMD platform from both syndicator and investor perspectives. The plan is organized by user type and includes functional, UI/UX, and integration testing scenarios.

## Test Environment Setup
- **URL**: `http://localhost:5173` (Development)
- **Test Accounts**: Use the pre-created test accounts or create new ones during testing
- **Email Testing**: Monitor email notifications via Resend dashboard
- **Database**: Supabase with test data populated

---

## 🔐 Authentication & User Management Testing

### 1. User Registration Flow

#### **Investor Registration**
- [ ] **Email/Password Signup**
  - Navigate to `/signup/start`
  - Select "Investor" option
  - Complete email → password → name → accreditation flow
  - Verify email notifications are sent (admin + welcome emails)
  - Confirm profile creation in database
  - Test redirect to dashboard after completion

- [ ] **Social Signup (Google/OAuth)**
  - Use social login button
  - Verify automatic profile creation as investor
  - Verify redirect to dashboard
  - Test that users can change account type later in profile

#### **Syndicator Registration**
- [ ] **Email/Password Signup**
  - Navigate to `/signup/start`
  - Select "Syndicator" option
  - Complete full signup flow
  - Verify syndicator profile creation
  - Test company information fields

- [ ] **Social Signup**
  - Complete social signup (will default to investor)
  - Navigate to profile to change account type to syndicator
  - Verify syndicator profile setup

### 2. Authentication Edge Cases
- [ ] **Existing User Login**
  - Test login with existing credentials
  - Verify proper dashboard redirect based on user type
  - Test "Remember Me" functionality

- [ ] **Password Reset**
  - Test forgot password flow
  - Verify email delivery and reset process

- [ ] **Email Verification**
  - Test email confirmation process for new accounts
  - Verify account activation

## Social Authentication Testing

### Google OAuth
- Click "Continue with Google" button
- Complete Google authentication
- Verify automatic profile creation as investor
- Verify redirect to dashboard

### Facebook OAuth  
- Click "Continue with Facebook" button
- Complete Facebook authentication
- Verify automatic profile creation as investor
- Verify redirect to dashboard

### LinkedIn OAuth
- Click "Continue with LinkedIn" button  
- Complete LinkedIn authentication
- Verify automatic profile creation as investor
- Verify redirect to dashboard

---

## 👥 Investor User Journey Testing

### 3. Investor Dashboard & Profile

#### **Profile Management**
- [ ] **Profile Setup**
  - Navigate to `/profile`
  - Complete investor profile form:
    - Personal information (name, phone, avatar)
    - Accredited investor status with tooltip
    - Investment preferences (minimum, property types, locations)
    - Risk tolerance and investment goals
  - Test image upload functionality
  - Verify SMS opt-in component

- [ ] **Profile Updates**
  - Test editing existing profile information
  - Verify data persistence
  - Test validation errors

#### **Dashboard Functionality**
- [ ] **Dashboard Overview**
  - Navigate to `/dashboard`
  - Verify investor-specific dashboard layout
  - Test referral system functionality
  - Check investment tracking features

### 4. Deal Discovery & Browsing

#### **Browse Deals Page**
- [ ] **Deal Browsing** (`/browse`)
  - Test search functionality (by title, location)
  - Filter by property type (Multi-Family, Office, Medical, etc.)
  - Filter by status (Active, Closed)
  - Sort by (Recent, Highest Return, Lowest Minimum)
  - Test grid vs list view toggle
  - Verify pagination if applicable

- [ ] **Authentication Gating**
  - Test browsing as unauthenticated user
  - Verify "Sign in to view details" prompts
  - Test authentication modal trigger

#### **Deal Details Page**
- [ ] **Deal Information** (`/deals/[slug]`)
  - Navigate to individual deal pages
  - Verify all deal information displays correctly:
    - Property details and metrics
    - Investment highlights
    - Syndicator information
    - Media gallery (if available)
    - Video embeds (for Sutera Properties)
  - Test funding progress display

- [ ] **Investment Actions**
  - Test "Invest Now" button functionality
  - Test "Contact Syndicator" button
  - Verify investment interest modal
  - Test message sending to syndicator
  - Verify deal interest recording in database

### 5. Syndicator Discovery

#### **Directory Page**
- [ ] **Syndicator Directory** (`/directory`)
  - Browse syndicator listings
  - Test search and filter functionality
  - Verify syndicator profile previews
  - Test sorting options

#### **Syndicator Profile Pages**
- [ ] **Profile Viewing** (`/syndicators/[slug]`)
  - Navigate to syndicator profile pages
  - Verify company information display
  - Check active deals section
  - Test track record and statistics
  - Verify leadership section

- [ ] **Contact Actions**
  - Test "Contact Syndicator" button
  - Verify message modal functionality
  - Test connection creation process

### 6. Communication & Messaging

#### **Inbox Functionality**
- [ ] **Message Center** (`/inbox`)
  - Navigate to inbox page
  - Verify conversation list display
  - Test conversation selection
  - Check message thread functionality
  - Test real-time message updates

- [ ] **Messaging Features**
  - Send messages to syndicators
  - Verify message delivery
  - Test message history
  - Check unread message indicators
  - Test mobile responsive design

---

## 🏢 Syndicator User Journey Testing

### 7. Syndicator Dashboard & Profile

#### **Profile Management**
- [ ] **Company Profile Setup**
  - Navigate to `/profile`
  - Complete syndicator profile form:
    - Company information
    - Logo upload
    - Business details (years, deal volume)
    - Website and LinkedIn URLs
    - Company description
  - Test image upload functionality

#### **Dashboard Features**
- [ ] **Syndicator Dashboard** (`/dashboard`)
  - Verify syndicator-specific dashboard
  - Check deal management section
  - Test credit system display
  - Verify referral program access
  - Test "New Deal" button functionality

### 8. Deal Management

#### **Deal Creation**
- [ ] **New Deal Form** (`/deals/new`)
  - Test complete deal creation process:
    - Basic information (title, description, location)
    - Financial details (minimum investment, IRR, term)
    - Property type and highlights
    - Cover image upload
  - Verify form validation
  - Test deal slug generation
  - Confirm deal appears in dashboard

#### **Deal Administration**
- [ ] **Deal Management**
  - Edit existing deals
  - Update deal status (draft → active → closed)
  - Upload deal documents
  - Manage deal media gallery
  - Test deal archiving

### 9. Investor Relations

#### **Investor Communication**
- [ ] **Message Management**
  - Receive messages from investors
  - Respond to investment inquiries
  - Manage conversation threads
  - Test bulk messaging features (if available)

#### **Investment Tracking**
- [ ] **Deal Interest Management**
  - View investor interest in deals
  - Track investment commitments
  - Manage investor relationships
  - Export investor data

---

## 📧 Email Notification Testing

### 10. Email System Verification

#### **Signup Notifications**
- [ ] **Admin Notifications**
  - Verify admin receives new investor signup emails
  - Verify admin receives new syndicator signup emails
  - Check email formatting and content
  - Test email delivery to `admin@equitymd.com`

- [ ] **Welcome Emails**
  - Verify new users receive welcome emails
  - Test investor welcome email content
  - Test syndicator welcome email content
  - Check email branding and links

#### **Email Preview System**
- [ ] **Email Preview Page** (`/email-preview`)
  - Test all email template previews:
    - New investor signup notification
    - New syndicator signup notification
    - Investor welcome email
    - Syndicator welcome email
  - Verify HTML rendering in iframes
  - Test "Copy HTML" functionality
  - Check responsive email design

#### **Email Testing Tool**
- [ ] **Email Test Page** (`/email-test`)
  - Test manual email sending
  - Verify different user types
  - Check email delivery and formatting
  - Test error handling

---

## 🔧 Technical & Integration Testing

### 11. Performance & Responsiveness

#### **Mobile Responsiveness**
- [ ] **Mobile Navigation**
  - Test all pages on mobile devices
  - Verify responsive navigation menu
  - Check touch interactions
  - Test modal functionality on mobile

- [ ] **Tablet Experience**
  - Test medium screen layouts
  - Verify grid/list view adaptations
  - Check form usability

#### **Performance Testing**
- [ ] **Page Load Times**
  - Test initial page load performance
  - Verify lazy loading of components
  - Check image optimization
  - Test route preloading

### 12. Database & API Testing

#### **Data Persistence**
- [ ] **Profile Data**
  - Verify profile updates persist correctly
  - Test data validation rules
  - Check foreign key relationships

- [ ] **Deal Data**
  - Test deal creation and updates
  - Verify deal-syndicator relationships
  - Check deal interest tracking

- [ ] **Message Data**
  - Test message storage and retrieval
  - Verify conversation threading
  - Check real-time updates

### 13. Security Testing

#### **Authentication Security**
- [ ] **Access Control**
  - Test protected route access
  - Verify user type restrictions
  - Check admin-only areas
  - Test session management

- [ ] **Data Security**
  - Verify RLS (Row Level Security) policies
  - Test user data isolation
  - Check API endpoint security

---

## 🎯 User Experience Testing

### 14. Navigation & Flow Testing

#### **User Journey Flows**
- [ ] **Complete Investor Journey**
  - Registration → Profile Setup → Browse Deals → Contact Syndicator → Messaging
  - Time the complete flow
  - Note any friction points
  - Test abandonment scenarios

- [ ] **Complete Syndicator Journey**
  - Registration → Profile Setup → Create Deal → Manage Inquiries → Investor Communication
  - Verify all steps work seamlessly
  - Test deal publication flow

#### **Cross-Platform Testing**
- [ ] **Browser Compatibility**
  - Test on Chrome, Firefox, Safari, Edge
  - Verify consistent functionality
  - Check for browser-specific issues

### 15. Error Handling & Edge Cases

#### **Error Scenarios**
- [ ] **Network Issues**
  - Test offline behavior
  - Verify error messages
  - Check retry mechanisms

- [ ] **Invalid Data**
  - Test form validation
  - Verify error message clarity
  - Check data sanitization

- [ ] **Authentication Errors**
  - Test expired sessions
  - Verify logout functionality
  - Check unauthorized access attempts

---

## 📊 Testing Checklist Summary

### Critical Path Testing (Must Pass)
- [ ] User registration (both types)
- [ ] Profile creation and editing
- [ ] Deal browsing and viewing
- [ ] Messaging system
- [ ] Email notifications
- [ ] Dashboard functionality

### Secondary Features Testing
- [ ] Advanced filtering and search
- [ ] File uploads and media
- [ ] Referral system
- [ ] Credit system (syndicators)
- [ ] Mobile responsiveness

### Integration Testing
- [ ] Email delivery system
- [ ] Database operations
- [ ] Real-time features
- [ ] Third-party integrations

---

## 🐛 Bug Reporting Template

When reporting issues, please include:

1. **Bug Description**: Clear description of the issue
2. **Steps to Reproduce**: Exact steps to recreate the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, device, screen size
6. **User Type**: Investor/Syndicator/Admin
7. **Screenshots**: Visual evidence if applicable
8. **Console Errors**: Any JavaScript errors
9. **Priority**: Critical/High/Medium/Low

---

## 📈 Success Criteria

### Functional Requirements
- ✅ All user registration flows work without errors
- ✅ Profile management is fully functional
- ✅ Deal browsing and filtering work correctly
- ✅ Messaging system operates reliably
- ✅ Email notifications are delivered consistently

### Performance Requirements
- ✅ Pages load within 3 seconds
- ✅ Forms submit within 2 seconds
- ✅ Real-time features update within 1 second
- ✅ Mobile experience is smooth and responsive

### User Experience Requirements
- ✅ Navigation is intuitive and clear
- ✅ Error messages are helpful and actionable
- ✅ Visual design is consistent across pages
- ✅ Accessibility standards are met

---

## 🚀 Testing Schedule Recommendation

### Phase 1: Core Functionality (Day 1-2)
- Authentication and registration
- Profile management
- Basic navigation

### Phase 2: Feature Testing (Day 3-4)
- Deal browsing and management
- Messaging system
- Email notifications

### Phase 3: Integration & Polish (Day 5)
- Cross-browser testing
- Mobile responsiveness
- Performance optimization
- Bug fixes

### Phase 4: User Acceptance (Day 6)
- End-to-end user journeys
- Final polish and adjustments
- Production readiness check

---

*This testing plan should be executed systematically with each item checked off as completed. Any issues found should be documented and prioritized for resolution before launch.* 

## 🎯 **Updated Messaging**

### **Main Headlines:**
- ✅ "Real Estate Syndication Made Simple"
- ✅ "Accredited investors"

### **Investor Journey:**
- ✅ "Investors building wealth through syndications"
- ✅ "Exclusive vetted investment opportunities"
- ✅ "Passive income without property management"

### **Syndicator Journey:**
- ✅ "Qualified accredited investors"
- ✅ "Accredited investors"

### **Social Proof:**
- ✅ "Active Investors"

### **Testimonials:**
- ✅ "Sarah Chen, Real Estate Investor"
- ✅ "Michael Rodriguez, Real Estate Syndicator"

## 🎯 **Now the Demo Appeals To:**

**✅ Investors:**
- Real estate investors seeking passive income
- Professionals looking to diversify beyond stocks/bonds
- Accredited investors wanting vetted opportunities

**✅ Syndicators:**
- Real estate syndicators raising capital
- Deal sponsors seeking investor networks
- Property developers needing funding

## 📱 **Review the Updated Demo**

You can now review the updated onboarding experience at:

http://localhost:5173/onboarding-demo 