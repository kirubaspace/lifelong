/**
 * DMCA Notice Generator
 * 
 * Generates legally compliant DMCA takedown notices
 */

import { prisma } from "@/lib/db"

interface NoticeData {
    ownerName: string
    ownerEmail: string
    courseTitle: string
    courseUrl: string
    courseDescription?: string
    infringementUrl: string
    infringementDomain: string
}

/**
 * Generate DMCA takedown notice content
 */
export function generateNoticeContent(data: NoticeData): string {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return `DMCA TAKEDOWN NOTICE

Pursuant to 17 U.S.C. § 512(c), this is a formal notification of claimed copyright infringement.

==========================================================================
COMPLAINANT INFORMATION
==========================================================================

Name: ${data.ownerName}
Email: ${data.ownerEmail}

==========================================================================
COPYRIGHTED WORK
==========================================================================

Title: ${data.courseTitle}
Original Location: ${data.courseUrl}
${data.courseDescription ? `Description: ${data.courseDescription}` : ''}

==========================================================================
INFRINGING MATERIAL
==========================================================================

The following URL contains material that infringes my copyright:

${data.infringementUrl}

Domain: ${data.infringementDomain}

==========================================================================
REQUIRED STATEMENTS
==========================================================================

I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

==========================================================================
SIGNATURE
==========================================================================

Electronic Signature: ${data.ownerName}
Date: ${date}

==========================================================================

This notice is sent in accordance with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512(c)(3).

Please remove the infringing material immediately. Failure to do so may result in legal action.

Thank you for your prompt attention to this matter.

${data.ownerName}
${data.ownerEmail}
`
}

/**
 * Generate HTML email version of DMCA notice
 */
export function generateNoticeHTML(data: NoticeData): string {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
    h1 { color: #c00; border-bottom: 2px solid #c00; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
    .section { margin: 20px 0; }
    .url { word-break: break-all; color: #0066cc; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>DMCA TAKEDOWN NOTICE</h1>
  
  <p>Pursuant to 17 U.S.C. § 512(c), this is a formal notification of claimed copyright infringement.</p>
  
  <h2>Complainant Information</h2>
  <div class="section">
    <p><strong>Name:</strong> ${data.ownerName}</p>
    <p><strong>Email:</strong> ${data.ownerEmail}</p>
  </div>
  
  <h2>Copyrighted Work</h2>
  <div class="section">
    <p><strong>Title:</strong> ${data.courseTitle}</p>
    <p><strong>Original Location:</strong> <a href="${data.courseUrl}" class="url">${data.courseUrl}</a></p>
    ${data.courseDescription ? `<p><strong>Description:</strong> ${data.courseDescription}</p>` : ''}
  </div>
  
  <h2>Infringing Material</h2>
  <div class="highlight">
    <p>The following URL contains material that infringes my copyright:</p>
    <p class="url"><strong>${data.infringementUrl}</strong></p>
    <p><strong>Domain:</strong> ${data.infringementDomain}</p>
  </div>
  
  <h2>Required Statements</h2>
  <div class="section">
    <p>I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</p>
    <p>I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</p>
  </div>
  
  <h2>Signature</h2>
  <div class="section">
    <p><strong>Electronic Signature:</strong> ${data.ownerName}</p>
    <p><strong>Date:</strong> ${date}</p>
  </div>
  
  <div class="footer">
    <p>This notice is sent in accordance with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512(c)(3).</p>
    <p><strong>Please remove the infringing material immediately. Failure to do so may result in legal action.</strong></p>
  </div>
</body>
</html>
`
}

// Common abuse email patterns for hosting providers
const ABUSE_EMAIL_PATTERNS: Record<string, string> = {
    "cloudflare.com": "abuse@cloudflare.com",
    "amazonaws.com": "abuse@amazonaws.com",
    "digitalocean.com": "abuse@digitalocean.com",
    "linode.com": "abuse@linode.com",
    "hostinger.com": "abuse@hostinger.com",
    "namecheap.com": "abuse@namecheap.com",
    "godaddy.com": "abuse@godaddy.com",
    "mega.nz": "copyright@mega.nz",
    "drive.google.com": "dmca-agent@google.com",
    "dropbox.com": "dmca@dropbox.com",
    "t.me": "dmca@telegram.org",
    "telegram.org": "dmca@telegram.org",
}

/**
 * Get abuse email for a domain
 */
export function getAbuseEmail(domain: string): string | null {
    for (const [pattern, email] of Object.entries(ABUSE_EMAIL_PATTERNS)) {
        if (domain.includes(pattern)) {
            return email
        }
    }
    return null
}

/**
 * Create DMCA notice record in database
 */
export async function createDMCANotice(
    infringementId: string,
    userId: string
): Promise<{ id: string; content: string }> {
    const infringement = await prisma.infringement.findUnique({
        where: { id: infringementId },
        include: { content: { include: { user: true } } },
    })

    if (!infringement) {
        throw new Error("Infringement not found")
    }

    // Verify ownership
    if (infringement.content.userId !== userId) {
        throw new Error("Unauthorized")
    }

    const noticeData: NoticeData = {
        ownerName: infringement.content.user.name || "Copyright Owner",
        ownerEmail: infringement.content.user.email,
        courseTitle: infringement.content.title,
        courseUrl: infringement.content.originalUrl,
        courseDescription: infringement.content.description || undefined,
        infringementUrl: infringement.sourceUrl,
        infringementDomain: infringement.sourceDomain || new URL(infringement.sourceUrl).hostname,
    }

    const noticeContent = generateNoticeContent(noticeData)
    const abuseEmail = getAbuseEmail(infringement.sourceDomain || "")

    const notice = await prisma.dMCANotice.create({
        data: {
            infringementId,
            recipientType: abuseEmail ? "hosting_provider" : "email",
            recipientEmail: abuseEmail,
            recipientName: infringement.sourceDomain,
            noticeContent,
            status: "draft",
        },
    })

    // Create initial event
    await prisma.noticeEvent.create({
        data: {
            noticeId: notice.id,
            eventType: "created",
            details: "DMCA notice generated",
        },
    })

    // Update infringement status
    await prisma.infringement.update({
        where: { id: infringementId },
        data: { status: "reviewing" },
    })

    return { id: notice.id, content: noticeContent }
}
