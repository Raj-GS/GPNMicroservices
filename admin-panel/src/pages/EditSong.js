import React, { useState,useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,FormControl, Select,
  MenuItem,InputLabel,ListItemText, Checkbox, Grid
} from "@mui/material";
import { useParams } from 'react-router-dom';


export default function EditSong() {
const [title, setTitle] = useState("");
const [language, setLanguage] = useState("1");
const [song, setSong] = useState("");
const [songnumber, setSongNumber] = useState("");
const [author, SetAuthor] = useState("");
const [engtitle, setEngTitle] = useState("");
const [engLyrics, setEngLyrics] = useState("");
const [copyright, setCopyright] = useState("no");
const API_URL = process.env.REACT_APP_API_URL;

const { id } = useParams();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // Replace this with your actual API call
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}get-song-details`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: id })
    });
    const data = await response.json();

  
   setTitle(data.data.title);
   setLanguage(data.data.language_id);
   setSong(data.data.song);
   setSongNumber(data.data.song_id);
   SetAuthor(data.data.author);
   setEngTitle(data.data.eng_title);
   setEngLyrics(data.data.eng_lyrics);
   setCopyright(data.data.copyright);
  };




 const handleAddSong = async () => {
    const token = localStorage.getItem('token');

  if(title=='' || language=='' || song=='' || songnumber=='' || author==''){
    alert("Title and Song are required fields");
    return false;
  }
    const response = await fetch(`${API_URL}update-song`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
       title:title,
       language:language,
       song:song,
       songnumber:songnumber,
       author:author,

       eng_title:engtitle,
       eng_lyrics:engLyrics,
       copyright:copyright,
       id: id
      })
    })

    const data = await response.json();

    if (response.ok) {
      alert("Song updated successfully");
     window.location.reload();
    } else {
     alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: "900px" }}>
        <Typography variant="h5" gutterBottom>
          Edit Song
        </Typography>
 <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
        >
        <Box flex="1 1 48%">

         <FormControl fullWidth required>
                <InputLabel>Language</InputLabel>
                <Select label="Category" defaultValue={language} onChange={(e) => setLanguage(e.target.value)}>
                    <MenuItem value="1">
                    English
                    </MenuItem>
                    <MenuItem value="2">
                    Telugu
                    </MenuItem>
                    <MenuItem value="3">    
                    Hindi
                    </MenuItem>
                         
                </Select>
              </FormControl>
         </Box>

       
          {/* Title */}
          <Box flex="1 1 48%">
            <TextField label="Song Number" disabled value={songnumber} required fullWidth onChange={(e) => setSongNumber(e.target.value)} />
          </Box>


           <Box flex="1 1 48%">
            <TextField label="Song Title" value={title} required fullWidth onChange={(e) => setTitle(e.target.value)} />
          </Box>


 </Box>
          {/* Description */}
        <Box mt={2}>
        
         <TextField
                       label="Song"
                       multiline
                       rows={4}
                       fullWidth
                       margin="dense"
                       value={song}
                       required
                       onChange={(e) => setSong(e.target.value)}
                     
                     />
        </Box>

          



         

            {language =='2' || language =='3' ? 
        (
            <>
          <Box mt={2}>
            <TextField
              label="English Title"
             type="text"
              fullWidth
              value={engtitle}
              onChange={(e) => setEngTitle(e.target.value)}
            />
          </Box>

         <Box mt={2}>
            <TextField
              label="English Lyrics"
               multiline
                       rows={4}
                       fullWidth
                       margin="dense"
              value={engLyrics}
              onChange={(e) => setEngLyrics(e.target.value)}
            />
          </Box>
             </>   
        ) : null}


 <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
          mt={2}
        >
          <Box flex="1 1 48%" mt={2}>
            <TextField
              label="Author"
              type="text"
              value={author}
              fullWidth
              onChange={(e) => SetAuthor(e.target.value)}
            />
          </Box>

 <Box flex="1 1 48%" mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Copyright ? *
          </Typography>
          <RadioGroup
            row
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
          >
            <FormControlLabel
              value="yes"
              control={<Radio />}
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={<Radio />}
              label="No"
            />
          </RadioGroup>
        </Box>

        </Box>



   
        {/* Pray Type */}
       




  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                
                  <Button variant="contained" onClick={handleAddSong} sx={{background: '#177373'}}>Save</Button>
              </Box>
      </Paper>
    </Box>
  );
}
