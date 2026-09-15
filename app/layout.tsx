import { DriverProvider } from '../context/DriverContext'
import BottomNavWrapper from '../components/BottomNavWrapper'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>
        <DriverProvider>
          <div id="app-container" style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '8px 0 0 #111111, -8px 0 0 #111111' }}>
            {children}
            <BottomNavWrapper />
          </div>
        </DriverProvider>
      </body>
    </html>
  )
}
