'use client';
import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box,
  TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar,
  Chip, IconButton, Pagination,InputAdornment,Dialog,DialogTitle,DialogContent,Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from '@mui/icons-material/Add';
import { useUser } from "../context/UserContext";
import PageLoader from '../components/PageLoader';
const SpecialPrayerCategoryList = () => {
  const [stats, setStats] = useState([
    { title: 'Total Categories', count: 0 },
    { title: 'Active Prayers', count: 0 },
    { title: 'Answered', count: 0 },
    { title: 'This Month', count: 0 },
  ]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState(null); // or orgOptions[0] for default
const [editCategory, setEditCategory] = useState(null);
const [selected, setSelected] = useState([]);
const orgOptions = [{ id: 0, org_name: "All Organizations" }, ...organizations];
const { user } = useUser();
const [addCategory, setAddCategory] = useState(false);

const [category, setCategory]=useState('');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
const [loading, setLoading] = useState(true);


  // Fetch category data (mock or API)
  useEffect(() => {
    fetchCategories();
  }, [search, status, page, organization]);

  const fetchCategories = async () => {
    // Replace this with your actual API call
      try {
      setLoading(true);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}special-prayer-categories`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: page,
        search: search,
        status: status,
        organization: organization?.id || null,
      })
    });
    const data = await response.json();

    setCategories(data.data.categories);
    setOrganizations(data.data.organisations);
    setTotalPages(data.data.totalPages);

    setStats([
      { title: 'Total Categories', count: data.totalCount },
      { title: 'Active Prayers', count: data.activePrayers },
      { title: 'Answered', count: data.answered },
      { title: 'This Month', count: data.thisMonth },
    ]);

       } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    // Handle edit action
    console.log('Edit', category);
  };

  const handleDelete = async (id) => {

    if(window.confirm("Are you sure you want to delete this category?")){
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}delete-special-prayer-category`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          status:3
        })
      });
      const data = await response.json();
      if(response.ok){
        alert("Category deleted successfully");
        window.location.reload();
      } else {
        alert("Delete failed: " + (data?.message || 'Unknown error'));
      }
    }
  };


  const handleSaveEdit = async () => {
    const token = localStorage.getItem('token');

    if(editCategory.name==''){
      alert('Category is required')
      return false;
    }

    const response = await fetch(`${API_URL}update-special-prayer-category`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
        id: editCategory.id,
        name: editCategory.name,
      })
    });
    const data = await response.json();
    if (response.ok) {
      alert("Category updated successfully");
      window.location.reload();
    } else {
      alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };
  const handleSaveAdd = async () => {

    if(category==''){
        alert('Category is required');
        return false;
    }
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}add-special-prayer-category`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: category,
      })
    });
    const data = await response.json();
    if (response.ok) {
      alert("Category added successfully");
      window.location.reload();
    } else {
      alert((data?.message || 'Unknown error'));
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
<Box p={2}>
  {/* Header */}
  <Box mb={5}>
    <Typography variant="h5" fontWeight={700}>
      Special Prayer Category Management
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Manage prayer categories, including name, status, and organization.
    </Typography>
  </Box>

{/* Header + Filters Row */}
<Paper sx={{ p: 2, border: "1px solid #e0e0e0" }}>
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 2
    }}
  >
    {/* Heading */}
    <Typography variant="h6" fontWeight={700}>
      Prayer Categories
    </Typography>

    {/* Filters */}
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {/* Search Field */}
      <TextField
        size="small"
        placeholder="Search categories by name..."
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

      {/* Status Dropdown */}
      <TextField
        label="Status"
        variant="outlined"
        size="small"
        select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All Status</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
        <MenuItem value="deleted">Deleted</MenuItem>
      </TextField>

      {/* Organization Dropdown (Admin Only) */}
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

      {/* Add Category Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setAddCategory(true)}
        sx={{ background: "#177373" }}
      >
        Add Category
      </Button>
    </Box>
  </Box>
</Paper>


  {/* Category Table */}
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Category</TableCell>
          <TableCell>Active Prayers</TableCell>
          {user?.role === 1 && <TableCell>Organization</TableCell>}
          <TableCell>Status</TableCell>
          <TableCell>Created</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {categories.map((cat) => (
          <TableRow key={cat.id}>
            {/* Category Name with Avatar */}
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "#f3f4f6",
                    color: "#1a4a3a",
                    fontWeight: 700,
                    fontSize: 20
                  }}
                >
                  {cat.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
                {cat.name}
              </Box>
            </TableCell>

            {/* Active Prayers */}
            <TableCell>{cat._count?.session_prayers || 0}</TableCell>

            {/* Organization (Admin Only) */}
            {user?.role === 1 && (
              <TableCell>
                {cat.origanisation?.org_name || "Default Category"}
              </TableCell>
            )}

            {/* Status Chip */}
            <TableCell>
              <Chip
                label={cat.deleted_at ? "Deleted" : cat.status}
                color={
                  cat.deleted_at
                    ? "error"
                    : cat.status === "active"
                    ? "success"
                    : cat.status === "inactive"
                    ? "error"
                    : "default"
                }
                size="small"
              />
            </TableCell>

            {/* Created Date */}
            <TableCell>
              {new Date(cat.created_at).toLocaleDateString()}
            </TableCell>

            {/* Actions */}
            <TableCell>
              <IconButton onClick={() => handleEdit(cat)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(cat.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  {/* Pagination */}
  <Box display="flex" justifyContent="center" mt={3}>
    <Pagination
      count={totalPages}
      page={page}
      onChange={(e, value) => setPage(value)}
    />
  </Box>


      {editCategory && (
         <Dialog open={!!editCategory} onClose={() => setEditCategory(null)} maxWidth="sm" fullWidth>
         <DialogTitle>Edit Category</DialogTitle>
         <DialogContent>
           <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              
               <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                   <TextField label="Category Name" value={editCategory.name} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} />
               </Box>

           </Box>
           <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
               <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
           </Box>
         </DialogContent>
       </Dialog>
      )}
      {addCategory && (
        <Dialog open={!!addCategory} onClose={() => setAddCategory(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Category</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField label="Category Name" value={category} onChange={(e) => setCategory(e.target.value )} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button onClick={() => setAddCategory(false)} >Cancel</Button> 
               <Button variant="contained" onClick={handleSaveAdd} sx={{background: '#177373'}}>Save</Button>
           </Box>
          </DialogContent>
        </Dialog>
      )}


    </Box>
  );
};

export default SpecialPrayerCategoryList;
