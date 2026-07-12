import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface antialiased">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        {/* Fixed Header */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto mt-16 bg-background">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
