interface PageShellProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {children}
    </main>
  )
}
