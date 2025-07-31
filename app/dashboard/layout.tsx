import { ReactNode } from "react";
import TopNavigation from "./_components/top-navigation";
import SubNavigation from "./_components/sub-navigation";
import Chatbot from "./_components/chatbot";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full flex-col">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <SubNavigation />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
