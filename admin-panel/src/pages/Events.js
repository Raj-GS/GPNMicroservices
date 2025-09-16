import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, IconButton, TextField, InputAdornment, MenuItem,
  Select, Chip, Avatar, Dialog, DialogTitle, DialogContent, Card,
    CardContent,
    CardActions, DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventIcon from '@mui/icons-material/Event';
import PageLoader from "../components/PageLoader";

import { useUser } from "../context/UserContext";
const statusColors = {
    Accepted: "success",
  Pending: "warning",
  Declined: "default"
};

function StatCard({ label, count, IconComponent }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", minWidth: 300, width: "100%", borderRadius: 2 }}>
      <CardContent sx={{ minHeight: 80 }}>
        <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
          <Box
            sx={{
              height: 48,
              width: 48,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              flexShrink: 0,
            }}
          >
            <IconComponent sx={{ fontSize: 28, color: '#177373' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight="bold" noWrap>
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const Events = () => {
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
  const [AllEvents, SetAllEvents]=useState(0);
  const [UpcomingEvents, SetUpcomingEvents]=useState(0);
  const [ThisMonthEvents, SetThisMonthEvents]=useState(0);
  const [CompletedEvents, SetCompletedEvents]=useState(0);
  const [openDialog, setOpenDialog] = useState(false);



   const [loading, setLoading] = useState(true);

  const [eventName, seteventName] = useState('');
  const [startDate, setstartDate] = useState('');
  const [contactInfo, setcontactInfo] = useState('');
  const [contactEmail, SetcontactEmail]=useState('');
  const [contactNumber, SetcontactNumber]=useState('');
  const [url, Seturl]=useState('');
  const [description, Setdescription]=useState('');

  const [origanisation, SetOriganisation]=useState('');
const [image, Setimage] = useState({
  file: null,
  preview: '',
});


const API_URL = process.env.REACT_APP_API_URL;



  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };
  const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((user) => user.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchUsers = async () => {

       try {
       setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}event-list`, {
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
      setUsers(data.events);
      setTotalItems(data.total);
      setTotalPages(data.pagination,totalPages);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}roles-organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRoles(data.roles);
      setOrganizations(data.organizations);

      SetAllEvents(data.allEventsCount);
      SetUpcomingEvents(data.upcomingEventsCount);
      SetThisMonthEvents(data.thisMonthEventsCount);
      SetCompletedEvents(data.completedEventsCount);


    };

    fetchRolesAndOrganizations();
  }, []);

  const handleEdit = (id) => {
    setEditUser(users.find((user) => user.id === id));
  };



   const addNewEvent = async () => {
  const token = localStorage.getItem('token');

  // Validation
  if (
    eventName === '' ||
    startDate === '' ||
    contactInfo === '' ||
    contactEmail === '' ||
    contactNumber === '' ||
    !image.file
  ) {
    alert('All fields are required');
    return false;
  }

  const formData = new FormData();
  formData.append("event_name", eventName);
  formData.append("start_date", startDate);
  formData.append("contact_info", contactInfo);
  formData.append("contact_email", contactEmail);
  formData.append("contact_number", contactNumber);
  formData.append("url", url);
  formData.append("description", description); // Not editUser.description

  // Append image file
  formData.append("profile_pic", image.file);

  try {
    const response = await fetch(`${API_URL}add-event`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't add Content-Type manually for FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert("Event added successfully");
      // window.location.reload();
    } else {
      alert("Add failed: " + (data?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error("Error while adding event:", error);
    alert("Something went wrong!");
  }
};


  const handleSaveEdit = async () => {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append("event_name", editUser.event_name);
    formData.append("start_date", editUser.start_date);
    formData.append("contact_info", editUser.contact_info);
    formData.append("contact_email", editUser.contact_email);
    formData.append("contact_number", editUser.contact_number);
    formData.append("url", editUser.url);
    formData.append("origanisation", editUser.org_id);
    formData.append("description", editUser.description);
    
    
  
    // Only append logo if it's a File (not a string URL)
    if (editUser.image && editUser.image instanceof File) {
      formData.append("profile_pic", editUser.image);
    }
  
    formData.append("id", editUser.id);

    const response = await fetch(`${API_URL}update-event`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      alert("Event updated successfully");
    //  window.location.reload();
    } else {
    //  alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };


const handleViewDialogClose = () => {

      setEditUser(null);

}

const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Do you want to delete this event?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}delete-event`, {
      method: 'POST', // You're using POST instead of DELETE
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Event deleted successfully");
      window.location.reload(); // Optional: replace with a state update if needed
    } else {
      alert(data?.message || 'Failed to delete devotion');
    }
  } catch (error) {
    console.error('Error deleting devotion:', error);
    alert('An unexpected error occurred');
  }
};

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
          <Typography variant="h5" fontWeight={700}>Event Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and organize church events and activities.
          </Typography>
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        gap={2}
        mb={2}
        width="100%"
      >


        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="Total Events" count={AllEvents} IconComponent={EventIcon} />
        </Box>
        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="Upcoming" count={UpcomingEvents} IconComponent={PendingActionsIcon} />
        </Box>
        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="This month" count={ThisMonthEvents} IconComponent={CheckCircleIcon} />
        </Box>
        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="Completed Events" count={CompletedEvents} IconComponent={CancelIcon} />
        </Box>
      </Box>


          <Paper sx={{ p: 4, border: "1px solid #e0e0e0" }}>
  {/* Top Bar: Heading (left) and Filters + Button (right) */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
    {/* Left Side: Heading */}
    <Typography variant="h5" color="text.secondary">
      All Events
    </Typography>

    {/* Right Side: Filters and Add Button */}
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField
        size="small"
        placeholder="Search by event"
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
        sx={{ width: 250 }}
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
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="deleted">Deleted</MenuItem>
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

      <Button variant="contained"  onClick={handleDialogOpen} startIcon={<AddIcon />} sx={{background: '#177373'}}>
        Add Event
      </Button>
    </Box>
  </Box>
</Paper>

      {/* Table */}
      <Paper>

        
        <TableContainer>




          <Table>
            <TableHead>
              <TableRow>
              
                <TableCell>Event</TableCell>
                <TableCell>Date & Time</TableCell>
                 <TableCell>Address</TableCell>
                 {user?.role === 1 && (
                 <TableCell>ORGANIZATION</TableCell>
                 )}
                  <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {users.length > 0 ? (
    users.map((user) => (
      <TableRow key={user.id} hover>
      
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user.image ? (
                <Avatar
                  src={user.image}
                  alt={user.event_name}
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
                  {user.event_name?.[0]?.toUpperCase() || "?"}
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
                  {user.event_name?.[0]?.toUpperCase() || "?"}
                </Avatar>
              )}
            </Box>
            <Box>
              <Typography fontWeight={600}>
                {user.event_name} 
              </Typography>
              <Typography variant="body2" color="text.secondary">
  {user.description?.slice(0, 50)}....
</Typography>

            </Box>
          </Box>
        </TableCell>
      
        <TableCell>{user.start_date}</TableCell>
       
        <TableCell>{user.contact_info}</TableCell>
          {user?.role === 1 && (
          <TableCell>{user.origanisation.org_name}</TableCell>
          )}

           <TableCell>
<Chip
  label={
    user.deleted_at !== null
      ? "Deleted"
      : new Date(user.start_date) > new Date()
      ? "Upcoming"
      : new Date(user.start_date) < new Date()
      ? "Completed"
      : "Active"
  }
  color={statusColors[user.status]}
  size="small"
  sx={{ fontWeight: 600 }}
/>


        </TableCell>
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

          <IconButton size="small" onClick={() => handleDelete(user.id)}>
                          <DeleteIcon fontSize="small" />
          </IconButton>


        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} sx={{ textAlign: "center" }}>
        No Events found
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
            <Button  variant="contained" sx={{ minWidth: 40, mx: 1, background: '#177373' }} onClick={() => setPage(page)}>{page}</Button>
            <Button variant="outlined" sx={{ minWidth: 40, mx: 1 }} onClick={() => setPage(page + 1)} disabled={page === totalPages}>{'>'}</Button>
          </Box>
        </Box>
 
        </>

)}
      </Paper>
      {editUser && (
        <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
               
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
<TextField
  label="Event"
  value={editUser.event_name}
  onChange={(e) =>
    setEditUser({ ...editUser, event_name: e.target.value })
  }
/>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
  <TextField
    label="Start Date"
    type="datetime-local"
    value={editUser.start_date}
    onChange={(e) =>
      setEditUser({
        ...editUser,
        start_date: e.target.value,
      })
    }
    InputLabelProps={{
      shrink: true,
    }}
  />
</Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Description"   multiline
              rows={4} value={editUser.description}
               onChange={(e) => setEditUser({ ...editUser,description: e.target.value  })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Contact Email" value={editUser.contact_email} 
                    onChange={(e) => setEditUser({ ...editUser, contact_email: e.target.value  })} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Contact Number" value={editUser.contact_number}
                     onChange={(e) => setEditUser({ ...editUser, contact_number: e.target.value })} />
                </Box>

                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Address" value={editUser.contact_info} 
                    onChange={(e) => setEditUser({ ...editUser, contact_info: e.target.value })} />
                </Box>
                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="URL" value={editUser.url} 
                    onChange={(e) => setEditUser({ ...editUser, url: e.target.value })} />
                </Box>

              <Box>
  <Typography variant="body2" sx={{ mb: 0.5 }}>Image</Typography>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setEditUser((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
    }}
  />

  {/* Show uploaded preview or existing profile pic */}
  {editUser.imagePreview ? (
    <Box sx={{ mt: 1 }}>
      <img
        src={editUser.imagePreview}
        alt="Preview"
        style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }}
      />
    </Box>
  ) : (
    editUser.image && typeof editUser.image === 'string' && (
      <Box sx={{ mt: 1 }}>
        <img
          src={editUser.image}
          alt="Current"
          style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }}
        />
      </Box>
    )
  )}
</Box>

                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}></Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button onClick={handleViewDialogClose}>Cancel</Button> 
              
                <Button variant="contained" onClick={handleSaveEdit} sx={{background: '#177373'}}>Save</Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}









            <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
              <DialogTitle>Add Event</DialogTitle>
               <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
               
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
<TextField
  label="Event"
  value={eventName}
  onChange={(e) =>
    seteventName(e.target.value )
  }
/>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
  <TextField
    label="Start Date"
    type="datetime-local"
    value={startDate}
    onChange={(e) =>
      setstartDate(e.target.value )
    }
    InputLabelProps={{
      shrink: true,
    }}
  />
</Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Description"   multiline
              rows={4} value={description}
               onChange={(e) => Setdescription(e.target.value)} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Contact Email" value={contactEmail} 
                    onChange={(e) => SetcontactEmail( e.target.value)} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Contact Number" value={contactNumber}
                     onChange={(e) => SetcontactNumber(e.target.value)} />
                </Box>

                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Address" value={contactInfo} 
                    onChange={(e) => setcontactInfo(e.target.value)} />
                </Box>
                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="URL" value={url} 
                    onChange={(e) => Seturl(e.target.value )} />
                </Box>

              <Box>
  <Typography variant="body2" sx={{ mb: 0.5 }}>Image</Typography>

  <input
    type="file"
    accept="image/*"
   onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    Setimage({
      file: file,
      preview: URL.createObjectURL(file),
    });
  }
}}

  />

  {/* Show uploaded preview or existing profile pic */}
{image.preview && (
  <Box sx={{ mt: 1 }}>
    <img
      src={image.preview}
      alt="Preview"
      style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }}
    />
  </Box>
)}
</Box>

                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}></Box>
            </Box>
          
          </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button onClick={addNewEvent} variant="contained" color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>

    </Box>
  );
};

export default Events;