import React, { useState,useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const initialRoles = [
  { id: 1, role: "Super Admin" },
  { id: 2, role: "Super Organization Admin" },
  { id: 3, role: "Organization Admin" },
  { id: 4, role: "App User" },
];

const Roles = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValue, setFormValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleId, setRoleId] = useState(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  const handleOpen = (role = null) => {
    setEditing(role);
    setRoleId(role ? role.id : null);
    setFormValue(role ? role.role : "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormValue("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editing) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}update-role`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: formValue,
            roleId: roleId
          })
        });
        const data = await response.json();
        if(data.success){   
          setRoles(roles.map(l => l.id === editing.id ? { ...l, role: formValue } : l));
          setSuccess(data.message);
        }
        else{
          setError(data.message);
        }
      }
      else{

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}add-role`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: formValue
          })
        });
        const data = await response.json();
        if(data.success){
          setRoles([...roles, { id: Date.now(), role: formValue }]);
          setSuccess(data.message);
        }
        else{
          setError(data.message);
        }
      
    }
    handleClose();
  };

  const handleDelete = async(id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}delete-role`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roleId: id
          })
        });
        const data = await response.json();
        if(data.success){
          setSuccess(data.message);
          setRoles(roles.filter(l => l.id !== id));
        }
        else{
          setError(data.message);
        }
    }
  };

  const fetchRoles = async () => {

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}roles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setRoles(data.data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);


  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Role</Typography>
        <Button
          variant="contained"
          sx={{background: '#177373'}}
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Role
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role, idx) => (
              <TableRow key={role.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{role.role}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(role)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(role.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Role"
              type="text"
              fullWidth
              value={formValue}
              onChange={e => setFormValue(e.target.value)}
              required
            />
            
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">
              {editing ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Roles;