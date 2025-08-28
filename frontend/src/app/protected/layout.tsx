import Sidebar from "./sidebarLayout";
import TopBar from "./topbarLayout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen min-w-0">
      <TopBar />

      <div className="flex flex-1 min-w-0">
        {/* Sidebar fixed on left */}
        <Sidebar />

        {/* Main content with left margin equal to sidebar width */}
        <main className="ml-72 pt-[60px] p-8 flex-1 min-w-0 min-h-0 overflow-auto bg-gray-1000 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
