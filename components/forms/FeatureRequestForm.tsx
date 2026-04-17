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

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; id: number; url: string }
  | { status: "error"; message: string }

export function FeatureRequestForm() {
  const [state, setState] = useState<State>({ status: "idle" })
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "3",
    area: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState({ status: "loading" })

    try {
      const res = await fetch("/api/ado/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: Number(form.priority),
          type: "Feature",
          area: form.area || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Unknown error")
      setState({ status: "success", id: data.id, url: data.webUrl })
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      })
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center space-y-3">
        <p className="font-medium text-green-800">Feature request submitted</p>
        <p className="text-sm text-green-700">
          Work item{" "}
          <a
            href={state.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline"
          >
            #{state.id}
          </a>{" "}
          has been added to our backlog.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setState({ status: "idle" })
            setForm({ title: "", description: "", priority: "3", area: "" })
          }}
        >
          Submit another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Brief summary of the feature"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What problem does this solve? What would the ideal outcome look like?"
          rows={5}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={form.priority}
            onValueChange={(v) => setForm((f) => ({ ...f, priority: v ?? "3" }))}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 — Critical</SelectItem>
              <SelectItem value="2">2 — High</SelectItem>
              <SelectItem value="3">3 — Medium</SelectItem>
              <SelectItem value="4">4 — Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="area">Area / Component</Label>
          <Input
            id="area"
            placeholder="e.g. CI/CD, Networking, IaC"
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
          />
        </div>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={state.status === "loading"}
        className="w-full"
      >
        {state.status === "loading" ? "Submitting…" : "Submit feature request"}
      </Button>
    </form>
  )
}
