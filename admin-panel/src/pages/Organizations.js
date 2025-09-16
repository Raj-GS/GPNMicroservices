import React, { useState,useEffect } from "react";
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, IconButton, TextField, InputAdornment, MenuItem,
  Select, Chip, Pagination, Dialog, DialogTitle, DialogContent,Menu,DialogActions
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Avatar from "@mui/material/Avatar";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const statusColors = {
    active: "success",
  inactive: "warning",
  pending: "error"
};


function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

const Organizations = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selected, setSelected] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const  [openViewDialog, setOpenViewDialog] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [Bulkstatus, setBulkstatus] = useState(1); // Default status for adding to My Songs
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  const handleEditOrganization = (org) => {
    setEditOrg(org);
  };
  
const selectedUsers = organizations
  .filter((organization) => selected.includes(organization.id))
  .map((organization) => ({
    id: organization.id,
    name: organization.org_name || "Unknown Organization",
  }));

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(organizations.map((org) => org.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const BulkUpdateToUser = async () => {
  if (selected.length === 0) {
    alert("Please select at least one user.");
    return;
  }
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}bulk-update-organizations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      organizations: selected,
      status: Bulkstatus,
    }),
  });
  const data = await response.json();
  if (response.ok) {
    alert(Bulkstatus === 1 ? "Organizations activated successfully" : "Organizations deactivated successfully");
    setOpenViewDialog(false);
    setSelected([]);
  //  setselectedUsers([]);
    window.location.reload(); // Optional: replace with a state update if needed
  } else {
    alert(data?.message || 'Failed to update songs');
  }
};

  useEffect(() => {
    const fetchOrganizations = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: search,
          status: status,
          page: page,
          pageSize: pageSize
        })
      });
      const data = await response.json();
      setOrganizations(data.organisations);
      setTotalOrganizations(data.totalCount);
      setTotalPages(data.totalPages);
    };
    fetchOrganizations();
  }, [page, pageSize, search, status]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };


  const handleStatusChange = async (id, status) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}update-organization-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: status, id: id })
    });
    const data = await response.json();
    if (response.ok) {
        alert("Status updated successfully");
        window.location.reload();
    
    } else {
      console.error('Failed to update status:', data);
    }
  };
  
  const handleEdit = (id) => {
    console.log(id);
  };
  const saveEdit = async () => {
    const formData = new FormData();
    formData.append("org_name", editOrg.org_name);
    formData.append("contact_person_name", editOrg.contact_person_name);
    formData.append("email", editOrg.email);
    formData.append("phone", editOrg.phone);
    formData.append("address", editOrg.address);
    formData.append("website", editOrg.website);
  
    // Only append logo if it's a File (not a string URL)
    if (editOrg.logo && editOrg.logo instanceof File) {
      formData.append("logo", editOrg.logo);
    }
  
    formData.append("id", editOrg.id);
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}sp-update-organization`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // ❌ Do NOT set 'Content-Type' when sending FormData
        },
        body: formData
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Organization updated successfully");
         window.location.reload();
      } else {
        console.error('Failed to update organization:', data);
        alert("Update failed: " + (data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error while updating:", error);
      alert("Something went wrong: " + error.message);
    }
  };
  

    
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


    const handleDialogClose = () => {
    setOpenViewDialog(false);
  };
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Organization Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all organizations, verify status, and perform bulk actions.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* <Button variant="contained" startIcon={<AddIcon />}>Add Organization</Button> */}
          {/* <Button variant="outlined" startIcon={<ImportExportIcon />}>Export</Button> */}
          {/* <Button variant="outlined" startIcon={<ImportExportIcon />}>Import</Button> */}
        </Box>
      </Box>


         <Paper sx={{ p: 4, border: "1px solid #e0e0e0" }}>
  {/* Top Bar: Heading (left) and Filters + Button (right) */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
    {/* Left Side: Heading */}
    <Typography variant="h5" color="text.secondary">
      All Organizations
    </Typography>

    {/* Right Side: Filters and Add Button */}
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField
          size="small"
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
<Select
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="All Status">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </Select>

    
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
                        checked={selected.length === organizations.length}
                        indeterminate={selected.length > 0 && selected.length < organizations.length}
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
                          Activate
                        </MenuItem>
                        <MenuItem onClick={() => { handleSelectOption(2); handleMenuClose(); }}>
                          Deactivate
                        </MenuItem>
                        
                      </Menu>
                    </Box>



                </TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

                {organizations.length > 0 ? (
              organizations.map((org) => (
                <TableRow key={org.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(org.id)}
                      onChange={() => handleSelect(org.id)}
                    />
                  </TableCell>
                  <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  {org.logo ? (
    <Avatar
      src={org.logo}
      alt={org.org_name}
      sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#f3f4f6", color: "#1a4a3a", fontWeight: 700, fontSize: 20 }}
      imgProps={{
        onError: (e) => { e.target.onerror = null; e.target.src = ""; }
      }}
    >
      {org.org_name?.[0]?.toUpperCase() || "?"}
    </Avatar>
  ) : (
    <Avatar
      sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#f3f4f6", color: "#1a4a3a", fontWeight: 700, fontSize: 20 }}
    >
      {org.org_name?.[0]?.toUpperCase() || "?"}
    </Avatar>
  )}
 
</Box>
<Box>
    <Typography fontWeight={600}>{org.org_name}{org.update_request=="Requested" && (
<Chip
                    label="Update Request"
                    size="small"
                    variant="outlined"
                    color="warning"
                  />

    ) }</Typography>
  </Box>
  </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{org.contact}</Typography>
                    <Typography variant="body2" color="text.secondary">{org.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{org.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.status}
                      color={statusColors[org.status]}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography>{formatDate(org.created_at)}</Typography>
                    <Typography variant="body2" color="text.secondary">{daysAgo(org.created_at)}</Typography>
                  </TableCell>
                  <TableCell>{org.total_users}</TableCell>
                  <TableCell>
  <IconButton title="Edit">
    <EditIcon fontSize="small" onClick={() => handleEditOrganization(org)} />
  </IconButton>
  {org.status === "pending" && (
    <>
      <IconButton title="Activate">
        <CheckCircleIcon color="success" fontSize="small" onClick={() => handleStatusChange(org.id, "active")} />
      </IconButton>
      <IconButton title="Inactivate" onClick={() => handleStatusChange(org.id, "inactive")}>
        <CancelIcon color="error" fontSize="small" />
      </IconButton>
    </>
  )}
  {org.status === "active" && (
    <IconButton title="Inactivate" onClick={() => handleStatusChange(org.id, "inactive")}>
      <CancelIcon color="error" fontSize="small" />
    </IconButton>
  )}
  {org.status === "inactive" && (
    <IconButton title="Activate" onClick={() => handleStatusChange(org.id, "active")}>
      <CheckCircleIcon color="success" fontSize="small" />
    </IconButton>
  )}
</TableCell>
                </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ textAlign: "center" }}>
              No Organizations found
            </TableCell>
          </TableRow>
        )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}

         {totalOrganizations > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="body2">
            Showing 1-10 of {totalOrganizations} organizations
          </Typography>
          <Pagination count={totalPages} page={page} siblingCount={1} boundaryCount={1} onChange={handlePageChange} />
        </Box>

         )}
      </Paper>


      {/* Edit Organization Dialog */}

      {editOrg && (
      <Dialog open={!!editOrg} onClose={() => setEditOrg(null)} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Organization {editOrg.update_request=="Requested" && (
<Chip
                    label="Update Request"
                    size="small"
                    variant="outlined"
                    color="warning"
                  />

    ) }</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Organization Name"
            value={editOrg.org_name || ""}
            onChange={(e) => setEditOrg({ ...editOrg, org_name: e.target.value })}
            fullWidth
          />
           {editOrg.update_request=="Requested" && (
           <Typography variant="subtitle1" color="primary">
                      <b>New Organization Name:</b> {editOrg.edit_org_table[0].org_name}
                    </Typography>

           )}
          <TextField
            label="Contact Name"
            value={editOrg.contact_person_name || ""}
            onChange={(e) => setEditOrg({ ...editOrg, contact_person_name: e.target.value })}
            fullWidth
          />

           {editOrg.update_request=="Requested" && (
           <Typography variant="subtitle1" color="primary">
                      <b>New Contact Name:</b> {editOrg.edit_org_table[0].contact_person_name}
                    </Typography>

           )}
          <TextField
            label="Contact Email"
            value={editOrg.email || ""}
            onChange={(e) => setEditOrg({ ...editOrg, email: e.target.value })}
            fullWidth
          />

           {editOrg.update_request=="Requested" && (
           <Typography variant="subtitle1" color="primary">
                      <b>Contact Email:</b> {editOrg.edit_org_table[0].email}
                    </Typography>

           )}
          <TextField
            label="Phone"
            value={editOrg.phone || ""}
            onChange={(e) => setEditOrg({ ...editOrg, phone: e.target.value })}
            fullWidth
          />

          {editOrg.update_request=="Requested" && (
           <Typography variant="subtitle1" color="primary">
                      <b>New Phone:</b> {editOrg.edit_org_table[0].phone}
                    </Typography>

           )}
          <TextField
            label="Address"
            value={editOrg.address || ""}
            onChange={(e) => setEditOrg({ ...editOrg, address: e.target.value })}
            fullWidth
          />

           {editOrg.update_request=="Requested" && (
           <Typography variant="subtitle1" color="primary">
                      <b>New Address:</b> {editOrg.edit_org_table[0].address}
                    </Typography>

           )}
          <TextField
            label="Website"
            value={editOrg.website || ""}
            onChange={(e) => setEditOrg({ ...editOrg, website: e.target.value })}
            fullWidth
          />

          {editOrg.update_request=="Requested" && (
           <Typography variant="subtitle1" color="primary">
                      <b>New Website:</b> {editOrg.edit_org_table[0].website}
                    </Typography>

           )}
          {/* Logo upload (optional, you can keep as text if you want) */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>Logo</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  // If you want to preview or upload, handle here
                  setEditOrg({ ...editOrg, logo: file });
                }
              }}
            />
            {/* Show current logo if exists */}
            {editOrg.logo && typeof editOrg.logo === "string" && (
              <Box sx={{ mt: 1 }}>
                <img src={editOrg.logo} alt="Logo" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }} />
              </Box>
            )}

           {editOrg.update_request === "Requested" && 
  editOrg.edit_org_table[0]?.logo &&
  typeof editOrg.edit_org_table[0]?.logo === "string" && (
    <Typography variant="subtitle1" color="primary">
      <b>New Logo:</b>  <img src={editOrg.edit_org_table[0]?.logo} alt="Logo" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }} />
    </Typography>
)}

          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditOrg(null)}>Cancel</Button>
          {editOrg.update_request == "Requested" ? (
            <>
           <Button onClick={saveEdit} variant="contained">Accept</Button>
          <Button onClick={saveEdit} variant="warning">Reject</Button>
</>
          )
          : 
          (
        <Button onClick={saveEdit} variant="contained">Save</Button>
          )
          }
      </DialogActions>
    </Dialog>
      )}





      {/* View Dialog for Bulk Actions */}

<Dialog open={openViewDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
  <DialogTitle>
    {
      Bulkstatus === 1
      ? "Activate List"
      : "Deactivate List"}
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
    <Button onClick={handleDialogClose}>Cancel</Button>
    <Button onClick={BulkUpdateToUser} variant="contained" color="primary">
      Submit
    </Button>
  </DialogActions>
</Dialog>















    </Box>
  );
};

export default Organizations;