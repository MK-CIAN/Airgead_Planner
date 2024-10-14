import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';


const drawerWidth = 300;

interface NavBarProps {
  content: React.ReactNode;
}

export default function NavBar({ content }: NavBarProps) {
  const location = useLocation();
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: 'rgb(7, 148, 0)',
      }}>
        <Toolbar>
          <Typography variant="h5" noWrap component="div">
            Airgead Planner
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
            <ListItem key={1} disablePadding>
                <ListItemButton component={Link} to={"/"} selected={"/" === location.pathname}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
            </ListItem>

            <ListItem key={2} disablePadding>
                <ListItemButton component={Link} to={"budget"} selected={"/budget" === location.pathname}>
                    <ListItemIcon>
                        <PieChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Budget" />
                </ListItemButton>
            </ListItem>

            <ListItem key={3} disablePadding>
                <ListItemButton component={Link} to={"loans"} selected={"/loans" === location.pathname}>
                    <ListItemIcon>
                        <TrendingDownIcon />
                    </ListItemIcon>
                    <ListItemText primary="Loan Repayment Calculator" />
                </ListItemButton>
            </ListItem>

            <ListItem key={4} disablePadding>
                <ListItemButton component={Link} to={"pensions"} selected={"/pensions" === location.pathname}>
                    <ListItemIcon>
                        <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText primary="Pension Strategies" />
                </ListItemButton>
            </ListItem>

            <ListItem key={5} disablePadding>
                <ListItemButton component={Link} to={"investments"} selected={"/investments" === location.pathname}>
                    <ListItemIcon>
                        <SsidChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Investment Guides"/>
                </ListItemButton>
            </ListItem>

            <ListItem key={6} disablePadding>
                <ListItemButton component={Link} to={"news"} selected={"/news" === location.pathname}>
                    <ListItemIcon>
                        <NewspaperIcon />
                    </ListItemIcon>
                    <ListItemText primary="News For You" />
                </ListItemButton>
            </ListItem>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
            {content}
      </Box>
    </Box>
  );
}
