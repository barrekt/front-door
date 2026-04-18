import { NextRequest, NextResponse } from "next/server"
import { createWorkItem, type WorkItemType } from "@/lib/ado"
import { getClientPrincipal, getDisplayName } from "@/lib/auth"

export interface CreateWorkItemRequest {
  title: string
  description: string
  priority: 1 | 2 | 3 | 4
  type: WorkItemType
  area?: string
}

export async function POST(request: NextRequest) {
  const principal = getClientPrincipal(request.headers)
  const body: CreateWorkItemRequest = await request.json()

  if (!body.title?.trim() || !body.description?.trim()) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    )
  }

  if (![1, 2, 3, 4].includes(body.priority)) {
    return NextResponse.json(
      { error: "priority must be 1, 2, 3, or 4" },
      { status: 400 }
    )
  }

  try {
    const workItem = await createWorkItem({
      title: body.title.trim(),
      description: body.description.trim(),
      priority: body.priority,
      type: body.type ?? "Feature",
      tags: ["front-door", body.area].filter(Boolean).join("; "),
      createdBy: principal ? getDisplayName(principal) : undefined,
    })

    return NextResponse.json(workItem, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Failed to create ADO work item:", message)
    return NextResponse.json(
      {
        error: "Failed to create work item. Please try again.",
        ...(process.env.NODE_ENV === "development" && { detail: message }),
      },
      { status: 500 }
    )
  }
}
