import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const NotificationDropdown = ({ unreadCount = 0, notifications = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
const API_URL = process.env.REACT_APP_API_URL;
const routes = {
  "Prayer": "public-prayers",
  "Testimony": "testimonies",
  "User Register": "/users",
  "Organization Register": "organizations",
  "Rider": "drivers"
};
  const handleNotification = async(id,module_id,title) => {


    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}readnotification`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        module_id: module_id,
        title:title
      }),
      });
      const data = await res.json();

      if (!res.ok) {
        // setError(data.message || "Failed to load notifications");
      } else {

        window.location.href = routes[title];



        // setNotifications(Array.isArray(data.notifications) ? data.notifications : []); // ✅ ensure array
        // setUnreadNotifyCount(data.unreadCount ?? 0); // ✅ ensure number
      }
    } catch (err) {
      console.error("Network error", err);
    }
  };


  return (
    <>
      <IconButton onClick={handleClick} sx={{ color: "#1a4a3a", mx: 2 }}>
        <Badge badgeContent={unreadCount || 0} color="primary">
          <NotificationsIcon sx={{ cursor: "pointer" }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400, borderRadius: 2, boxShadow: 3 },
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <Divider />

        {safeNotifications.length > 0 ? (
          safeNotifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => {

                handleNotification(n.id,n.module_id,n.title)

              
              }}
              sx={{ whiteSpace: "normal", alignItems: "flex-start" }}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {n.icon && <i className={n.icon} style={{ marginRight: 8 }}></i>}
                  {n.title}
                </Typography>
                <ListItemText
                  primary={n.message}
                  secondary={n.timestamp}
                  primaryTypographyProps={{ fontSize: "0.85rem" }}
                  secondaryTypographyProps={{ fontSize: "0.75rem", color: "gray" }}
                />
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default NotificationDropdown;
