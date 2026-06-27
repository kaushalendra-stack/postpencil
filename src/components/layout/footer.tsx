export function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-4">
        <p>&copy; {new Date().getFullYear()} PostPencil. All rights reserved.</p>
        <p>Made with &#10084; for students</p>
      </div>
    </footer>
  )
}
