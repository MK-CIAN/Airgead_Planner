import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Notification from "./Notifications"; // Assume a replacement exists
import Axios from "./Axios";
import Search from "./UserServices/Search";

import {
  Home,
  PieChart,
  Savings,
  TrendingUp,
  SsidChart,
  Newspaper,
  TrendingDown,
  Logout,
} from "@mui/icons-material";
import { green } from "@mui/material/colors";

export default function TestNav({ content }: { content: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`,
      },
    })
      .then((res) => setUsername(res.data.username))
      .catch((err) => console.error(err));
  }, []);

  const logoutUser = () => {
    Axios.post(`logoutall/`, {}).then(() => {
      localStorage.removeItem("Token");
      navigate(`/`);
    });
  };

  const drawerItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/budget", label: "Budgets", icon: PieChart },
    { path: "/savings", label: "Savings", icon: Savings },
    { path: "/pensions", label: "Pension Planner", icon: TrendingUp },
    { path: "/stocksimlanding", label: "Stock Market Simulator", icon: SsidChart },
    { path: "/news", label: "News For You", icon: Newspaper },
    { path: "/loans", label: "Loan Repayment Calculator", icon: TrendingDown },
    { path: "/income", label: "Income Tax Calculator", icon: TrendingDown },
    { custom: true, label: "Logout", icon: Logout, onClick: logoutUser },
  ];

  const currentBreadcrumb = drawerItems.find(
    (item) => item.path === location.pathname
  )?.label;

  return (
    <SidebarProvider>
      <Sidebar>
        {/* Sidebar Header with Logo and Title */}
        <div className="flex items-center space-x-4 p-4 bg-green-600 text-white">
          <img
            src="/static/harpIcon.png"
            alt="Logo"
            className="w-8 h-8"
          />
          <span className="text-lg font-bold">Airgead Planner</span>
        </div>

        <nav className="flex flex-col space-y-2 p-4">
          {drawerItems.map(({ path, label, icon: Icon, custom, onClick }) =>
            custom ? (
              <button
                key={label}
                className="flex items-center p-2 rounded hover:bg-green-600"
                onClick={onClick}
              >
                <Icon className="mr-2" style={{ color: green[500] }} />
                {label}
              </button>
            ) : (
              <Link
                to={path || ""}
                className={`flex items-center p-2 rounded ${
                  location.pathname === path
                    ? "bg-green-700 text-white"
                    : "hover:bg-green-600"
                }`}
                key={path}
              >
                <Icon className="mr-2" style={{ color: green[500] }} />
                {label}
              </Link>
            )
          )}
        </nav>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center px-4">
          <SidebarTrigger className="mr-2" />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbItem>Airgead Planner</BreadcrumbItem>
              </BreadcrumbItem>
              <BreadcrumbItem>
                {currentBreadcrumb || "Dashboard"}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex-1 flex items-center justify-end space-x-4">
            <Search />
            <Notification />
            <div className="text-sm font-medium">
              Hello, {username || "Guest"}
            </div>
          </div>
        </header>
        <main className="p-4">{content}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
