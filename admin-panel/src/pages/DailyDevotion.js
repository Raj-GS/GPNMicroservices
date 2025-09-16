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
  InputAdornment,RadioGroup,Radio,Paper,Pagination,Dialog, DialogTitle, DialogContent, Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "../context/UserContext";
import DOMPurify from 'dompurify';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import styles
import PageLoader from "../components/PageLoader";

// Function to strip HTML and decode HTML entities
const stripHtml = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(html); // prevents XSS
  return tempDiv.textContent || tempDiv.innerText || '';
};


const DailyDevotions = () => {
  const [value, setValue] = useState("<p>Hello, world!</p>");

  const [search, setSearch] = useState("");
const [devotionType, setDevotionType] = useState(true); // default to true or false based on your app
  const [page, setPage] = useState(1);

  const [fromDate,setFromDate] = useState("");
  const [toDate,setToDate]  = useState("");
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

const API_URL = process.env.REACT_APP_API_URL;

      const [loading, setLoading] = useState(true);
   
    // Modal open/close
  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

    const handleEdit = (id) => {
    setEditUser(devotionList.find((devotion) => devotion.id === id));
  };
  useEffect(() => {
    const fetchUsers = async () => {
       try {
       setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}devotion-list`, {
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
      setDevotionList(data.devotions);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);

      setDevotionType(data.settings.hdailydevotiondefault === 'yes');

          } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
   //   setDevotionType(data.settings.hdailydevotiondefault)
    };
    fetchUsers();
  }, [fromDate, toDate, organization,search,page]);

const handleViewDialogClose = () => {

      setEditUser(null);

}

 const handleAddDevotion = async () => {
    const token = localStorage.getItem('token');

  if(PostDate=='' || Title=='' || Dailydeovotion==''){
    alert("Post Date and Title and Daily Devotion required")
    return false;
  }


    const response = await fetch(`${API_URL}add-devotion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
        post_date: PostDate,
        title: Title,
        post_content:Dailydeovotion,
        quote: Quote,
        author: Author,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Devotion updated successfully");
     window.location.reload();
    } else {
     alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };


   const handleSaveEdit = async () => {
    const token = localStorage.getItem('token');

  if(editUser.post_date=='' || editUser.title=='' || editUser.post_content==''){
    alert("Post Date and Title and Daily Devotion required")
    return false;
  }

    const response = await fetch(`${API_URL}update-devotion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
        post_date: editUser.post_date,
        title: editUser.title,
        post_content: editUser.post_content,
        quote: editUser.quote,
        author: editUser.author,
        id: editUser.id,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Devotion updated successfully");
     window.location.reload();
    } else {
     alert((data?.message || 'Unknown error'));
    }
  };


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
  const confirmDelete = window.confirm("Do you want to delete this devotion?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}delete-devotion`, {
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
      <Typography variant="h5" gutterBottom>
        Daily Devotions
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Manage Devotional Content and Settings
      </Typography>

      {/* Settings */}
<Box
  sx={{
    border: "1px solid #ddd",
    borderRadius: 2,
    backgroundColor: "#fff", // White background
    p: 3,
    mb: 2,
  }}
>
  <Typography variant="subtitle1" gutterBottom>
    Devotion Settings
  </Typography>

<Grid container spacing={2}>
  {/* Devotion Type */}
  <Grid item xs={12}>
    <Typography variant="body2" sx={{ mb: 1 }}>
      Choose Devotion Type
    </Typography>
    <RadioGroup
  row
  value={devotionType ? 'true' : 'false'}
  onChange={(e) => setDevotionType(e.target.value === 'true')}
>
  <FormControlLabel
    value="true"
    control={<Radio />}
    label="Default Daily Devotion"
  />
  <FormControlLabel
    value="false"
    control={<Radio />}
    label="My Daily Devotion"
  />
</RadioGroup>

  </Grid>
</Grid>

<Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
  <Button onClick={SaveDevotionSettings} variant="contained" sx={{ backgroundColor: '#5b7979ff' }}>
    Save Settings
  </Button>

  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={handleDialogOpen}
    sx={{ backgroundColor: '#177373' }}
  >
    Add Daily Devotion
  </Button>
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
        All Devotions
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
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
  {stripHtml(devotion.post_content).slice(0, 200)}...
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
              {new Date(devotion.post_date).toLocaleDateString()}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => handleEdit(devotion.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(devotion.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
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

      {/* Edit Devotion */}


        {editUser && (
          <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Daily Devotion</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                 

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
    <TextField
      label="Post Date"
      type="date"
      value={editUser.post_date}
      onChange={(e) =>
        setEditUser({
          ...editUser,
          post_date: e.target.value,
        })
      }
      InputLabelProps={{
        shrink: true,
      }}
    />
  </Box>

   <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                      <TextField label="Title" value={editUser.title} 
                      onChange={(e) => setEditUser({ ...editUser, title: e.target.value  })} />
                  </Box>
  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                     <Typography variant="h6" >
    Daily Devotion
  </Typography>

<ReactQuill
  theme="snow"
  value={editUser.post_content}
  onChange={(content) =>
    setEditUser((prev) => ({ ...prev, post_content: content }))
  }
/>




               



                  </Box>

                   <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

                   <Typography variant="h6" >
   Quote of Day
  </Typography>

<ReactQuill
  theme="snow"
  value={editUser.quote}
  onChange={(content) =>
    setEditUser((prev) => ({ ...prev, quote: content }))
  }
/>


                   {/* <CKEditor
  editor={ClassicEditor}
  data={editUser.quote || '<p>Start typing...</p>'}
  onChange={(event, editor) => {
    const data = editor.getData();
    setEditUser(prev => ({ ...prev, quote: data }));
  }}
/> */}

                      {/* <TextField label="Quote of Day"   multiline
                rows={4} value={editUser.quote}
                 onChange={(e) => setEditUser({ ...editUser,quote: e.target.value  })} /> */}
                  </Box>
                 
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                      <TextField label="Author" value={editUser.author}
                       onChange={(e) => setEditUser({ ...editUser, author: e.target.value })} />
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



       {/* Add Devotion */}

 <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle>Add Daily Devotion</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                 

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
    <TextField
      label="Post Date"
      type="date"
      value={PostDate}
      onChange={(e) =>
        setPostDate( e.target.value,
        )
      }
      InputLabelProps={{
        shrink: true,
      }}
    />
  </Box>

   <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                      <TextField label="Title" value={Title} 
                      onChange={(e) => setTitle(e.target.value)} />
                  </Box>
  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                     <Typography variant="h6" >
    Daily Devotion
  </Typography>
<ReactQuill
  theme="snow"
  value={Dailydeovotion}
  onChange={(content) =>
    setDailydeovotion(content)
  }
/>


                  </Box>

                   <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

                   <Typography variant="h6" >
   Quote of Day
  </Typography>
<ReactQuill
  theme="snow"
  value={Quote}
  onChange={(content) =>
    setQuote(content)
  }
/>

                  </Box>
                 
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                      <TextField label="Author" value={Author}
                       onChange={(e) => setAuthor(e.target.value)} />
                  </Box>
  
               
              
  
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}></Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button onClick={handleDialogClose}>Cancel</Button> 
                
                  <Button variant="contained" onClick={handleAddDevotion} sx={{background: '#177373'}}>Save</Button>
              </Box>
            </DialogContent>
          </Dialog>

      </Box>
  );
};

export default DailyDevotions;
