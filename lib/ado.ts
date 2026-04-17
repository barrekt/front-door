export type WorkItemType = "Feature" | "Bug" | "Task" | "User Story"

export interface CreateWorkItemParams {
  title: string
  description: string
  priority: 1 | 2 | 3 | 4
  type: WorkItemType
  tags?: string
  createdBy?: string
}

export interface CreatedWorkItem {
  id: number
  url: string
  webUrl: string
}

export async function createWorkItem(
  params: CreateWorkItemParams
): Promise<CreatedWorkItem> {
  const orgUrl = process.env.ADO_ORG_URL
  const project = process.env.ADO_PROJECT
  const pat = process.env.ADO_PAT

  if (!orgUrl || !project || !pat) {
    throw new Error("Azure DevOps environment variables are not configured")
  }

  const token = Buffer.from(`:${pat}`).toString("base64")
  const apiUrl = `${orgUrl}/${encodeURIComponent(project)}/_apis/wit/workitems/$${encodeURIComponent(params.type)}?api-version=7.1`

  const body = [
    { op: "add", path: "/fields/System.Title", value: params.title },
    {
      op: "add",
      path: "/fields/System.Description",
      value: params.description,
    },
    {
      op: "add",
      path: "/fields/Microsoft.VSTS.Common.Priority",
      value: params.priority,
    },
  ]

  if (params.tags) {
    body.push({ op: "add", path: "/fields/System.Tags", value: params.tags })
  }

  if (params.createdBy) {
    body.push({
      op: "add",
      path: "/fields/System.History",
      value: `Submitted via Front Door by ${params.createdBy}`,
    })
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`ADO API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    url: data.url,
    webUrl: data._links?.html?.href ?? `${orgUrl}/${project}/_workitems/edit/${data.id}`,
  }
}
