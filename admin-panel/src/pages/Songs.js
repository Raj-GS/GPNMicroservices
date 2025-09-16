import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, IconButton, TextField, InputAdornment, MenuItem,
  Select, Chip, Avatar, Dialog, DialogTitle, DialogContent, Card,
    CardContent,
    CardActions, DialogActions,RadioGroup,Radio,Grid, FormControlLabel,Menu
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useNavigate } from "react-router-dom";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PageLoader from "../components/PageLoader";

import { useUser } from "../context/UserContext";
const statusColors = {
    1: "success",
  2: "warning",
  3: "default"
};





const Songs = () => {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All Languages");
  const [songType, setSongType] = useState('2'); // default to true or false based on your app  
  const [selected, setSelected] = useState([]);
const [selectedSongs, setSelectedSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState(null); // or orgOptions[0] for default
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useUser();
  const [openDialog, setOpenDialog] = useState(false);
  const  [openViewDialog, setOpenViewDialog] = useState(false);
  const [status, setStatus] = useState(1); // Default status for adding to My Songs
  const navigate = useNavigate();

const [DisplayType, setDisplayType] = useState('Both'); // default to true or false based on your app

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  const [eventName, seteventName] = useState('');
  const [description, Setdescription]=useState('');
   const [loading, setLoading] = useState(true);

  const [origanisation, SetOriganisation]=useState('');
const [image, Setimage] = useState({
  file: null,
  preview: '',
});

    const [id, setId] = useState(null);


  const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];
  
const handleSelectAll = (event) => {
  if (event.target.checked) {
    const allIds = users.map((user) => user.id);
    const allSongs = users.map((user) => ({
      id: user.id,
      name: user.title
    }));
    setSelected(allIds);
    setSelectedSongs(allSongs);
  } else {
    setSelected([]);
    setSelectedSongs([]);
  }
};



const handleSelect = (songId, songName) => {
  setSelected((prev) => {
    const exists = prev.includes(songId);
    if (exists) {
      // Remove from selected IDs
      setSelectedSongs((songs) => songs.filter((s) => s.id !== songId));
      return prev.filter((id) => id !== songId);
    } else {
      // Add to selected IDs
      setSelectedSongs((songs) => [...songs, { id: songId, name: songName }]);
      return [...prev, songId];
    }
  });
};



useEffect(() => {
  if (user?.role !== 1) {
    fetchSettings();
  }
}, [user]); // run when user changes

const fetchSettings = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data?.settings?.length > 0) {
      setDisplayType(data.settings[0].songs_display);
      setId(data.settings[0].id || null);
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
};

  useEffect(() => {
    const fetchUsers = async () => {
       try {
       setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}filter-songs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: search,
          song_type: songType,
          organization: organization?.id || null,
          page: page,
          pageSize: pageSize,
          language_id:language
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
  }, [songType, language,organization,search,page,pageSize]);

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




    };

    fetchRolesAndOrganizations();
  }, []);

  const handleEdit = (id) => {

      navigate('/admin/edit-song/'+id)
   
  };





  const handleSongsSettings = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}update-songs-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
        display_type: DisplayType,
        settingId: id,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Settings updated successfully");
     window.location.reload();
    } else {
      alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };


const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Do you want to delete this song?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}delete-song`, {
      method: 'POST', // You're using POST instead of DELETE
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Song deleted successfully");
      window.location.reload(); // Optional: replace with a state update if needed
    } else {
      alert(data?.message || 'Failed to delete devotion');
    }
  } catch (error) {
    console.error('Error deleting devotion:', error);
    alert('An unexpected error occurred');
  }
};

const ImportPdfSongs = async () => {
  if (!image.file || !eventName) {
    alert("Please provide a title and select a PDF file.");
    return;
  }
  const formData = new FormData();
  formData.append('title', eventName);
  formData.append('file', image.file);
  formData.append('organization', origanisation);
  formData.append('description', description);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}import-pdf-songs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      alert("PDF Songs imported successfully"); 
      setOpenDialog(false);
      window.location.reload(); // Optional: replace with a state update if needed
    }
    else {
      alert(data?.message || 'Failed to import PDF Songs');
    }
  } catch (error) {
    console.error('Error importing PDF Songs:', error);
    alert('An unexpected error occurred');
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
    setStatus(status);
}
const handleViewDialogClose = () => {
  setOpenViewDialog(false);
//  setSelectedSongs([]);
}
const SongsaddtoOrganization = async () => {
  if (selected.length === 0) {
    alert("Please select at least one song.");
    return;
  }
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}add-songs-to-organization`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      songs: selected,
      status: status,
    }),
  });
  const data = await response.json();
  if (response.ok) {
    alert(status === 1 ? "Songs added to My Songs successfully" : "Songs removed from My Songs successfully");
    setOpenViewDialog(false);
    setSelected([]);
    setSelectedSongs([]);
    window.location.reload(); // Optional: replace with a state update if needed
  } else {
    alert(data?.message || 'Failed to update songs');
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
          <Typography variant="h5" fontWeight={700}>Songs Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage default songs and organization specific collections.
          </Typography>
        </Box>
      </Box>

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


  {user?.role != 1 && (
    <>
  <Typography variant="subtitle1" gutterBottom>
    Song Display Options Settings {DisplayType}
  </Typography>

<Grid container spacing={2}>
  {/* Devotion Type */}
  <Grid item xs={12}>
    {/* <Typography variant="body2" sx={{ mb: 1 }}>
      Choose Devotion Type
    </Typography> */}
    <RadioGroup
  row
  value={DisplayType}
  onChange={(e) => setDisplayType(e.target.value)}
>
  <FormControlLabel
    value="Song"
    control={<Radio />}
    label="Songs"
  />
  <FormControlLabel
    value="Pdf"
    control={<Radio />}
    label="PDFs"
  />

  <FormControlLabel
    value="Both"
    control={<Radio />}
    label="Both"
  />
</RadioGroup>

  </Grid>
</Grid>
</>
  )}

<Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
    {user?.role != 1 && (
  <Button onClick={handleSongsSettings}  variant="contained" sx={{ backgroundColor: '#5b7979ff' }}>
    Save Settings
  </Button>
    )}
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => navigate('/admin/add-song')}
    sx={{ backgroundColor: '#177373' }}
  >
    Add Song
  </Button>

      <Button
    variant="contained"
    startIcon={<UploadIcon />}
    onClick={handleDialogOpen}
    sx={{ backgroundColor: '#177373' }}
  >
    Import PDF Songs
  </Button>

    <Button
    variant="contained"
    startIcon={<VisibilityIcon />}
    onClick={() => navigate('/admin/pdf-songs')}
    sx={{ backgroundColor: '#177373' }}
  >
    View PDF Songs
  </Button>

