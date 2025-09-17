import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, IconButton, TextField, InputAdornment, MenuItem,
  Select, Chip, Avatar, Dialog, DialogTitle, DialogContent,Menu,DialogActions
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useUser } from "../context/UserContext";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PageLoader from "../components/PageLoader";

const statusColors = {
    Accepted: "success",
  Pending: "warning",
  Declined: "default"
};


function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const Users = () => {
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [role, setRole] = useState("All Roles");
  const [selected, setSelected] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState(null); // or orgOptions[0] for default
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const { user } = useUser();
  const  [openViewDialog, setOpenViewDialog] = useState(false);
  const [Bulkstatus, setBulkstatus] = useState(1); // Default status for adding to My Songs
  const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];
  const API_URL = process.env.REACT_APP_API_URL || 'http://45.194.3.128:4000/api/admin/';
    const [loading, setLoading] = useState(true);
  
// Handle "Select All"
const handleSelectAll = (event) => {
  if (event.target.checked) {
    setSelected(users.map((user) => user.id)); // select all IDs
  } else {
    setSelected([]); // deselect all
  }
};

// Handle individual select
const handleSelect = (id) => {
  setSelected((prevSelected) => {
    if (prevSelected.includes(id)) {
      return prevSelected.filter((selectedId) => selectedId !== id);
    } else {
      return [...prevSelected, id];
    }
  });
};

// ✅ Derive selectedUsers from selected IDs
const selectedUsers = users
  .filter((user) => selected.includes(user.id))
  .map((user) => ({
    id: user.id,
    name: user.app_users.first_name + " " + user.app_users.last_name,
  }));


const BulkUpdateToUser = async () => {
  if (selected.length === 0) {
    alert("Please select at least one user.");
    return;
  }
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}bulk-update-users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      users: selected,
      status: Bulkstatus,
    }),
  });
  const data = await response.json();
  if (response.ok) {
    alert(Bulkstatus === 1 ? "Users verified successfully" : Bulkstatus === 2 ? "Users declined successfully" : Bulkstatus === 4 ? "Users activated successfully" : "Users deactivated successfully");
    setOpenViewDialog(false);
    setSelected([]);
  //  setselectedUsers([]);
    window.location.reload(); // Optional: replace with a state update if needed
  } else {
    alert(data?.message || 'Failed to update songs');
  }
};


  useEffect(() => {
    const fetchUsers = async () => {

       try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}users-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: search,
          status: status,
          role: role,
          organization: organization?.id || null,
          page: page,
          pageSize: pageSize
        })
      });
      const data = await response.json();
      setUsers(data.users);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);

       } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [status, role, organization,search,page,pageSize]);

