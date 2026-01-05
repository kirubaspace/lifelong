
// @ts-ignore
import { TelegramClient } from "telegram"
// @ts-ignore
import { StringSession } from "telegram/sessions"
// @ts-ignore
import { Api } from "telegram/tl"

// Use public ID/Hash or env vars
const API_ID = parseInt(process.env.TELEGRAM_API_ID || "")
const API_HASH = process.env.TELEGRAM_API_HASH || ""
const SESSION = process.env.TELEGRAM_SESSION

let client: TelegramClient | null = null

export interface TelegramResult {
    id: string
    channelName: string
    channelUsername: string
    text: string
    date: number
    link: string
}

async function getClient() {
    if (client) return client
    if (!SESSION) {
        console.warn("TELEGRAM_SESSION not set. Telegram scanning disabled.")
        return null
    }

    try {
        client = new TelegramClient(new StringSession(SESSION), API_ID, API_HASH, {
            connectionRetries: 5,
        })
        await client.connect()
        return client
    } catch (error) {
        console.error("Failed to connect to Telegram:", error)
        return null
    }
}

export async function searchTelegram(query: string, limit: number = 20): Promise<TelegramResult[]> {
    const telegram = await getClient()
    if (!telegram) return []

    try {
        // Search global messages
        const result = await telegram.invoke(
            new Api.messages.SearchGlobal({
                q: query,
                filter: new Api.InputMessagesFilterEmpty(),
                minDate: 0,
                maxDate: 0,
                offsetRate: 0,
                offsetPeer: new Api.InputPeerEmpty(),
                offsetId: 0,
                limit: limit,
            })
        ) as Api.messages.Messages

        const parsedResults: TelegramResult[] = []

        // Parse messages
        for (const msg of result.messages) {
            if (msg instanceof Api.Message) {
                // Find chat info
                const chat = result.chats.find((c: any) => c.id.eq(msg.peerId instanceof Api.PeerChannel ? msg.peerId.channelId : 0))

                if (chat && chat instanceof Api.Channel && chat.username) {
                    parsedResults.push({
                        id: msg.id.toString(),
                        channelName: chat.title,
                        channelUsername: chat.username,
                        text: msg.message,
                        date: msg.date,
                        link: `https://t.me/${chat.username}/${msg.id}`
                    })
                }
            }
        }

        return parsedResults
    } catch (error) {
        console.error("Telegram search error:", error)
        return []
    }
}

// Helper to convert Telegram results to standard Infringement format
export function convertToInfringement(result: TelegramResult, contentId: string) {
    return {
        contentId,
        sourceUrl: result.link,
        sourceType: "telegram",
        sourceDomain: "t.me",
        title: `Post in ${result.channelName} (@${result.channelUsername})`,
        snippet: result.text.substring(0, 200),
        confidence: 90, // High confidence as it's a direct keyword match in a file sharing channel
        status: "detected",
        detectedAt: new Date(result.date * 1000)
    }
}
