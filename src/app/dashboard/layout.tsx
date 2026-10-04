import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alpho DriveX · Cockpit Dashboard",
  description: "Real-time tele-operation & AI neural control panel for Alpho Rover",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {children}
    </div>
  );
}
