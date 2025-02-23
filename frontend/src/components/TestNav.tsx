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
  BreadcrumbSeparator,
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

type DrawerItem = {
  path?: string;
  label: string;
  icon?: React.ElementType;
  subPaths?: string[]; // Optional sub-paths
  custom?: boolean;
  onClick?: () => void;
};

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
    {
      path: "/budget",
      label: "Budgets",
      icon: PieChart,
      subPaths: ["/monthly-budget", "/custom-budget"],
    },
    { path: "/savings", label: "Savings", icon: Savings },
    { path: "/pensions", label: "Pension Planner", icon: TrendingUp },
    {
      path: "/stocksimlanding",
      label: "Stock Market Simulator",
      icon: SsidChart,
      subPaths: [
        "/stocksim?portfolio_type=league",  // Match league portfolio
        "/stocksim?portfolio_type=personal" // Match personal portfolio
      ]
    },
    { path: "/news", label: "News For You", icon: Newspaper },
    { path: "/loans", label: "Loan Repayment Calculator", icon: TrendingDown, subPaths: ["/loan-details"], },
    { path: "/income", label: "Income Tax Calculator", icon: TrendingDown },
    { custom: true, label: "Logout", icon: Logout, onClick: logoutUser },
  ];

  const isActive = (item: DrawerItem) => {
    // Extract only the base pathname (ignore query parameters)
    const basePath = location.pathname.split("?")[0];
  
    const matchesPath = item.path
      ? new RegExp(`^${item.path}(\\/\\d+)?$`).test(basePath) // Match path with optional ID
      : false;
  
    const matchesSubPath = item.subPaths
      ? item.subPaths.some((subPath) => {
          // Extract only the base path for comparison
          const subBasePath = subPath.split("?")[0];
  
          // Check if the base path matches
          if (new RegExp(`^${subBasePath}(\\/\\d+)?$`).test(basePath)) {
            return true;
          }
  
          // If subPath contains query parameters, check if they exist in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const subQueryParams = subPath.includes("?") ? new URLSearchParams(subPath.split("?")[1]) : null;
  
          if (subQueryParams) {
            for (const [key, value] of subQueryParams.entries()) {
              if (urlParams.get(key) !== value) {
                return false; // A required query parameter doesn't match
              }
            }
            return true; // All query params match
          }
  
          return false;
        })
      : false;
  
    return matchesPath || matchesSubPath;
  };

  const getBreadcrumbItems = () => {
    const basePath = location.pathname.split("?")[0]; // Remove query parameters
    const queryParams = new URLSearchParams(location.search);
  
    // Find the matching menu item (including subPaths)
    let matchedItem = drawerItems.find(
      (item) =>
        basePath === item.path ||
        item.subPaths?.some((subPath) => {
          const subBasePath = subPath.split("?")[0]; // Remove query params from subPaths
  
          // Match base path or match query parameters if defined in subPath
          if (basePath === subBasePath) {
            return true;
          }
  
          if (subPath.includes("?")) {
            const subQueryParams = new URLSearchParams(subPath.split("?")[1]);
            for (const [key, value] of subQueryParams.entries()) {
              if (queryParams.get(key) !== value) {
                return false; // A required query parameter doesn't match
              }
            }
            return true;
          }
          return false;
        })
    );
  
    // Default breadcrumb
    let breadcrumbs = [{ label: "Airgead Planner", path: "/home" }];
  
    if (matchedItem) {
      breadcrumbs.push({ label: matchedItem.label, path: matchedItem.path ?? "#" });

      const idMatch = basePath.match(/\/(\d+)$/);
      if (idMatch) {
        breadcrumbs.push({ label: `ID: ${idMatch[1]}`, path: basePath });
      }

      if (queryParams.has("portfolio_type")) {
        breadcrumbs.push({
          label:
            queryParams.get("portfolio_type") === "league"
              ? "League Portfolio"
              : "Personal Portfolio",
          path: location.pathname,
        });
      }
    } else {
      breadcrumbs.push({ label: "Dashboard", path: "/dashboard" });
    }
  
    return breadcrumbs;
  };
  
  return (
    <SidebarProvider>
      <Sidebar>
        {/* Sidebar Header with Logo and Title */}
        <div className="flex items-center space-x-4 p-4 bg-green-600 text-white">
          <img src="/static/harpIcon.png" alt="Logo" className="w-8 h-8" />
          <span className="text-lg font-bold">Airgead Planner</span>
        </div>

        <nav className="flex flex-col space-y-2 p-4">
          {drawerItems.map((item) =>
            item.custom ? (
              <button
                key={item.label}
                className="flex items-center p-2 rounded hover:bg-green-600"
                onClick={item.onClick}
              >
                <item.icon className="mr-2" style={{ color: green[500] }} />
                {item.label}
              </button>
            ) : (
              <Link
                to={item.path || "#"}
                className={`flex items-center p-2 rounded ${
                  isActive(item)
                    ? "bg-green-700 text-white"
                    : "hover:bg-green-600"
                }`}
                key={item.path}
              >
                <item.icon className="mr-2" style={{ color: green[500] }} />
                {item.label}
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
              {getBreadcrumbItems().map((crumb, index, arr) => (
                <><BreadcrumbItem key={index}>
                  {index === arr.length - 1 ? (
                    crumb.label
                  ) : (
                    <Link to={crumb.path}>{crumb.label}</Link>
                  )}
                </BreadcrumbItem><BreadcrumbSeparator /></>
              ))}
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
