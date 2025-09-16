import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, IconButton, TextField, InputAdornment, MenuItem,
  Select, Chip, Avatar, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "../context/UserContext";

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

const Subscribers = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState(null); // or orgOptions[0] for default
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((user) => user.id));
    } else {
      setSelected([]);
    }
  };

  const { user } = useUser();
const [loading, setLoading] = useState(true);


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
      const response = await fetch(`${API_URL}prayer-subscriber-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: search,
          organization: organization?.id || null,
          page: page,
          pageSize: pageSize
        })
      });
      const data = await response.json();
      setUsers(data.data);
      setTotalItems(data.totalCount);
      setTotalPages(data.totalPages);

       } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [organization,search,page,pageSize]);

  
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
          <Typography variant="h5" fontWeight={700}>Subscribers Management</Typography>
          <Typography variant="body2" color="text.secondary">
           Manage subscriber profiles, plans, and access control.
          </Typography>
        </Box>
      </Box>



   <Paper sx={{ p: 4, border: "1px solid #e0e0e0" }}>
  {/* Top Bar: Heading (left) and Filters + Button (right) */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
    {/* Left Side: Heading */}
    <Typography variant="h5" color="text.secondary">
      All Subscribers
    </Typography>

    {/* Right Side: Filters and Add Button */}
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField
        size="small"
        placeholder="Search by user or prayer..."
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

    
    </Box>
  </Box>
</Paper>
      {/* Table */}
      <Paper>
        <TableContainer>




          <Table>
            <TableHead>
              <TableRow>
              
                <TableCell>User</TableCell>
                 <TableCell>Prayer</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Joined</TableCell>
                {user?.role === 1 && (
                  <TableCell>Organization</TableCell>
                )}
             
              </TableRow>
            </TableHead>
            <TableBody>
  {users.length > 0 ? (
    users.map((user) => (
      <TableRow key={user.id} hover>
       
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
        
        <TableCell>
           {user.session_prayers.title ? user.session_prayers.title : "N/A"}
        </TableCell>
        <TableCell>
          {user.time_slots.from_slot ? user.time_slots.from_slot : "N/A"}
        </TableCell>
        
        <TableCell>{formatDate(user.created_at)}</TableCell>
        {user?.role === 1 && (
                 <TableCell>{user.origanisation.org_name}</TableCell>
                 )}
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
     
    </Box>
  );
};

export default Subscribers;