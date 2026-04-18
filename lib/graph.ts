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

export async function getGraphToken(): Promise<string> {
  const client = getMsalClient()
  const result = await client.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  })
  if (!result?.accessToken) {
    throw new Error("Failed to acquire Microsoft Graph access token")
  }
  return result.accessToken
}

export async function graphRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const token = await getGraphToken()
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
