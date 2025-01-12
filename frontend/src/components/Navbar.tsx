import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";
import "../App.css";
import LogoutIcon from "@mui/icons-material/Logout";
import Axios from "./Axios";
import { useNavigate } from "react-router-dom";
import { IconButton, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import "../Styles/NavBar.css";

const drawerWidth = 300;
const color = "rgba(6,170,19,0.8477591720281863)";
const gradient =
  "linear-gradient(333deg, rgba(6,170,19,0.85) 5%, rgba(6,170,19,0.85) 40%, rgba(21,94,27,1) 100%)";

interface NavBarProps {
  content: React.ReactNode;
}

export default function NavBar({ content }: NavBarProps) {
  const [username, setUsername] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Detect screen size
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch the user's username
  useEffect(() => {
    Axios.get(`user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`, // Add the token to the request
      },
    })
      .then((response) => {
        setUsername(response.data.username); // Set the username from the response
      })
      .catch((error) => {
        console.error("Failed to fetch username:", error);
      });
  }, []);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const logoutUser = () => {
    Axios.post(`logoutall/`, {}).then(() => {
      localStorage.removeItem("Token");
      navigate(`/`);
    });
  };

  const drawerContent = (
    <Box sx={{ overflow: "auto" }}>
      {/* List of Navigation Items */}
      <ListItem key={1} disablePadding>
        <ListItemButton
          component={Link}
          to="/home"
          selected={location.pathname === "/home"}
          sx={{
            backgroundImage: location.pathname === "/home" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <HomeIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>

      <ListItem key={2} disablePadding>
        <ListItemButton
          component={Link}
          to="budget"
          selected={"/budget" === location.pathname}
          sx={{
            backgroundImage:
              location.pathname === "/budget" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <PieChartIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Budget" />
        </ListItemButton>
      </ListItem>

      <ListItem key={3} disablePadding>
        <ListItemButton
          component={Link}
          to="savings"
          selected={"/savings" === location.pathname}
          sx={{
            backgroundImage:
              location.pathname === "/savings" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <SavingsIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Savings" />
        </ListItemButton>
      </ListItem>

      <ListItem key={4} disablePadding>
        <ListItemButton
          component={Link}
          to="pensions"
          selected={"/pensions" === location.pathname}
          sx={{
            backgroundImage:
              location.pathname === "/pensions" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <TrendingUpIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Pension Strategies" />
        </ListItemButton>
      </ListItem>

      <ListItem key={5} disablePadding>
        <ListItemButton
          component={Link}
          to="stocksim"
          selected={"/stocksim" === location.pathname}
          sx={{
            backgroundImage:
              location.pathname === "/stocksim" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <SsidChartIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Stock Market Simulator" />
        </ListItemButton>
      </ListItem>

      <ListItem key={6} disablePadding>
        <ListItemButton
          component={Link}
          to="news"
          selected={"/news" === location.pathname}
          sx={{
            backgroundImage: location.pathname === "/news" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <NewspaperIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="News For You" />
        </ListItemButton>
      </ListItem>

      <ListItem key={7} disablePadding>
        <ListItemButton
          component={Link}
          to="loans"
          selected={"/loans" === location.pathname}
          sx={{
            backgroundImage: location.pathname === "/loans" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <TrendingDownIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Loan Repayment Calculator" />
        </ListItemButton>
      </ListItem>

      <ListItem key={8} disablePadding>
        <ListItemButton
          component={Link}
          to="income"
          selected={"/income" === location.pathname}
          sx={{
            backgroundImage:
              location.pathname === "/income" ? gradient : "none",
            backgroundSize: "cover",
          }}
        >
          <ListItemIcon>
            <TrendingDownIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Income Tax Calculator" />
        </ListItemButton>
      </ListItem>

      <ListItem key={9} disablePadding>
        <ListItemButton onClick={logoutUser}>
          <ListItemIcon>
            <LogoutIcon sx={{ color: color }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListItem>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: gradient,
        }}
      >
        <Toolbar className="navbar">
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <div className="navbar-title">
            <img
              src="/src/assets/harpIcon.png"
              alt="Harp Icon"
              style={{ width: 40, height: 40 }}
            />
            Airgead Planner
          </div>
          <div className="navbar-user">Hello, {username || "User"}</div>
        </Toolbar>
      </AppBar>

      {/* Permanent Drawer for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      )}

      {/* Temporary Drawer for Mobile */}
      {isMobile && (
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Improve mobile performance
          }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {/* Add Toolbar for spacing */}
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>{drawerContent}</Box>
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {content}
      </Box>
    </Box>
  );
}
