import SidebarLayout from "@/components/sidebar-layout";

export default function ChatHistoryPage() {
  return (
    <SidebarLayout
      header="Chat History"
      description=""
      breadcrumbs={[
        { title: "Dashboard", href: "/" },
        { title: "Chat", href: "chat" },
        { title: "Chat History" },
      ]}
    >
      <div className="p-6">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <h2 className="text-lg font-medium text-gray-600 mb-2">
            Chat History Feature Coming Soon
          </h2>
          <p className="text-gray-500">
            View and manage your previous conversations here.
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
}
