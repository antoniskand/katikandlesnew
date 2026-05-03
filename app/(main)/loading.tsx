export default function Loading() {
  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Φόρτωση...</p>
      </div>
    </div>
  )
}
