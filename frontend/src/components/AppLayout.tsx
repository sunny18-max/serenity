import { ReactNode } from "react";
import MobileBottomNav from "./MobileBottomNav";

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const AppLayout = ({ children, showBottomNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      {children}
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};

export default AppLayout;
