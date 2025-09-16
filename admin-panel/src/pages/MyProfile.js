import React, { useState, useEffect, useRef } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Button, TextField, Grid, Container, Avatar, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MyProfile = () => {
  const [tab, setTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [editOrgDetails, setEditOrgDetails] = useState(null);

  const [editUser, setEditUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef();
  const [editOrg, setEditOrg] = useState({});
  const [editOrgMode, setEditOrgMode] = useState(false);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}my-profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to load profile');
        } else {
          console.log(data.data?.edit_org_table)
          setUser(data.data);
          setOrg(data.data.origanisation);
          setEditOrgDetails(data.data.edit_org_table)
          setEditUser(data.data);
          setPreviewUrl(data.data.profile_pic || 'https://i.pravatar.cc/150');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleEdit = () => {
    setEditUser(user);
    setEditMode(true);
    setPreviewUrl(user?.profile_pic || 'https://i.pravatar.cc/150');
    setSelectedImage(null);
  };

  const handleEditOrg = () => {
    setEditOrg(org);
    setEditOrgMode(true);
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditSave = async () => {
    setLoading(true);
    setError('');
  
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('first_name', editUser.first_name || '');
      fd.append('last_name', editUser.last_name || '');
      if (selectedImage instanceof File) {
        fd.append('profile_pic', selectedImage); // key must match server
      }
  
      // Debug: verify what you're sending
      for (const [k, v] of fd.entries()) console.log('FD:', k, v);
  
      const res = await fetch(`${API_URL}update-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type
        body: fd,
      });
  
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        return setError(data?.message || 'Failed to update profile');
      }
  
      if (data?.data) {
        setUser(data.data);
        setPreviewUrl(data.data.profile_pic || 'https://i.pravatar.cc/150');
      }
      setEditMode(false);
      setSelectedImage(null);
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleEditCancel = () => {
    setEditMode(false);
    setSelectedImage(null);
    setPreviewUrl(user?.profile_pic || 'https://i.pravatar.cc/150');
  };

  const handleEditOrgCancel = () => {
    setEditOrgMode(false);
  };

  // Add this handler for organization field changes
  const handleEditOrgChange = (e) => {
    setEditOrg({ ...editOrg, [e.target.name]: e.target.value });
  };

  // Add this function to handle saving the organization
  const handleEditOrgSave = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('org_name', editOrg.org_name || '');
      fd.append('address', editOrg.address || '');
      fd.append('contact_person_name', editOrg.contact_person_name || '');
      fd.append('email', editOrg.email || '');
      fd.append('phone', editOrg.phone || '');
      fd.append('website', editOrg.website || '');
      if (editOrg.logo instanceof File) {
        fd.append('logo', editOrg.logo);
      }

      // Debug: log form data
      for (const [k, v] of fd.entries()) console.log('ORG FD:', k, v);

      // Adjust the endpoint as per your backend
      const res = await fetch(`${API_URL}update-organization`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // Don't set Content-Type for FormData
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        return setError(data?.message || 'Failed to update organization');
      }
      if (data?.organization) {
        setOrg(data.organization);
        setEditOrgDetails(data.organization.edit_org_table)
      }
      setEditOrgMode(false);
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          My Profile
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Profile" />
          <Tab label="Organization" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          {!editMode ? (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={user?.profile_pic || 'https://i.pravatar.cc/150'}
                  alt={user?.first_name}
                  sx={{ width: 80, height: 80, mb: 1 }}
                />
              </Box>
              <Typography variant="subtitle1"><b>Name:</b> {user?.first_name} {user?.last_name}</Typography>
              <Typography variant="subtitle1"><b>Email:</b> {user?.email}</Typography>
              <Typography variant="subtitle1"><b>Phone:</b> {user?.phone}</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleEdit}>
                Edit
              </Button>
            </Box>
          ) : (
            <Box component="form" sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <IconButton
                  component="span"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  sx={{ mb: 1 }}
                >
                  <Avatar
                    src={previewUrl}
                    alt={editUser?.first_name}
                    sx={{ width: 80, height: 80 }}
                  />
                  <PhotoCamera sx={{ position: 'absolute', bottom: 8, right: 8, color: '#ff8c00', background: '#fff', borderRadius: '50%', p: 0.5, fontSize: 24 }} />
                </IconButton>
                <Typography variant="caption" color="text.secondary">Click avatar to change</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={editUser.first_name || ''}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    value={editUser.last_name || ''}
                    onChange={handleEditChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleEditSave} sx={{ mr: 2 }}>
                  Save
                </Button>
                <Button variant="outlined" onClick={handleEditCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </TabPanel>
        <TabPanel value={tab} index={1}>
          {!editOrgMode ? (
            <Box>
 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={org?.logo || 'https://i.pravatar.cc/150'}
                  alt={org?.org_name}
                  sx={{ width: 80, height: 80, mb: 1 }}
                />
              </Box>
<Box sx={{ p: 2 }}>
  {[
    { label: "Organization Name", value: org?.org_name, newValue: editOrgDetails[0]?.org_name },
    { label: "Address", value: org?.address, newValue: editOrgDetails[0]?.address },
    { label: "Contact", value: org?.contact_person_name, newValue: editOrgDetails[0]?.contact_person_name },
    { label: "Email", value: org?.email, newValue: editOrgDetails[0]?.email },
    { label: "Phone", value: org?.phone, newValue: editOrgDetails[0]?.phone },
    { label: "Website", value: org?.website, newValue: editOrgDetails[0]?.website },
  ].map((item, index) => (
    <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
      <Grid item xs={6}>
        <Typography variant="subtitle1"><b>{item.label}:</b> {item.value}</Typography>
      </Grid>
      {org?.update_request === "Requested" && (
        <Grid item xs={6}>
          <Typography variant="subtitle1" color="primary">
            <b>New {item.label}:</b> {item.newValue}
          </Typography>
        </Grid>
      )}
    </Grid>
  ))}
</Box>


          {org?.update_request==='Requested' ? (
            <Typography variant="subtitle1" color="red"><b>Update Request:</b> Pending</Typography>
          ) : (
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleEditOrg}>
                Edit
          </Button>
          )}
          </Box>
          ) : (

<Box sx={{ p: 2 }}>

<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
  <input
    type="file"
    accept="image/*"
    style={{ display: 'none' }}
    ref={fileInputRef}
    onChange={e => {
      // For org logo, use a separate handler
      const file = e.target.files[0];
      if (file) {
        setEditOrg(prev => ({
          ...prev,
          logo: file,
          logoPreview: URL.createObjectURL(file),
        }));
      }
    }}
  />
  <IconButton
    component="span"
    onClick={() => fileInputRef.current && fileInputRef.current.click()}
    sx={{ mb: 1, position: 'relative' }}
  >
    <Avatar
      src={
        editOrg.logoPreview
          ? editOrg.logoPreview
          : (org?.logo || 'https://i.pravatar.cc/150')
      }
      alt={editOrg?.org_name}
      sx={{ width: 80, height: 80 }}
    />
    <PhotoCamera sx={{ position: 'absolute', bottom: 8, right: 8, color: '#ff8c00', background: '#fff', borderRadius: '50%', p: 0.5, fontSize: 24 }} />
  </IconButton>
  <Typography variant="caption" color="text.secondary">Click logo to change</Typography>
</Box>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Organization Name"
        name="org_name"
        value={editOrg.org_name || ''}
        onChange={handleEditOrgChange} // <-- use new handler
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Address"
        name="address"
        value={editOrg.address || ''}
        onChange={handleEditOrgChange}
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Contact"
        name="contact_person_name"
        value={editOrg.contact_person_name || ''}
        onChange={handleEditOrgChange}
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Email"
        name="email"
        value={editOrg.email || ''}
        onChange={handleEditOrgChange}
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Phone"
        name="phone"
        value={editOrg.phone || ''}
        onChange={handleEditOrgChange}
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Website"
        name="website"
        value={editOrg.website || ''}
        onChange={handleEditOrgChange}
        fullWidth
      />
    </Grid>
    <Grid item xs={12}>
      <Button
        variant="contained"
        sx={{ mr: 2 }}
        onClick={handleEditOrgSave} // <-- call save handler
      >
        Save
      </Button>
      <Button
        variant="outlined"
        onClick={handleEditOrgCancel}
      >
        Cancel
      </Button>
    </Grid>
  </Grid>
</Box>

          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MyProfile;
