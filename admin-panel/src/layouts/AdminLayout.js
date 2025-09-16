import React, { useState,useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, CssBaseline, Divider, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Diversity3 from '@mui/icons-material/Diversity3';
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import EventIcon from '@mui/icons-material/Event';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { useUser } from "../context/UserContext";
import NotificationDropdown from '../components/NotificationDropdown ';
const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Languages', icon: <LanguageIcon />, path: '/admin/languages' },
  { label: 'Roles', icon: <EmojiPeopleIcon />, path: '/admin/roles' },
  { label: 'Roles & Permissions', icon: <EmojiPeopleIcon />, path: '/admin/roles-permissions' },
  { label: 'Organizations', icon: <GroupIcon />, path: '/admin/organizations' },
  { label: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  {
    label: 'Prayers',
    icon: <Diversity3 />,
    children: [
      { label: 'Prayer Categories', path: '/admin/prayer-categories' },
      { label: 'Public Prayers', path: '/admin/public-prayers' },
      { label: 'Private Prayers', path: '/admin/private-prayers' },
    ],
  },

  {
    label: 'Special Prayers',
    icon: <LocalFireDepartmentIcon />,
    children: [
      { label: 'Prayer Categories', path: '/admin/special-prayer-categories' },
      { label: 'Prayers', path: '/admin/special-prayers' },
      { label: 'Subscribers', path: '/admin/subscribers' },
    ],
  },


  { label: 'Testimonies', icon: <SpeakerNotesIcon />, path: '/admin/testimonies' },
  { label: 'Songs', icon: <LibraryMusicIcon />, path: '/admin/songs' },
  
  { label: 'Events', icon: <EventIcon />, path: '/admin/events' },
  { label: 'Daily Devotion', icon: <MenuBookIcon />, path: '/admin/daily-devotions' },
  { label: 'Drivers', icon: <DriveEtaIcon />, path: '/admin/drivers' },
  { label: 'Feedbacks', icon: <FeedbackIcon />, path: '/admin/feedback' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];


const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const isAvatarMenuOpen = Boolean(avatarMenuAnchor);
  const [openMenus, setOpenMenus] = useState({});
  const { user } = useUser();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
const [notifications, setNotifications] = useState([]);
const [unreadNotifyCount, setUnreadNotifyCount] = useState(0);


const API_URL = process.env.REACT_APP_API_URL;

  const handleAvatarClick = (event) => {
    setAvatarMenuAnchor(event.currentTarget);
  };
  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
  };
const handleToggleSubMenu = (label) => {
  setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
};

  const handleMenuItemClick = async (action) => {
    handleAvatarMenuClose();
    if (action === 'profile') {
      navigate('/admin/my-profile');
    } else if (action === 'change-password') {
      navigate('/admin/change-password');
    } else if (action === 'logout') {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };


const filteredNavItems = navItems.filter((item) => {
  // Check if the role is 1 for Languages → Organizations
  if (
    user?.role !== 1 &&
    ['Languages', 'Roles', 'Roles & Permissions', 'Organizations'].includes(item.label)
  ) {
    return false; // hide these for non-role-1 users
  }
  return true; // keep all others
});

useEffect(() => {
  const fetchNotications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        // setError(data.message || "Failed to load notifications");
      } else {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []); // ✅ ensure array
        setUnreadNotifyCount(data.unreadCount ?? 0); // ✅ ensure number
      }
    } catch (err) {
      console.error("Network error", err);
    }
  };

  fetchNotications();
}, []);


