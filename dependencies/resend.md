# Resend Email Service

> Comprehensive guide to sending transactional emails with Resend in Node.js applications.

---

## Overview

**Resend** is a modern email API built for developers, offering:
- Simple API for transactional emails
- React Email integration for templating
- High deliverability
- Detailed analytics
- Free tier with 100 emails/day

---

## Why Resend?

| Feature | Benefit |
|---------|---------|
| **Developer First** | Clean API, great docs, TypeScript support |
| **React Email** | Build emails with React components |
| **High Deliverability** | Built on modern infrastructure |
| **Analytics** | Track opens, clicks, bounces |
| **Simple Pricing** | Generous free tier |

---

## Setup Guide

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get API key from dashboard

### Step 2: Install Package

```bash
npm install resend
```

### Step 3: Add API Key

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## Basic Usage

### Initialize Client

```typescript
// src/services/email/email-service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
```

### Send Simple Email

```typescript
await resend.emails.send({
  from: 'PirateSlayer <notifications@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Welcome to PirateSlayer',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
})
```

### Send with Plain Text Fallback

```typescript
await resend.emails.send({
  from: 'PirateSlayer <notifications@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'New Infringement Detected',
  html: '<h1>Alert!</h1><p>We found a potential copy of your content.</p>',
  text: 'Alert! We found a potential copy of your content.',
})
```

---

## Email Templates

### HTML Template

```typescript
function generateInfringementEmail(data: {
  userName: string
  contentTitle: string
  infringementUrl: string
  confidence: number
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .alert { background: #fee2e2; padding: 20px; border-radius: 8px; }
        .button { 
          background: #7c3aed; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <h1>🚨 Infringement Detected</h1>
      
      <p>Hi ${data.userName},</p>
      
      <p>We found a potential unauthorized copy of your content:</p>
      
      <div class="alert">
        <strong>Content:</strong> ${data.contentTitle}<br>
        <strong>Found at:</strong> ${data.infringementUrl}<br>
        <strong>Confidence:</strong> ${data.confidence}%
      </div>
      
      <p>
        <a href="https://pirateslayer.com/dashboard/infringements" class="button">
          Review & Take Action
        </a>
      </p>
      
      <p>Best regards,<br>PirateSlayer Team</p>
    </body>
    </html>
  `
}
```

### React Email (Advanced)

```bash
npm install @react-email/components
```

```tsx
// emails/infringement-alert.tsx
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components'

interface Props {
  userName: string
  contentTitle: string
  infringementUrl: string
}

export function InfringementAlertEmail({ userName, contentTitle, infringementUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Heading>🚨 Infringement Detected</Heading>
          <Text>Hi {userName},</Text>
          <Text>
            We found a potential unauthorized copy of "{contentTitle}" at:
          </Text>
          <Text>{infringementUrl}</Text>
          <Button 
            href="https://pirateslayer.com/dashboard"
            style={{ background: '#7c3aed', color: 'white', padding: '12px 24px' }}
          >
            Review & Take Action
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

```typescript
import { InfringementAlertEmail } from '@/emails/infringement-alert'
import { render } from '@react-email/render'

const html = render(InfringementAlertEmail({
  userName: 'John',
  contentTitle: 'React Masterclass',
  infringementUrl: 'https://piracy-site.com/react-course',
}))

await resend.emails.send({
  from: 'PirateSlayer <notifications@yourdomain.com>',
  to: ['john@example.com'],
  subject: 'Infringement Detected',
  html,
})
```

---

## Implementation in This Project

### Email Service

```typescript
// src/services/email/email-service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'PirateSlayer <notifications@pirateslayer.com>'

export async function sendInfringementAlert(
  userEmail: string,
  userName: string,
  contentTitle: string,
  infringementCount: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: `🚨 ${infringementCount} New Infringement(s) Detected`,
      html: generateAlertEmail(userName, contentTitle, infringementCount),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: [userEmail],
    subject: 'Welcome to PirateSlayer! 🎉',
    html: generateWelcomeEmail(userName),
  })
}

export async function sendDMCAConfirmation(
  userEmail: string,
  contentTitle: string,
  recipientDomain: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: [userEmail],
    subject: `DMCA Notice Sent to ${recipientDomain}`,
    html: generateDMCAConfirmationEmail(contentTitle, recipientDomain),
  })
}
```

---

## Domain Setup (Production)

### Add Your Domain

1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Add DNS records:

| Type | Name | Value |
|------|------|-------|
| TXT | @ | Verification record |
| MX | resend | mx.resend.com |
| TXT | resend._domainkey | DKIM key |

### Verify Domain

```bash
# Check DNS propagation
dig TXT yourdomain.com
dig MX yourdomain.com
```

---

## Common Patterns

### Batch Sending

```typescript
// Send different emails to multiple recipients
const emails = users.map(user => ({
  from: FROM_EMAIL,
  to: [user.email],
  subject: 'Weekly Report',
  html: generateWeeklyReport(user),
}))

await resend.batch.send(emails)
```

### Scheduled Sending

```typescript
// Send email at specific time
await resend.emails.send({
  from: FROM_EMAIL,
  to: ['user@example.com'],
  subject: 'Reminder',
  html: '<p>Your scheduled reminder</p>',
  scheduledAt: '2026-01-15T09:00:00Z',
})
```

### Attachments

```typescript
await resend.emails.send({
  from: FROM_EMAIL,
  to: ['user@example.com'],
  subject: 'DMCA Notice',
  html: '<p>Please find attached DMCA notice.</p>',
  attachments: [
    {
      filename: 'dmca-notice.pdf',
      content: pdfBuffer,
    },
  ],
})
```

---

## Error Handling

```typescript
try {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: ['user@example.com'],
    subject: 'Test',
    html: '<p>Test email</p>',
  })
  
  if (error) {
    console.error('Resend error:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, messageId: data?.id }
} catch (e) {
  console.error('Unexpected error:', e)
  return { success: false, error: 'Failed to send email' }
}
```

---

## Pricing

| Plan | Monthly Emails | Price |
|------|----------------|-------|
| Free | 100/day (3,000/month) | $0 |
| Pro | 50,000 | $20/month |
| 100k | 100,000 | $40/month |
| Scale | 500,000+ | Custom |

---

## Alternatives

| Service | Pros | Cons |
|---------|------|------|
| **SendGrid** | Mature, high volume | Complex API |
| **Postmark** | Great deliverability | Higher price |
| **AWS SES** | Very cheap at scale | More setup |
| **Mailgun** | Good features | EU data concerns |

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email](https://react.email)
- [Resend API Reference](https://resend.com/docs/api-reference/introduction)
- [Example Templates](https://react.email/examples)

---

*Last updated: January 2026*
