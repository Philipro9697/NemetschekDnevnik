const stats = [
  { value: "1 400+", label: "училища в мрежата" },
  { value: "780 хил.", label: "активни ученици" },
  { value: "12 мин.", label: "средно спестени на ден" },
  { value: "99,95%", label: "надеждност на системата" },
]

export function Stats() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-8 text-center sm:px-6">
            <p className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
