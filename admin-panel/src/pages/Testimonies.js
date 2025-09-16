import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  Autocomplete,Pagination
} from "@mui/material";
// ...existing code...
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';

import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from "../context/UserContext";
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

export default function Testimonies() {
  // Form states
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [requestText, setRequestText] = useState("");
  const [formError, setFormError] = useState("");

  // Modal and snackbar states
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Filter states
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSort, setFilterSort] = useState("");

  const [organizations, setOrganizations] = useState([]);
  const [myPrayers, setMyPrayers] = useState([]);


  const [organization, setOrganization] = useState(null);
  const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [publicPrayerRequests, setPublicPrayerRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [myPrayer, setMyPrayer] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [created_at, setCreated_at] = useState("");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const { user } = useUser();

  const [ActivePrayers, SetActivePrayers]=useState(0);
  const [PendingPrayers, SetPendingPrayers]=useState(0);
  const [DeclinePrayers, SetADeclinePrayers]=useState(0);

  const [editTestimonyId, setEditTestimonyId] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';

   const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

   const handleEdit = (testimony) => {
    setEditTestimonyId(testimony.id)
    setTitle(testimony.title)
    setDescription(testimony.description)
    setOpenEditDialog(true)

  };

   const handleDialogEditClose = () => {
    setOpenEditDialog(false);
    setFormError("");
  };

  const fetchCategories = async () => {
    // Replace this with your actual API call
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}all-prayer-categories?type=public`,{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();

    setCategories(data.data.categories);
    setOrganizations(data.data.organisations);
    setMyPrayers(data.data.prayerlist);

     SetActivePrayers(data.data.activetestimoniescount);
     SetPendingPrayers(data.data.pendingtestimoniescount);
     SetADeclinePrayers(data.data.rejectedtestimoniescount);
    

  };

  useEffect(() => {
    fetchPublicPrayerList();
  }, [page,filterCategory,filterSort,organization]);

  const fetchPublicPrayerList = async () => {

      try {
       setLoading(true);
    // Replace this with your actual API call
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}testimony-list`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: page,
        category: filterCategory,
        status: filterSort,
        organization: organization?.id || null,
      })
    });
    const data = await response.json();

    setPublicPrayerRequests(data.data);
    setTotalPages(data.pagination.totalPages);

  } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  





  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!myPrayer || !title.trim() || !requestText.trim()) {
      setFormError("Please select a prayer and title and enter your Testimony.");
      return;
    }


    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}add-testimony`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        PrayerId:myPrayer,
        title: title,
        description: requestText,
      }),
    });
    const data = await response.json();
    if(data.status === 200){
      fetchPublicPrayerList();
      setOpenDialog(false);
      window.location.reload();
    }else{
     setSnackbarOpen(true);
     setSnackbarMessage(data.message);
     setOpenDialog(false);
      fetchPublicPrayerList();
     window.location.reload();
    }


  };


  const handleUpdateSubmit = async (e) => {
    e.preventDefault();


    if (!title.trim() || !description.trim()) {
      setFormError("title and enter your testimony.");
      return;
    }


    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}update-testimony`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id:editTestimonyId,
        title: title,
        description: description,
      }),
    });
    const data = await response.json();
    if(data.status === 200){
      fetchPublicPrayerList();
      setOpenDialog(false);
      window.location.reload();
    }else{
     setSnackbarOpen(true);
     setSnackbarMessage(data.message);
     setOpenDialog(false);
      fetchPublicPrayerList();
     window.location.reload();
    }


  };


  // Modal open/close
  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormError("");
  };


  

  // Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleViewPrayer = (req) => {
    setCategory(req.categories.name);
    setPriority(req.importance);
    setTitle(req.title);
    setDescription(req.description);
    setCreated_at(req.created_at);
    setOpenViewDialog(true);
  };
