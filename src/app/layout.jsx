export const metadata = {
  title: 'Strategy Made Real — Execution Suite',
  description: 'Eight tools. One suite. Where strategy becomes owned, measurable, and executed.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#F7F4EF' }}>
        {children}
      </body>
    </html>
  )
}
