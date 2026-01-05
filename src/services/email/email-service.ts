/**
 * Email Service using Resend
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

interface EmailOptions {
    to: string | string[]
    subject: string
    text?: string
    html?: string
    replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!resend) {
        console.warn('Resend not configured - email not sent')
        return { success: false, error: 'Email service not configured' }
    }

    try {
        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            text: options.text,
            html: options.html,
            replyTo: options.replyTo,
        } as any)

        if (result.error) {
            console.error('Email send error:', result.error)
            return { success: false, error: result.error.message }
        }

        return { success: true, id: result.data?.id }
    } catch (error) {
        console.error('Email service error:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function sendDMCANotice(
    recipientEmail: string,
    noticeContent: string,
    noticeHtml: string,
    replyToEmail: string
): Promise<{ success: boolean; id?: string; error?: string }> {
    return sendEmail({
        to: recipientEmail,
        subject: 'DMCA Takedown Notice - Immediate Action Required',
        text: noticeContent,
        html: noticeHtml,
        replyTo: replyToEmail,
    })
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; id?: string; error?: string }> {
    return sendEmail({
        to: toEmail,
        subject: 'PirateSlayer - Test Email',
        text: 'This is a test email from PirateSlayer. Your email configuration is working correctly!',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #7c3aed;">🏴‍☠️ PirateSlayer</h1>
                <p>This is a test email from PirateSlayer.</p>
                <p style="color: #22c55e; font-weight: bold;">✓ Your email configuration is working correctly!</p>
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
                <p style="color: #888; font-size: 14px;">
                    You can now send DMCA takedown notices from your dashboard.
                </p>
            </div>
        `,
    })
}