const handleViewDialogClose = () => {
  setOpenViewDialog(false);
}
  const handleApprovePrayer = async (id,status) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}approve-testimony`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        status: status,
      }),
    });
    const data = await response.json();
    if(data.status === 200){
      fetchPublicPrayerList();
      setOpenDialog(false);

      console.log('Hi I am if condition');
    }else{
      setSnackbarOpen(true);
      setSnackbarMessage(data.message);
     window.location.reload();
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
    <Box p={{ xs: 1, sm: 2, md: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Testimonies List
        </Typography>
       
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
 
    <StatCard
      label="Active Testimonies"
      count={ActivePrayers}
      IconComponent={VolunteerActivismIcon}
    />
  </Box>
        <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>

    <StatCard
      label="Pending Testimonies"
      count={PendingPrayers}
      IconComponent={PendingActionsIcon}
    />
  </Box>
         <Box flex={1} minWidth={{ xs: "100%", sm: "220px" }}>
 
    <StatCard
      label="Cancelled Testimonies"
      count={DeclinePrayers}
      IconComponent={CancelIcon}
    />
  </Box>
</Box>





  {/* FILTERS BAR */}
<Grid item xs={12}>
  <Paper sx={{ p: 4, mb: 1, backgroundColor: "#fff" }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* Heading on the left */}
      <Typography variant="h6">
        All Testimonies
      </Typography>

      {/* Filters on the right */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
         <FormControl size="small" sx={{ minWidth: 250 }}>
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
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterSort}
            label="Status"
            onChange={(e) => setFilterSort(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="0">Pending</MenuItem>
            <MenuItem value="1">Approved</MenuItem>
            <MenuItem value="2">Declined</MenuItem>
            <MenuItem value="3">Answered</MenuItem>
            <MenuItem value="4">Deleted</MenuItem>
          </Select>
        </FormControl>

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

        <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpen}
        sx={{ width: { xs: "100%", sm: "auto" ,background: '#177373'} } }
      >
        + Add Testimony
      </Button>

      </Box>
    </Box>
  </Paper>
</Grid>


      {/* Main Content */}





  {/* Requests */}
<Box
  display="flex"
  flexWrap="wrap"
  gap={2}
>
    {publicPrayerRequests.length === 0 ? (
      <Typography color="text.secondary" align="center">
        No prayer requests found.
      </Typography>
    ) : (

        publicPrayerRequests.map((req, idx) => (
       
                  <Card
                        key={req.id}
                        variant="outlined"
                        sx={{
                          flex: "1 1 calc(33.333% - 16px)", // 3 cards per row
                          minWidth: "250px",                // Minimum card width
                        }}
                      >
              <CardContent sx={{ flex: 1, minHeight: 0 }}>
                <Box display="flex" alignItems="center" mb={1} gap={1} flexWrap="wrap">
                  <Typography fontWeight="bold" noWrap>
                    {req.app_users.first_name} {req.app_users.last_name}
                  </Typography>
                  <Chip
                    label={req.categories.name}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={
                      req.status === 0
                        ? "Pending"
                        : req.status === 1
                        ? "Approved"
                        : req.status === 2
                        ? "Declined"
                        : "Deleted"
                    }
                    size="small"
                    color={
                      req.status === 0
                        ? "warning"
                        : req.status === 1
                        ? "success"
                        : req.status === 2
                        ? "error"
                        : "error"
                    }
                  />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {req.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {req.description}
                </Typography>
              </CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                px={1}
              >
                <Typography variant="caption" noWrap>
                  {new Date(req.created_at).toLocaleString()}
                </Typography>
              </Box>
              <CardActions sx={{ justifyContent: "flex-start", flexWrap: "wrap", p: 1, gap: 1 }}>

                 <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              flexShrink: 0,
            }}
          >

             <IconButton
                  color="primary"
                  size="small"
                    onClick={() => handleViewPrayer(req)}
                  aria-label="View"
                >
                  <VisibilityIcon />
                </IconButton>
          </Box>
               
               <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >
            
                 <IconButton title="Edit" onClick={() => handleEdit(req)}>
            <EditIcon fontSize="small" />
          </IconButton>
            </Box>      
               
                {req.status === 0 && (
                  <>

                   <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >

                <IconButton
                      color="success"
                      size="small"
                      onClick={() => handleApprovePrayer(req.id, 1)}
                      aria-label="Approve"
                    >
                      <CheckCircleIcon />
                    </IconButton>


          </Box>
                    

                     <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >
             <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleApprovePrayer(req.id, 2)}
                      aria-label="Decline"
                    >
                      <CancelIcon />
                    </IconButton>


          </Box>

          <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >
             <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleApprovePrayer(req.id, 3)}
                      aria-label="Decline"
                    >
                      <DeleteIcon />
                    </IconButton>


          </Box>


          
                   
                  </>
                )}
                {req.status === 1 && (

<>
                     <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >

 <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleApprovePrayer(req.id, 2)}
                    aria-label="Decline"
                  >
                    <CancelIcon />
                  </IconButton>

          </Box>


 <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >
             <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleApprovePrayer(req.id, 3)}
                      aria-label="Decline"
                    >
                      <DeleteIcon />
                    </IconButton>


          </Box>

                 </>
                )}
                {req.status === 2 && (
                    <>
                     <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >
 <IconButton
                    color="success"
                    size="small"
                    onClick={() => handleApprovePrayer(req.id, 1)}
                    aria-label="Approve"
                  >
                    <CheckCircleIcon />
                  </IconButton>


          </Box>

           <Box
            sx={{
              height: 25,
              width: 25,
              backgroundColor: 'grey.200',
              borderRadius: 1, // for rounded square, use '50%' for circle
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              flexShrink: 0,
            }}
          >
             <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleApprovePrayer(req.id, 3)}
                      aria-label="Decline"
                    >
                      <DeleteIcon />
                    </IconButton>


          </Box>
                 </>
                )}
              </CardActions>
            </Card>
        )))}
  </Box>

  {/* Pagination */}

  {totalPages > 0 && (
  <Box display="flex" justifyContent="center" mt={3} width="100%">
    <Pagination
      count={totalPages}
      page={page}
      onChange={(e, value) => setPage(value)}
    />
  </Box>
  )}


      {/* Submit Prayer Request Modal */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Testimony</DialogTitle>
        <DialogContent>
          <form id="prayer-form" onSubmit={handleSubmit}>

            

              <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Prayers</InputLabel>
              <Select
                value={myPrayer}
                label="Prayer"
                onChange={(e) => setMyPrayer(e.target.value)}
              >
               {myPrayers.map((prp) => (
              <MenuItem key={prp.id} value={prp.id}>
                {prp.title}
              </MenuItem>
            ))}
              </Select>
            </FormControl>
            <TextField
              label="Title"
              fullWidth
              margin="dense"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />


            <TextField
              label="Testimony"
              multiline
              rows={4}
              fullWidth
              margin="dense"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              error={!!formError}
              helperText={formError}
            />

        
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit" form="prayer-form" variant="contained" color="primary">
            Submit Testimony
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openViewDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>View Prayer Request</DialogTitle>
        <DialogContent>
        <Typography variant="subtitle1"><b>Title:</b> {title}</Typography>
        <Typography variant="subtitle1"><b>Description:</b> {description}</Typography>
        <Typography variant="subtitle1"><b>Category:</b> {category}</Typography>
        <Typography variant="subtitle1"><b>Created At:</b> {new Date(created_at).toLocaleString()}</Typography>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleViewDialogClose}>Cancel</Button> 
        </DialogActions>
        
      </Dialog>


      {/* Submission Feedback Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Prayer request submitted successfully!
        </Alert>
      </Snackbar>





          <Dialog open={openEditDialog} onClose={handleDialogEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Testimony</DialogTitle>
        <DialogContent>
          <form id="prayer-form" onSubmit={handleUpdateSubmit}>
            <TextField
              label="Title"
              fullWidth
              margin="dense"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />


            <TextField
              label="Testimony"
              multiline
              rows={4}
              fullWidth
              margin="dense"
              value={description}
              onChange={(e) => setRequestText(e.target.value)}
              error={!!formError}
              helperText={formError}
            />

        
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogEditClose}>Cancel</Button>
          <Button type="submit" form="prayer-form" variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>



    </Box>
  );
}
