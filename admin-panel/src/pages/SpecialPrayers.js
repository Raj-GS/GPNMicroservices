import React, { useState,useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,RadioGroup,Radio,Paper,Pagination,Dialog, DialogTitle, DialogContent,FormControl,InputLabel,Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "../context/UserContext";
import DOMPurify from 'dompurify';
import PageLoader from "../components/PageLoader";

import { useLocation, useNavigate, Outlet } from 'react-router-dom';


// Function to strip HTML and decode HTML entities
const stripHtml = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(html); // prevents XSS
  return tempDiv.textContent || tempDiv.innerText || '';
};


const SpecialPrayers = () => {

  const [search, setSearch] = useState("");
const [devotionType, setDevotionType] = useState(true); // default to true or false based on your app
  const [page, setPage] = useState(1);

  const [fromDate,setFromDate] = useState("");
  const [toDate,setToDate]  = useState("");
  const [filterCategory, setFilterCategory] = useState("");


  const [organization, setOrganization] = useState(null); // or orgOptions[0] for default
  const [devotionList, setDevotionList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);


  const [PostDate, setPostDate] = useState('');
  const [Title, setTitle] = useState('');
  const [Dailydeovotion, setDailydeovotion] = useState('');
  const [Quote, setQuote] = useState('');
  const [Author, setAuthor] = useState('');
  const [categories, setCategories] = useState([]);

const [prayForNationEnabled, setPrayForNationEnabled] = useState(false);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
     const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   
    // Modal open/close
  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

    const handleEdit = (id) => {
        navigate('/admin/edit-special-prayer/'+id)
  };
  useEffect(() => {
    const fetchUsers = async () => {


       try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}special-prayer-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: search,
          organization: organization?.id || null,
          page: page,
          fromDate:fromDate,
          toDate:toDate
        })
      });
      const data = await response.json();
      setDevotionList(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);

       } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }

   //   setDevotionType(data.settings.hdailydevotiondefault === 'yes');
   //   setDevotionType(data.settings.hdailydevotiondefault)
    };
    fetchUsers();
  }, [fromDate, toDate, organization,search,page]);

const handleViewDialogClose = () => {

      setEditUser(null);

}






const SaveDevotionSettings= async () => {


 const token = localStorage.getItem('token');

 const response = await fetch(`${API_URL}update-devotion-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
        devotionType: devotionType,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Settings updated successfully");
     window.location.reload();
    } else {
     alert((data?.message || 'Unknown error'));
    }

}

const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Do you want to delete this prayer?");
  if (!confirmDelete) return;

  try {
       setLoading(true);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}delete-special-prayer`, {
      method: 'POST', // You're using POST instead of DELETE
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Devotion deleted successfully");
      window.location.reload(); // Optional: replace with a state update if needed
    } else {
      alert(data?.message || 'Failed to delete devotion');
    }
  } catch (error) {
    console.error('Error deleting devotion:', error);
    alert('An unexpected error occurred');
  }
  finally {
        setLoading(false);
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
    <Box sx={{ p: 4 }}>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Special Prayers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                 Manage and offer focused prayers for special needs and occasions.
                </Typography>
              </Box>
              </Box>







  {/* FILTERS BAR */}
<Grid item xs={12}>
  <Paper sx={{ p: 4, mb: 1, backgroundColor: "#fff" }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* Left Side: Filters */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ flexBasis: "100%" }}>
          All Special Prayers
        </Typography>

        <TextField
          size="small"
          placeholder="Search by Title"
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
            ),
          }}
          sx={{ width: 220 }}
        />

        {/* <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filterCategory}
            label="Category"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <TextField
          size="small"
          label="From Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={{ minWidth: 160 }}
        />

        <TextField
          size="small"
          label="To Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={{ minWidth: 160 }}
        />
      </Box>

{/* Right Side: Settings + Add Button */}
<Box
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 2,
    alignItems: "flex-end",
    minWidth: 220,
  }}
>
  {/* Pray for Nation Toggle + View Button */}
  <Box
    sx={{
      backgroundColor: "#E3F2FD", // light blue
      padding: 1.5,
      borderRadius: 2,
      border: "1px solid #90CAF9", // blue[300]
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      alignItems: "flex-start",
      width: "100%",
    }}
  >
    <FormControlLabel
      control={
        <Switch
          checked={prayForNationEnabled}
          onChange={(e) => setPrayForNationEnabled(e.target.checked)}
          color="primary"
        />
      }
      label="Pray for the Nation"
      sx={{ fontWeight: "bold" }}
    />

    <Button
      variant="outlined"
      size="small"
      sx={{ alignSelf: "flex-end" }}
      onClick={() => navigate("/admin/view-pray-for-nation")}
    >
      View
    </Button>
  </Box>

  {/* Add Special Prayer */}
  <Box sx={{ padding: 1 }}>
    <Button
      variant="contained"
      sx={{ backgroundColor: "#177373" }}
      startIcon={<AddIcon />}
      onClick={() => navigate("/admin/add-special-prayer")}
    >
      Add Special Prayer
    </Button>
  </Box>
</Box>



    </Box>
  </Paper>
</Grid>



  {/* DEVOTION CARDS */}

<Box
  display="flex"
  
  flexWrap="wrap"
  gap={2}
>
  {devotionList.map((devotion) => (
    <Card
      key={devotion.id}
      variant="outlined"
      sx={{
        flex: "1 1 calc(33.333% - 16px)", // 3 cards per row
        minWidth: "250px",                // Minimum card width
      }}
    >
        <CardContent>
          {/* <Typography variant="caption" color="textSecondary">
            {devotion.source}
          </Typography> */}
          <Typography variant="subtitle1" fontWeight="bold">
            {devotion.title}

            {/* <Chip 
                                label={
                                  devotion.status === "active"
                                    ? "Active"
                                    : "Deleted"
                                }
                                size="small"
                                color={
                                   devotion.status === "active"
                                    ? "success"
                                    : "error"
                                }
                              /> */}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
  {stripHtml(devotion.description).slice(0, 200)}...
</Typography>
          {/* <Typography variant="caption" color="textSecondary">
            {devotion.verse}
          </Typography> */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Typography variant="caption">
              {new Date(devotion.created_at).toLocaleDateString()}
            </Typography>

            {devotion.status=='active' && (
            <Box>
              <IconButton size="small" onClick={() => handleEdit(devotion.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(devotion.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            )}
          </Box>
        </CardContent>
      </Card>
  ))}

    <Box display="flex" justifyContent="center" mt={3} width="100%">
      <Pagination
        count={totalPages}
        page={page}
        onChange={(e, value) => setPage(value)}
      />
    </Box>
  </Box>

   

      </Box>
  );
};

export default SpecialPrayers;
