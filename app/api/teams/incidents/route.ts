import { NextRequest, NextResponse } from "next/server"
import { createIncidentChannel } from "@/lib/graph"
import { getClientPrincipal, getDisplayName } from "@/lib/auth"

export type Severity = "P1" | "P2" | "P3" | "P4"

const CHANNEL_SEVERITIES: Severity[] = ["P1", "P2"]

export interface CreateIncidentRequest {
  title: string
  description: string
  severity: Severity
  affectedSystem: string
}

export async function POST(request: NextRequest) {
  const principal = getClientPrincipal(request.headers)
  const body: CreateIncidentRequest = await request.json()

  if (!body.title?.trim() || !body.description?.trim()) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    )
  }

  const validSeverities: Severity[] = ["P1", "P2", "P3", "P4"]
  if (!validSeverities.includes(body.severity)) {
    return NextResponse.json(
      { error: "severity must be P1, P2, P3, or P4" },
      { status: 400 }
    )
  }

  const reporterName = principal ? getDisplayName(principal) : "Unknown"
  const reporterUserId = principal?.userId

  const warRoomCreated = CHANNEL_SEVERITIES.includes(body.severity)

  try {
    let channel = null

    if (warRoomCreated) {
      channel = await createIncidentChannel({
        incidentTitle: `${body.severity} - ${body.title.trim()}`,
        incidentDescription: [
          body.description.trim(),
          `Affected system: ${body.affectedSystem ?? "Unknown"}`,
          `Reported by: ${reporterName}`,
        ].join("\n\n"),
        reporterUserId,
      })
    }

    return NextResponse.json(
      {
        severity: body.severity,
        warRoomCreated,
        channel: channel
          ? { id: channel.id, name: channel.displayName, url: channel.webUrl }
          : null,
        message: warRoomCreated
          ? `War room channel created: ${channel?.displayName}`
          : `Incident logged. War rooms are created for P1/P2 only.`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Failed to create incident channel:", err)
    return NextResponse.json(
      { error: "Failed to create incident channel. Please try again." },
      { status: 500 }
    )
  }
}
