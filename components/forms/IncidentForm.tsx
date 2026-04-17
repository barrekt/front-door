"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type Severity = "P1" | "P2" | "P3" | "P4"

type State =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success"
      warRoomCreated: boolean
      chatUrl?: string
      chatTopic?: string
      message: string
    }
  | { status: "error"; message: string }

const severityLabels: Record<Severity, string> = {
  P1: "P1 — Critical (service down)",
  P2: "P2 — High (major degradation)",
  P3: "P3 — Medium (partial impact)",
  P4: "P4 — Low (minor issue)",
}

export function IncidentForm() {
  const [state, setState] = useState<State>({ status: "idle" })
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "P2" as Severity,
    affectedSystem: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState({ status: "loading" })

    try {
      const res = await fetch("/api/teams/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Unknown error")

      setState({
        status: "success",
        warRoomCreated: data.warRoomCreated,
        chatUrl: data.chat?.url,
        chatTopic: data.chat?.topic,
        message: data.message,
      })
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      })
    }
  }

  if (state.status === "success") {
    return (
      <div
        className={`rounded-lg border p-6 text-center space-y-3 ${
          state.warRoomCreated
            ? "border-orange-200 bg-orange-50"
            : "border-green-200 bg-green-50"
        }`}
      >
        <p
          className={`font-medium ${state.warRoomCreated ? "text-orange-800" : "text-green-800"}`}
        >
          Incident reported
        </p>
        <p
          className={`text-sm ${state.warRoomCreated ? "text-orange-700" : "text-green-700"}`}
        >
          {state.message}
        </p>
        {state.chatUrl && (
          <a
            href={state.chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium underline text-orange-800"
          >
            Open war room chat: {state.chatTopic}
          </a>
        )}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setState({ status: "idle" })
              setForm({
                title: "",
                description: "",
                severity: "P2",
                affectedSystem: "",
              })
            }}
          >
            Report another
          </Button>
        </div>
      </div>
    )
  }

  const isHighSeverity = form.severity === "P1" || form.severity === "P2"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="severity">Severity</Label>
        <Select
          value={form.severity}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, severity: v as Severity }))
          }
        >
          <SelectTrigger id="severity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(severityLabels) as Severity[]).map((s) => (
              <SelectItem key={s} value={s}>
                {severityLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isHighSeverity && (
          <p className="text-xs text-orange-600">
            A Teams war room group chat will be created automatically for{" "}
            {form.severity} incidents.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Brief summary of the incident"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="affectedSystem">Affected System</Label>
        <Input
          id="affectedSystem"
          placeholder="e.g. Production API Gateway, CI/CD pipeline, Azure Kubernetes"
          value={form.affectedSystem}
          onChange={(e) =>
            setForm((f) => ({ ...f, affectedSystem: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What is happening? When did it start? What is the impact?"
          rows={5}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          required
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={state.status === "loading"}
        className="w-full"
        variant={isHighSeverity ? "destructive" : "default"}
      >
        {state.status === "loading"
          ? "Submitting…"
          : isHighSeverity
            ? "Report incident + create war room"
            : "Report incident"}
      </Button>
    </form>
  )
}
