import {
  ConfidentialClientApplication,
  type Configuration,
} from "@azure/msal-node"

let msalClient: ConfidentialClientApplication | null = null

function getMsalClient(): ConfidentialClientApplication {
  if (!msalClient) {
    const config: Configuration = {
      auth: {
        clientId: process.env.AZURE_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    }
    msalClient = new ConfidentialClientApplication(config)
  }
  return msalClient
}

async function getAccessToken(): Promise<string> {
  const client = getMsalClient()
  const result = await client.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  })
  if (!result?.accessToken) {
    throw new Error("Failed to acquire Microsoft Graph access token")
  }
  return result.accessToken
}

async function graphRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const token = await getAccessToken()
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Graph API error ${response.status} on ${path}: ${text}`)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export interface CreatedChat {
  id: string
  topic: string
  webUrl: string
}

export async function createIncidentChat(params: {
  incidentTitle: string
  incidentDescription: string
  reporterUserId?: string
}): Promise<CreatedChat> {
  const oncallUserId = process.env.TEAMS_ONCALL_USER_ID
  if (!oncallUserId) {
    throw new Error("TEAMS_ONCALL_USER_ID environment variable is not configured")
  }

  const topic = `INC - ${params.incidentTitle.slice(0, 60)}`

  const members: unknown[] = [
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      roles: ["owner"],
      "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${oncallUserId}`,
    },
  ]

  if (params.reporterUserId && params.reporterUserId !== oncallUserId) {
    members.push({
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      roles: ["member"],
      "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${params.reporterUserId}`,
    })
  }

  const chat = await graphRequest<CreatedChat>("/chats", "POST", {
    chatType: "group",
    topic,
    members,
  })

  // Post the incident details as the opening message
  try {
    await graphRequest(`/chats/${chat.id}/messages`, "POST", {
      body: {
        contentType: "text",
        content: [
          `🚨 ${params.incidentTitle}`,
          "",
          params.incidentDescription,
        ].join("\n"),
      },
    })
  } catch {
    // Non-fatal — chat created, opening message failed
  }

  return chat
}
