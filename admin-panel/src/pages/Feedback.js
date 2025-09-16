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
import CloseIcon from "@mui/icons-material/Close";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useUser } from "../context/UserContext";
import ReviewsIcon from '@mui/icons-material/Reviews';
import PageLoader from "../components/PageLoader";

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


const Feedback = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState(null); // or orgOptions[0] for default
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useUser();
  const [AllEvents, SetAllEvents]=useState(0);
  const [UpcomingEvents, SetUpcomingEvents]=useState(0);
  const [ThisMonthEvents, SetThisMonthEvents]=useState(0);
  const [CompletedEvents, SetCompletedEvents]=useState(0);

  const [origanisation, SetOriganisation]=useState('');


  const [selected, setSelected] = useState([]);
const API_URL = process.env.REACT_APP_API_URL;

      const [loading, setLoading] = useState(true);


const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((user) => user.id));
    } else {
      setSelected([]);
    }
  };


  useEffect(() => {
    const fetchUsers = async () => {
        try {
       setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}feedback-list`, {
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
      setTotalItems(data.total);
      setTotalPages(data.pagination,totalPages);

           } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [organization,search,page,pageSize]);

  useEffect(() => {
    const fetchRolesAndOrganizations = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}roles-organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrganizations(data.organizations);

      SetAllEvents(data.allRating);
      SetUpcomingEvents(data.avgRating);
      SetThisMonthEvents(data.thismonthRating);


    };

    fetchRolesAndOrganizations();
  }, []);


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
          <Typography variant="h5" fontWeight={700}>Feedback Management</Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage feedback from members
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
          <StatCard label="Total Feedback" count={AllEvents} IconComponent={ReviewsIcon} />
        </Box>
        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="Avg rating" count={UpcomingEvents} IconComponent={StarIcon} />
        </Box>
        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="This Week" count={ThisMonthEvents} IconComponent={PendingActionsIcon} />
        </Box>
        {/* <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
          <StatCard label="Declined Drivers" count={CompletedEvents} IconComponent={CancelIcon} />
        </Box> */}
      </Box>

      <Paper sx={{ p: 4, border: "1px solid #e0e0e0" }}>
  {/* Top Bar: Heading (left) and Filters + Button (right) */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
    {/* Left Side: Heading */}
    <Typography variant="h5" color="text.secondary">
      Recent Feedback
    </Typography>

    {/* Right Side: Filters and Add Button */}
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField
        size="small"
        placeholder="Search by User or Feedback"
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

      {/* <Select
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        sx={{ width: 130 }}
      >
        <MenuItem value="All Status">All Status</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Approve">Approved</MenuItem>
        <MenuItem value="Decline">Declined</MenuItem>
      </Select> */}
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
                <TableCell>Rating</TableCell>
                 <TableCell>Feedback</TableCell>
                  <TableCell>Date</TableCell>
                 {user?.role === 1 && (
                 <TableCell>ORGANIZATION</TableCell>
                 )}
                  {/* <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell> */}
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
                  src={user.profile_pic}
                  alt={user.app_users.first_name + ' '+ user.app_users.last_name}
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
                {user.app_users.first_name + ' '+ user.app_users.last_name} 
              </Typography>
              <Typography variant="body2" color="text.secondary">
  {user.app_users.email}
</Typography>

            </Box>
          </Box>
        </TableCell>
      
       <TableCell>
  {Array.from({ length: 5 }).map((_, index) => {
    const full = Math.floor(user.rating);
    const half = user.rating % 1 >= 0.5;
    if (index < full) {
      return <StarIcon key={index} style={{ color: '#FFD700' }} />;
    } else if (index === full && half) {
      return <StarHalfIcon key={index} style={{ color: '#FFD700' }} />;
    } else {
      return <StarBorderIcon key={index} style={{ color: '#FFD700' }} />;
    }
  })}
</TableCell>
         <TableCell>{user.feedback}</TableCell>
       <TableCell>{user.created_at}</TableCell>

          {user?.role === 1 && (
          <TableCell>{user.origanisation.org_name}</TableCell>
          )}

         

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
    




    </Box>
  );
};

export default Feedback;