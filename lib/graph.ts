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

export interface CreatedChannel {
  id: string
  displayName: string
  webUrl: string
}

export async function createIncidentChannel(params: {
  incidentTitle: string
  incidentDescription: string
  reporterUserId?: string
}): Promise<CreatedChannel> {
  const teamId = process.env.TEAMS_TEAM_ID
  if (!teamId) {
    throw new Error("TEAMS_TEAM_ID environment variable is not configured")
  }

  const channelName = `INC-${Date.now()}-${params.incidentTitle
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 40)
    .trim()}`

  const channel = await graphRequest<CreatedChannel>(
    `/teams/${teamId}/channels`,
    "POST",
    {
      displayName: channelName,
      description: params.incidentDescription,
      membershipType: "private",
    }
  )

  if (params.reporterUserId) {
    try {
      await graphRequest(
        `/teams/${teamId}/channels/${channel.id}/members`,
        "POST",
        {
          "@odata.type": "#microsoft.graph.aadUserConversationMember",
          roles: ["owner"],
          "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${params.reporterUserId}`,
        }
      )
    } catch {
      // Non-fatal — channel still created, member add failed
    }
  }

  return channel
}
