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

const initialLanguages = [
  { id: 1, language: "English" },
  { id: 2, language: "Hindi" },
  { id: 3, language: "Spanish" },
];

const Languages = () => {
  const [languages, setLanguages] = useState(initialLanguages);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValue, setFormValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [languageId, setLanguageId] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  const handleOpen = (lang = null) => {
    setEditing(lang);
    setLanguageId(lang ? lang.id : null);
    setFormValue(lang ? lang.language : "");
    setCodeValue(lang ? lang.short_code : "");
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
        const response = await fetch(`${API_URL}update-language`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            language: formValue,
            short_code: codeValue,
            languageId: languageId
          })
        });
        const data = await response.json();
        if(data.success){   
          setLanguages(languages.map(l => l.id === editing.id ? { ...l, language: formValue, short_code: codeValue } : l));
          setSuccess(data.message);
        }
        else{
          setError(data.message);
        }
      }
      else{

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}add-language`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            language: formValue,
            short_code: codeValue
          })
        });
        const data = await response.json();
        if(data.success){
          setLanguages([...languages, { id: Date.now(), language: formValue, short_code: codeValue }]);
          setSuccess(data.message);
        }
        else{
          setError(data.message);
        }
      
    }
    handleClose();
  };

  const handleDelete = async(id) => {
    if (window.confirm("Are you sure you want to delete this language?")) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}delete-language`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            languageId: id
          })
        });
        const data = await response.json();
        if(data.success){
          setSuccess(data.message);
          setLanguages(languages.filter(l => l.id !== id));
        }
        else{
          setError(data.message);
        }
    }
  };

  const fetchLanguages = async () => {

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}languages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setLanguages(data.data);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);


  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Languages</Typography>
        <Button
          variant="contained"
          sx={{background: '#177373'}}
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Language
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Code</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {languages.map((lang, idx) => (
              <TableRow key={lang.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{lang.language}</TableCell>
                <TableCell>{lang.short_code}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(lang)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(lang.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {languages.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: "text.secondary" }}>
                  No languages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "Edit Language" : "Add Language"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Language"
              type="text"
              fullWidth
              value={formValue}
              onChange={e => setFormValue(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Code"
              type="text"
              fullWidth
              value={codeValue}
              onChange={e => setCodeValue(e.target.value)}
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

export default Languages;