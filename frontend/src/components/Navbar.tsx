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
import SavingsIcon from '@mui/icons-material/Savings';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import LogoutIcon from '@mui/icons-material/Logout';
import Axios from './Axios';
import { useNavigate } from 'react-router-dom';


const drawerWidth = 300;
const color = 'rgba(6,170,19,0.8477591720281863)';
const gradient = 'linear-gradient(333deg, rgba(132,250,142,0.71) 0%, rgba(6,170,19,0.85) 50%, rgba(21,94,27,1) 100%)';

interface NavBarProps {
  content: React.ReactNode;
}

export default function NavBar({ content }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const logoutUser = () => {
    Axios.post(`logoutall/`, {
    }).then(() => {
        localStorage.removeItem('Token');
        navigate(`/`);
    })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1,
      //backgroundColor: 'rgb(7, 148, 0)',
      background: 'linear-gradient(333deg, rgba(132,250,142,0.710504270067402) 0%, rgba(6,170,19,0.8477591720281863) 50%, rgba(21,94,27,1) 100%)',
      }}>
        <Toolbar>
            <img src="/src/assets/harpIcon.png" alt="Harp Icon" style={{ width: 40, height: 40, marginRight: 16 }} />
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
          selected: { backgroundColor: 'rgba(6,170,19,0.8477591720281863)'}
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
            <ListItem key={1} disablePadding>
            <ListItemButton
                component={Link}
                to="/home"
                selected={location.pathname === "/home"}
                sx={{
                    backgroundImage: location.pathname === "/home" ? gradient : 'none',
                    backgroundSize: 'cover'
                }}
                >
                    <ListItemIcon>
                        <HomeIcon sx={{color: color}} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
            </ListItem>

            <ListItem key={2} disablePadding>
                <ListItemButton component={Link} to={"budget"} selected={"/budget" === location.pathname}
                    sx={{
                        backgroundImage: location.pathname === "/budget" ? gradient : 'none',
                        backgroundSize: 'cover'
                      }}>
                    <ListItemIcon>
                        <PieChartIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="Budget" />
                </ListItemButton>
            </ListItem>

            <ListItem key={3} disablePadding>
                <ListItemButton component={Link} to={"savings"} selected={"/savings" === location.pathname}
                    sx={{
                        backgroundImage: location.pathname === "/savings" ? gradient : 'none',
                        backgroundSize: 'cover'
                      }}>
                    <ListItemIcon>
                        <SavingsIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="Savings" />
                </ListItemButton>
            </ListItem>

            <ListItem key={4} disablePadding>
                <ListItemButton component={Link} to={"pensions"} selected={"/pensions" === location.pathname}
                    sx={{
                        backgroundImage: location.pathname === "/pensions" ? gradient : 'none',
                        backgroundSize: 'cover'
                    }}>
                    <ListItemIcon>
                        <TrendingUpIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="Pension Strategies" />
                </ListItemButton>
            </ListItem>

            <ListItem key={5} disablePadding>
                <ListItemButton component={Link} to={"stocksim"} selected={"/stocksim" === location.pathname}
                    sx={{
                        backgroundImage: location.pathname === "/stocksim" ? gradient : 'none',
                        backgroundSize: 'cover'
                    }}>
                    <ListItemIcon>
                        <SsidChartIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="Stock Market Simulator"/>
                </ListItemButton>
            </ListItem>

            <ListItem key={6} disablePadding>
                <ListItemButton component={Link} to={"news"} selected={"/news" === location.pathname}
                    sx={{
                        backgroundImage: location.pathname === "/news" ? gradient : 'none',
                        backgroundSize: 'cover'
                    }}>
                    <ListItemIcon>
                        <NewspaperIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="News For You" />
                </ListItemButton>
            </ListItem>

            <ListItem key={7} disablePadding>
                <ListItemButton component={Link} to={"loans"} selected={"/loans" === location.pathname}
                    sx={{
                        backgroundImage: location.pathname === "/loans" ? gradient : 'none',
                        backgroundSize: 'cover'
                    }}>
                    <ListItemIcon>
                        <TrendingDownIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="Loan Repayment Calculator" />
                </ListItemButton>
            </ListItem>

            <ListItem key={8} disablePadding>
                <ListItemButton onClick={logoutUser}>
                    <ListItemIcon>
                        <LogoutIcon sx={{color: color}}/>
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
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
