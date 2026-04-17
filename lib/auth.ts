export interface ClientPrincipal {
  userId: string
  userRoles: string[]
  claims: { typ: string; val: string }[]
  identityProvider: string
  userDetails: string
}

export function getClientPrincipal(
  headers: Headers
): ClientPrincipal | null {
  const header = headers.get("x-ms-client-principal")
  if (!header) return null
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf8"))
  } catch {
    return null
  }
}

export function getDisplayName(principal: ClientPrincipal): string {
  const nameClaim = principal.claims.find(
    (c) => c.typ === "name" || c.typ === "preferred_username"
  )
  return nameClaim?.val ?? principal.userDetails
}
