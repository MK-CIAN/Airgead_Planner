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
  PiggyBank,
  TrendingUp,
  LineChart,
  Newspaper,
  TrendingDown,
  Calculator,
  FileChartPie,
  LogOut,
} from "lucide-react";
import TooltipToggle from "./UserServices/TooltipToggle";

type DrawerItem = {
  path?: string;
  label: string;
  icon?: React.ElementType;
  subPaths?: string[]; // Optional sub-paths
  custom?: boolean;
  onClick?: () => void;
};

export default function Navigation({ content }: { content: React.ReactNode }) {
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
      subPaths: ["/budget/monthly-budget", "/budget/custom-budget"],
    },
    {
      path: "/savings",
      label: "Savings",
      icon: PiggyBank,
      subPaths: ["/savings/"],
    },
    { path: "/pensions", label: "Pension Planner", icon: TrendingUp },
    {
      path: "/stocksimlanding",
      label: "Stock Market Simulator",
      icon: LineChart,
      subPaths: [
        "/stocksim?portfolio_type=league",
        "/stocksim?portfolio_type=personal",
      ],
    },
    { path: "/news", label: "News For You", icon: Newspaper },
    {
      path: "/loans",
      label: "Loan Repayment Calculator",
      icon: TrendingDown,
      subPaths: ["/loans/loan-details/"],
    },
    { path: "/income", label: "Income Tax Calculator", icon: Calculator },
    {
      path: "/financial-suggestions",
      label: "Financial Insights",
      icon: FileChartPie,
    },
    { custom: true, label: "Logout", icon: LogOut, onClick: logoutUser },
  ];

  const isActive = (item: DrawerItem) => {
    const basePath = location.pathname.split("?")[0]; // Extract base path (ignore query)
    const queryParams = new URLSearchParams(location.search);

    const matchesPath = item.path
      ? basePath.startsWith(item.path) // Match base path
      : false;

    const matchesSubPath = item.subPaths
      ? item.subPaths.some((subPath) => {
          const subBasePath = subPath.split("?")[0]; // Extract base path of subPath
          const subQueryParams = subPath.includes("?")
            ? new URLSearchParams(subPath.split("?")[1])
            : null;

          // Base path must match
          if (basePath !== subBasePath) return false;

          // If subPath has query params, ensure they match
          if (subQueryParams) {
            for (const [key, value] of subQueryParams.entries()) {
              if (queryParams.get(key) !== value) {
                return false; // Query params don't match
              }
            }
          }
          return true; // Path and query params match
        })
      : false;

    return matchesPath || matchesSubPath;
  };

  const getBreadcrumbItems = () => {
    const basePath = location.pathname.split("?")[0]; // Remove query parameters
    const queryParams = new URLSearchParams(location.search);
    let breadcrumbs = [{ label: "Airgead Planner", path: "/home" }];

    // Handle Budget Pages
    if (basePath.startsWith("/budget")) {
      breadcrumbs.push({ label: "Budgets", path: "/budget" });

      if (basePath === "/budget/monthly-budget") {
        breadcrumbs.push({ label: "Monthly Budget", path: basePath });
      } else if (basePath.startsWith("/budget/custom-budget/")) {
        breadcrumbs.push({ label: "Custom Budget", path: "" });
      }
    }
    // Handle Loan Pages
    else if (basePath.startsWith("/loans")) {
      breadcrumbs.push({ label: "Loans", path: "/loans" });

      if (basePath.startsWith("/loans/loan-details/")) {
        breadcrumbs.push({ label: "Loan Details", path: "" });
      }
    }
    // Handle Savings Pages
    else if (basePath.startsWith("/savings")) {
      breadcrumbs.push({ label: "Savings", path: "/savings" });

      if (/^\/savings\/\d+$/.test(basePath)) {
        breadcrumbs.push({ label: "Savings Goal", path: "/savings" });
      }
    }
    // Handle Stock Market Simulator (existing functionality)
    else if (basePath.startsWith("/stocksim")) {
      breadcrumbs.push({
        label: "Stock Market Simulator",
        path: "/stocksimlanding",
      });

      if (queryParams.has("portfolio_type")) {
        breadcrumbs.push({
          label:
            queryParams.get("portfolio_type") === "league"
              ? "League Portfolio"
              : "Personal Portfolio",
          path: location.pathname,
        });
      }
    }
    // Default case: Find a matching menu item
    else {
      let matchedItem = drawerItems.find(
        (item) =>
          basePath === item.path ||
          item.subPaths?.some((subPath) => basePath.startsWith(subPath))
      );

      if (matchedItem) {
        breadcrumbs.push({
          label: matchedItem.label,
          path: matchedItem.path ?? "#",
        });
      } else {
        // If no match, fallback to Dashboard
        breadcrumbs.push({ label: "Dashboard", path: "/dashboard" });
      }
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
                <item.icon className="mr-2 w-6 h-6 text-green-500" />
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
                <item.icon className="mr-2 w-6 h-6 text-green-500" />
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
                <>
                  <BreadcrumbItem
                    key={index}
                    className="text-xs sm:text-sm md:text-base"
                  >
                    {index === arr.length - 1 ? (
                      crumb.label
                    ) : (
                      <Link
                        to={crumb.path}
                        className="truncate max-w-[120px] sm:max-w-none"
                      >
                        {crumb.label}
                      </Link>
                    )}
                    {index < arr.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex-1 flex items-center justify-end space-x-4">
            <TooltipToggle />
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