useEffect(() => {
  const fetchRolesAndOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}roles-organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if response exists and is OK
      if (!response || !response.ok) {
        console.error("Failed to fetch roles and organizations", response);
        return;
      }

      const data = await response.json();
      setRoles(data.roles || []);
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error("Error fetching roles and organizations:", error);
    }
  };

  fetchRolesAndOrganizations();
}, []);


  const handleEdit = (id) => {
    setEditUser(users.find((user) => user.id === id));
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append("first_name", editUser.app_users.first_name);
    formData.append("last_name", editUser.app_users.last_name);
    formData.append("email", editUser.app_users.email);
    formData.append("phone", editUser.app_users.phone);
    formData.append("address", editUser.app_users.address);
    formData.append("gender", editUser.app_users.gender);
    formData.append("baptized", editUser.app_users.baptized);
    formData.append("date_of_birth", editUser.app_users.date_of_birth);
  
    // Only append logo if it's a File (not a string URL)
    if (editUser.app_users.profile_pic && editUser.app_users.profile_pic instanceof File) {
      formData.append("profile_pic", editUser.app_users.profile_pic);
    }
  
    formData.append("id", editUser.user_id);

    const response = await fetch(`${API_URL}update-user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      alert("User updated successfully");
      window.location.reload();
    } else {
      alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };
  const handleActivate = async (id,status) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}update-user-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id, status: status })
    });
    const data = await response.json();
    if (response.ok) {
      alert("User updated successfully");
      window.location.reload();
    } else {
      alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const handleSelectOption = (status) => {
    setOpenViewDialog(true);
    setBulkstatus(status);
}
const handleViewDialogClose = () => {
  setOpenViewDialog(false);
//  setSelectedSongs([]);
}



if(loading) {
return (
  <div>
    {/* <button onClick={fetchData}>Load Data</button> */}
    <PageLoader open={loading} />
  </div>
);
}



  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user accounts, approvals, and access permissions.
          </Typography>
        </Box>
      </Box>

      {/* Search and Filters */}
     <Paper sx={{ p: 3, border: "1px solid #e0e0e0" }}>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" color="text.secondary">
           Users List
          </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search users by name, email, or organization..."
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: 350 }}
          />
          <Select
            size="small"
            value={status}
            onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
            }}
            sx={{ width: 130 }}
          >
            <MenuItem value="All Status">All Status</MenuItem>
            <MenuItem value="Accepted">Active</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Declined">Inactive</MenuItem>
          </Select>

          <Select
            size="small"
            value={role}
            onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
            }}
            sx={{ width: 130 }}
          >
            <MenuItem value="All Roles">All Roles</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>{role.role}</MenuItem>
            ))}
          </Select>
            {user?.role === 1 && (

          <Autocomplete
  size="small"
  value={organization}
  onChange={(event, newValue) => {
    setOrganization(newValue);
    setPage(1);
  }}
  options={orgOptions}
  getOptionLabel={(option) => option?.org_name || ""}
  renderInput={(params) => <TextField {...params} label="Organization" />}
  sx={{ width: 230 }}
  isOptionEqualToValue={(option, value) => option.id === value.id}
/>
            )}
          {/* <Button variant="contained" startIcon={<AddIcon />}>Add User</Button>
          <Button variant="outlined" startIcon={<ExportIcon />}>Export</Button> */}
        </Box>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">

                  <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={selected.length === users.length}
                        indeterminate={selected.length > 0 && selected.length < users.length}
                        onChange={handleSelectAll}
                      />
                      <IconButton size="small" onClick={handleMenuOpen}>
                        <ArrowDropDownIcon />
                      </IconButton>
                
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => { handleSelectOption(1); handleMenuClose(); }}> 
                          Background Verify
                        </MenuItem>
                        <MenuItem onClick={() => { handleSelectOption(2); handleMenuClose(); }}>
                          Background Decline
                        </MenuItem>

                         <MenuItem onClick={() => { handleSelectOption(4); handleMenuClose(); }}> 
                          Account Activate
                        </MenuItem>
                        <MenuItem onClick={() => { handleSelectOption(5); handleMenuClose(); }}>
                        Account Deactivate
                        </MenuItem>
                        
                      </Menu>
                    </Box>



                </TableCell>
                <TableCell>USER</TableCell>
                <TableCell>ORGANIZATION</TableCell>
                <TableCell>ROLE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>JOINED</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {users.length > 0 ? (
    users.map((user) => (
      <TableRow key={user.id} hover>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected.includes(user.id)}
            onChange={() => handleSelect(user.id, user.app_users.first_name + " " + user.app_users.last_name)}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user.app_users.profile_pic ? (
                <Avatar
                  src={user.app_users.profile_pic}
                  alt={user.app_users.first_name}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "#f3f4f6",
                    color: "#1a4a3a",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                  imgProps={{
                    onError: (e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                    },
                  }}
                >
                  {user.app_users.first_name?.[0]?.toUpperCase() || "?"}
                </Avatar>
              ) : (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "#f3f4f6",
                    color: "#1a4a3a",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {user.app_users.first_name?.[0]?.toUpperCase() || "?"}
                </Avatar>
              )}
            </Box>
            <Box>
              <Typography fontWeight={600}>
                {user.app_users.first_name} {user.app_users.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.app_users.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>{user.origanisation.org_name}</TableCell>
        <TableCell>{user.roles.role}</TableCell>
        <TableCell>
          <Chip
            label={
              user.account_status === "Accepted"
                ? "Active"
                : user.account_status === "Pending"
                ? "Inactive"
                : "Inactive"
            }
            color={statusColors[user.account_status]}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </TableCell>
        <TableCell>{formatDate(user.created_at)}</TableCell>
        <TableCell>
          {user.account_status === "Pending" && (
            <>
              <IconButton title="Approve">
                <CheckIcon color="success" fontSize="small" />
              </IconButton>
              <IconButton title="Decline">
                <CloseIcon color="error" fontSize="small" />
              </IconButton>
            </>
          )}
          {/* <IconButton title="View">
            <VisibilityIcon fontSize="small" />
          </IconButton> */}
          <IconButton title="Edit" onClick={() => handleEdit(user.id)}>
            <EditIcon fontSize="small" />
          </IconButton>
          {user.account_status === "Declined" ? (
            <IconButton title="Activate" onClick={() => handleActivate(user.id,'Accepted')}>
              <PersonAddIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton title="Suspend" onClick={() => handleActivate(user.id,'Declined')}>
              <PersonOffIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton title="More">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} sx={{ textAlign: "center" }}>
        No users found
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>
        </TableContainer>
        {/* Pagination */}
        {totalItems > 0 && (
            <>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="body2">
                Showing {page * pageSize - pageSize + 1}-{Math.min(page * pageSize, totalItems)} of {totalItems}
          </Typography>
          <Box>
            <Button variant="outlined" sx={{ minWidth: 40, mx: 1 }} onClick={() => setPage(page - 1)} disabled={page === 1}>{'<'}</Button>
            <Button variant="contained" sx={{ minWidth: 40, mx: 1 }} onClick={() => setPage(page)}>{page}</Button>
            <Button variant="outlined" sx={{ minWidth: 40, mx: 1 }} onClick={() => setPage(page + 1)} disabled={page === totalPages}>{'>'}</Button>
          </Box>
        </Box>
      
     
        </>

)}
      </Paper>
      {editUser && (
        <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
               
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="First Name" value={editUser.app_users.first_name} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, first_name: e.target.value } })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Last Name" value={editUser.app_users.last_name} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, last_name: e.target.value } })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Email" value={editUser.app_users.email} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, email: e.target.value } })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Phone" value={editUser.app_users.phone} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, phone: e.target.value } })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <Select label="Gender" value={editUser.app_users.gender} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, gender: e.target.value } })}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <Select label="Baptized" value={editUser.app_users.baptized} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, baptized: e.target.value } })}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Date of Birth" type="date" value={editUser.app_users.date_of_birth} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, date_of_birth: e.target.value } })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Address" value={editUser.app_users.address} onChange={(e) => setEditUser({ ...editUser, app_users: { ...editUser.app_users, address: e.target.value } })} />
                </Box>
               

                <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>Profile Picture</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  // If you want to preview or upload, handle here
                  setEditUser({ ...editUser, app_users: { ...editUser.app_users, profile_pic: file } });
                }
              }}
            />
            {/* Show current logo if exists */}
            {editUser.app_users.profile_pic && typeof editUser.app_users.profile_pic === "string" && (
              <Box sx={{ mt: 1 }}>
                <img src={editUser.app_users.profile_pic} alt="Logo" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }} />
              </Box>
            )}
          </Box>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}></Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}








<Dialog open={openViewDialog} onClose={handleViewDialogClose} fullWidth maxWidth="sm">
  <DialogTitle>
    {Bulkstatus === 1
      ? "Background Verify User List"
      : Bulkstatus === 2
      ? "Background Decline List"
      : Bulkstatus === 4
      ? "Account Activate List"
      : "Account Deactivate List"}
  </DialogTitle>
  <DialogContent>
    {selectedUsers.length === 0 && (
      <Typography variant="body2" color="text.secondary">
        No User selected.
      </Typography>
    )}
    {selectedUsers.map((user, index) => (
      <Typography key={user.id} variant="h6">
        {index + 1}. {user.name}
      </Typography>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleViewDialogClose}>Cancel</Button>
    <Button onClick={BulkUpdateToUser} variant="contained" color="primary">
      Submit
    </Button>
  </DialogActions>
</Dialog>












    </Box>
  );
};

export default Users;