</Box>


  
</Box>

      {/* Table */}
    


   <Paper sx={{ p: 2, border: "1px solid #e0e0e0" }}>
  {/* Top Bar: Heading (left) and Filters + Button (right) */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
    {/* Left Side: Heading */}
    <Typography variant="h5" color="text.secondary">
    {songType==2 ? 'My' : 'GPN Default' } Songs
    </Typography>

    {/* Right Side: Filters and Add Button */}
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField
        size="small"
        placeholder="Search by Song"
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
        value={language}
        onChange={(e) => {
          setLanguage(e.target.value);
          setPage(1);
        }}
        sx={{ width: 230 }}
      >
        <MenuItem value="All Languages">All Languages</MenuItem>
        <MenuItem value="1">English</MenuItem>
        <MenuItem value="2">Telugu</MenuItem>
        <MenuItem value="3">Hindi</MenuItem>
      </Select>


      <Select
        size="small"
        value={songType}
        onChange={(e) => {
          setSongType(e.target.value);
          setPage(1);
        }}
        sx={{ width: 230 }}
      >
        <MenuItem value="1">Default Songs</MenuItem>
        <MenuItem value="2">My Songs</MenuItem>
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


    </Box>
  </Box>
</Paper>

  <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>

                {songType === '1' && (
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
          Add to My Songs
        </MenuItem>
        <MenuItem onClick={() => { handleSelectOption(2); handleMenuClose(); }}>
          Remove from My Songs
        </MenuItem>
        
      </Menu>
    </Box>
                            
                              </TableCell>
                )}
                <TableCell>Song</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Author</TableCell>
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

        {songType === '1' && (
       <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.includes(user.id)}
                  onChange={() => handleSelect(user.id, user.title)}
                />
              </TableCell>
        )}
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        
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
                  {user.title?.[0]?.toUpperCase() || user.songs.title?.[0]?.toUpperCase()}
                </Avatar>
             
            </Box>
            <Box>
              <Typography fontWeight={600}>
                {user.title || user.songs.title} 
              </Typography>
              <Typography variant="body2" color="text.secondary">
  {user.song?.slice(0, 30) || user.songs.song?.slice(0, 30)}....
</Typography>

            </Box>
          </Box>
        </TableCell>
      
        <TableCell>{user.language_id==2 ? 'Telugu' : user.language_id==3 ? 'Hindi' : 'English'}</TableCell>
       
<TableCell>{user.author ?? user.songs?.author ?? ''}</TableCell>
          {user?.role === 1 && (
          <TableCell>{user.origanisation.org_name}</TableCell>
          )}

<TableCell>
  <Chip
    label={
      (user?.status === 1 || user?.songs?.status === 1)
        ? "Active"
        : "Inactive"
    }
    color={statusColors[user?.status ?? user?.songs?.status] || "default"}
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
        No Songs found
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
     



      {/* Import Songs */}


 <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
              <DialogTitle>Import PDF Songs</DialogTitle>
               <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
               
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
<TextField
  label="Title"
  value={eventName}
  onChange={(e) =>
    seteventName(e.target.value )
  }
/>
                </Box>
                
              <Box>
  <Typography variant="body2" sx={{ mb: 0.5 }}>Choose PDF File</Typography>

  <input
    type="file"
    accept="application/pdf"
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

</Box>

                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}></Box>
            </Box>
          
          </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button onClick={ImportPdfSongs} variant="contained" color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>



  <Dialog open={openViewDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{status===1 ? 'Add to My List' : 'Remove from My List'}</DialogTitle>
        <DialogContent>
        
          {selectedSongs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No songs selected.
            </Typography>
          )}
          {selectedSongs.map((song,index) => (
           
                <Typography variant="h6">{index+1}. {song.name}</Typography>

               ) )}

        </DialogContent>
        <DialogActions>
        <Button onClick={handleViewDialogClose}>Cancel</Button> 
          <Button onClick={SongsaddtoOrganization} variant="contained" color="primary">
          Submit
        </Button>
        </DialogActions>
      </Dialog>
       
       

    </Box>
  );
};

export default Songs;