const drawer = (
  <Box sx={{ height: '100%', color: '#1a4a3a' }}>
    <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
      
      <img src={user?.role === 1 ? "https://glocalprayer.net/prayer/public/assets/img/gp-logo.png" : user?.organization_logo } height={40} width={40} />
      <Typography sx={{ fontWeight: 'bold', color: '#1a4a3a', letterSpacing: 1 }}>
        {user?.role === 1 ? 'Glocal Prayer Network' : user?.organization}
      </Typography>
    </Box>
    <List>
      {filteredNavItems.map((item) => {
        const isSelected = location.pathname === item.path;
        if (item.children) {
          const open = openMenus[item.label] || false;
          return (
            <React.Fragment key={item.label}>
              <ListItem
                button
                onClick={() => handleToggleSubMenu(item.label)}
                sx={{
                  color: '#1a4a3a',
                  '&:hover': {
                    background: 'rgba(250, 198, 134, 0.15)',
                    color: '#ff8c00',
                  },
                  pl: 3,
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((subItem) => (
                    <ListItem
                      key={subItem.label}
                      button
                      onClick={() => navigate(subItem.path)}
                      selected={location.pathname === subItem.path}
                      sx={{
                        pl: 5,
                        color: location.pathname === subItem.path ? '#ff8c00' : '#1a4a3a',
                        background: location.pathname === subItem.path
                          ? 'rgba(250, 198, 134, 0.08)'
                          : 'none',
                        '&:hover': {
                          background: 'rgba(250, 198, 134, 0.15)',
                          color: '#ff8c00',
                        },
                        borderLeft: location.pathname === subItem.path
                          ? '4px solid #ff8c00'
                          : '4px solid transparent',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 15, color: 'inherit' }}>
                        <FiberManualRecordIcon sx={{ fontSize: 10 }} />
                      </ListItemIcon>
                      <ListItemText primary={subItem.label} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        } else {
          return (
            <ListItem
              button
              key={item.label}
              selected={isSelected}
              onClick={() => navigate(item.path)}
              sx={{
                color: isSelected ? '#ff8c00' : '#1a4a3a',
                background: isSelected ? 'rgba(250, 198, 134, 0.08)' : 'none',
                '&:hover': {
                  background: 'rgba(250, 198, 134, 0.15)',
                  color: '#ff8c00',
                },
                borderLeft: isSelected ? '4px solid #ff8c00' : '4px solid transparent',
                pl: 3,
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          );
        }
      })}
    </List>
  </Box>
);


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <CssBaseline />
      {/* AppBar/Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: '#fff',
          color: '#1a4a3a',
          boxShadow: '0 2px 8px rgba(26,74,58,0.04)',
          borderBottom: '1px solid #e0e0e0',
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {/* <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: '#1a4a3a' }}>
            User Management
          </Typography> */}
          {/* Placeholder for actions (search, notifications, etc.) */}
          <Box sx={{ flexGrow: 1 }} />
          {/* Notification Icon */}
         
            <NotificationDropdown unreadCount={unreadNotifyCount} notifications={notifications} />

            {/* <NotificationsIcon sx={{ cursor: 'pointer', color: '#1a4a3a', mx: 2 }} /> */}
         
 <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
  <Avatar
    src={user?.profile_pic || "../assets/default-avatar.jpg"} // fallback image
    alt={user?.name || "User"}
    sx={{
      width: 40,
      height: 40,
      border: "2px solid #eee", // subtle border
      boxShadow: 1, // slight shadow for better UI
      transition: "transform 0.2s ease-in-out",
      "&:hover": {
        transform: "scale(1.1)", // hover zoom effect
        boxShadow: 3,
      },
    }}
  />
</IconButton>
          <Menu
            anchorEl={avatarMenuAnchor}
            open={isAvatarMenuOpen}
            onClose={handleAvatarMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleMenuItemClick('profile')}>My Profile</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('change-password')}>Change Password</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('logout')}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {/* Sidebar/Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}

        <Drawer
  variant="permanent"
  sx={{
    display: { xs: 'none', sm: 'block' },
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: drawerWidth,
      background: '#fff',        // changed to white
      color: '#1a4a3a',          // dark text
      borderRight: 'none',
    },
  }}
  open
>
  {drawer}
</Drawer>
      </Box>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 1,
          background: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
