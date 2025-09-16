import React, { useState,useEffect,useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
   Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,FormControl, Select,
  MenuItem,InputLabel,ListItemText, Checkbox, Grid,
  Card,
  CardContent,
    List,
  ListItem,
} from "@mui/material";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useParams } from 'react-router-dom';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import styles
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const templates = [
  {
    id: 1,
    name: "Template1",
    image: "/prayforthenation/template1.jpg", // Place these images in public/images/
  },
  {
    id: 2,
    name: "Template2",
    image: "/prayforthenation/template2.jpg",
  },
  {
    id: 3,
    name: "Template3",
    image: "/prayforthenation/template3.jpg",
  },

  {
    id: 4,
    name: "Template4",
    image: "/prayforthenation/template4.jpg", // Place these images in public/images/
  },
  {
    id: 5,
    name: "Template5",
    image: "/prayforthenation/template5.jpg",
  },
  {
    id: 6,
    name: "Template6",
    image: "/prayforthenation/template6.jpg",
  },

  {
    id: 7,
    name: "Template7",
    image: "/prayforthenation/template7.jpg", // Place these images in public/images/
  },
  {
    id: 8,
    name: "Template8",
    image: "/prayforthenation/template8.jpg",
  },
  {
    id: 9,
    name: "Template9",
    image: "/prayforthenation/template9.jpg",
  },

  {
    id: 10,
    name: "Template10",
    image: "/prayforthenation/template10.jpg", // Place these images in public/images/
  },
  {
    id: 11,
    name: "Template11",
    image: "/prayforthenation/template11.jpg",
  },
  {
    id: 12,
    name: "Template12",
    image: "/prayforthenation/template12.jpg",
  },

  {
    id: 13,
    name: "Template13",
    image: "/prayforthenation/template13.jpg", // Place these images in public/images/
  },
  {
    id: 14,
    name: "Template14",
    image: "/prayforthenation/template14.jpg",
  },
  {
    id: 15,
    name: "Template15",
    image: "/prayforthenation/template15.jpg",
  },

  {
    id: 16,
    name: "Template16",
    image: "/prayforthenation/template16.jpg", // Place these images in public/images/
  },
  {
    id: 17,
    name: "Template17",
    image: "/prayforthenation/template17.jpg",
  },
  {
    id: 18,
    name: "Template18",
    image: "/prayforthenation/template18.jpg",
  },

    {
    id: 19,
    name: "Template19",
    image: "/prayforthenation/template19.jpg",
  },
  {
    id: 20,
    name: "Template20",
    image: "/prayforthenation/template20.jpg",
  },

   {
    id: 21,
    name: "default",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  },

];




export default function ViewPrayForTheNation() {

const [description, setDescription] = useState("");
const [prayerPlan, setPrayerPlan] = useState("fixed");
const [fromDate, setFromDate] = useState("");
const [toDate, setTodate] = useState("");
const [numberOfDays, setNumberOfDays] = useState("");
const [scriptures, setScriptures] = useState([{ id: '', scripture: '' }]);
const [sprayerid, setSprayerid] = useState("");
const [prayerid, setPrayerid] = useState("");


const [prayerPoints, setPrayerPoints] = useState([
  { title: '', telugu: '', english: '' }
]);

const [selectedTemplateId, setSelectedTemplateId] = useState(21);
const [showAllTemplates, setShowAllTemplates] = useState(false);
const API_URL = process.env.REACT_APP_API_URL;

const { id } = useParams();





  useEffect(() => {
    fetchSpecialPrayer();
  }, []);

  const fetchSpecialPrayer = async () => {
    // Replace this with your actual API call
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}praye-for-nation`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
            id:id
      })
    });
    const data = await response.json();

setDescription(data.prayerdetails.description);
setPrayerPlan(data.specialprayer.flow_type ?? 'fixed');
setFromDate(data.specialprayer.from_date ?? '');
setTodate(data.specialprayer.to_date ?? '');
setNumberOfDays(data.specialprayer.number_of_days?? 0);
setSprayerid(data.specialprayer.id?? 0)
setSprayerid(data.specialprayer.id ?? 0)
setPrayerid(data.prayerdetails.id ?? 0)

if (data.prayerdetails?.session_prayer_points?.length) {
  const formattedPoints = data.prayerdetails.session_prayer_points.map(point => ({
    id: point.id,
    category: point.category,   // ✅ keep category for grouping
    title: point.title || `Prayer Point ${point.id}`,
    english: point.prayer_point,
    telugu: point.te_prayer_point,
  }));

  // group by category
  const grouped = formattedPoints.reduce((acc, point) => {
    if (!acc[point.category]) {
      acc[point.category] = [];
    }
    acc[point.category].push(point);
    return acc;
  }, {});

  // convert to array for rendering
  const groupedArray = Object.entries(grouped).map(([name, points]) => ({
    name,
    prayerPoints: points,
  }));

  setPrayerPoints(groupedArray);
}



const matchedTemplate = templates.find(t => t.image === data.specialprayer.image ?? "https://images.unsplash.com/photo-1519681393784-d120267933ba");
if (matchedTemplate) {
  setSelectedTemplateId(matchedTemplate.id);
}

const formattedScriptures = data.prayerdetails.session_scriptures.map((s) => ({
  id: s.id,
  scripture: s.scripture,
}));

setScriptures(formattedScriptures);

   // setCategories(data.data.categories);
  };





 const handleAddDevotion = async () => {
    const token = localStorage.getItem('token');

  if(prayerPlan=='fixed' || prayerPlan=='open'){

     if(fromDate=='' || toDate==''){
          alert("Fromdate and Todate is required")
    return false;

     }

  }

  if(prayerPlan=='floating'){

     if(numberOfDays==''){
          alert("Number of days is required")
        return false;

     }

  }

    const response = await fetch(`${API_URL}update-pray-for-nation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
       flow_type:prayerPlan,
       fromDate:fromDate,
       toDate:toDate,
       numberOfDays:numberOfDays,
       selectedTemplateId:templates.find(t => t.id === selectedTemplateId)?.image,
       sprayerid:sprayerid,
       prayerid:prayerid

      })
    })

    const data = await response.json();

    if (response.ok) {
      alert("Special prayer updated successfully");
   //  window.location.reload();
    } else {
     alert("Update failed: " + (data?.message || 'Unknown error'));
    }
  };





  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: "900px" }}>
        <Typography variant="h5" gutterBottom>
         Pray For the Nation
        </Typography>


          {/* Description */}
<Box mt={2}>
  <Typography variant="subtitle1" gutterBottom>
    Description *
  </Typography>

  <Card>
    <CardContent>
      {description ? description.replace(/<[^>]+>/g, "") : ""}
    </CardContent>
  </Card>
</Box>


          











        {/* Scripture */}
<Box flex="1 1 100%" mt={2}>
  <Typography variant="subtitle1" gutterBottom>
    Scriptures:
  </Typography>

  <Accordion sx={{ mb: 2 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">Scriptures</Typography>
    </AccordionSummary>

    <AccordionDetails>
      {Array.isArray(scriptures) && scriptures.length > 0 ? (
        <List>
          {scriptures.map((item, index) => (
            <ListItem key={item.id || index} sx={{ display: "block" }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {`Scripture ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {item.scripture}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No scriptures available.
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
</Box>



<Box flex="1 1 100%" mt={2}>
  <Typography variant="subtitle1" gutterBottom>
    Prayer Points:
  </Typography>
{prayerPoints.map((category, catIndex) => (
  <Accordion key={catIndex} sx={{ mb: 2 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">{category.name}</Typography>
    </AccordionSummary>

    <AccordionDetails>
      {Array.isArray(category.prayerPoints) && category.prayerPoints.length > 0 ? (
        <List>
          {category.prayerPoints.map((point, index) => (
            <ListItem key={index} sx={{ display: "block" }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {point.title}
                  </Typography>
                }
                secondary={
                  <>
                    {point.telugu && (
                      <Typography variant="body2" color="text.secondary">
                        Telugu: {point.telugu}
                      </Typography>
                    )}
                    {point.english && (
                      <Typography variant="body2" color="text.secondary">
                        English: {point.english}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No prayer points available.
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
))}


</Box>

 <Typography variant="h5"  gutterBottom>
    My Settings:
  </Typography>



   <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
          mt={5}
        >
                <Box flex="1 1 48%">
           <FormControl fullWidth required>
                <InputLabel>Prayer Plans</InputLabel>



                <Select label="Category" value={prayerPlan} onChange={(e) => setPrayerPlan(e.target.value)}>
                  <MenuItem value="fixed">Fixed Plan</MenuItem>
                  <MenuItem value="floating">Floating Plan</MenuItem>
                   <MenuItem value="open">Open Plan</MenuItem>
                </Select>
              </FormControl>      
         
          </Box>
          </Box>


          <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
          mt={5}
        >


        


            {prayerPlan =='fixed' || prayerPlan =='open' ? 
        (
            <>
          <Box flex="1 1 48%">
            <TextField
              label="From Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Box>

          <Box flex="1 1 48%">
            <TextField
              label="To Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={toDate}
              onChange={(e) => setTodate(e.target.value)}
            />
          </Box>
             </>   
        ) : (

            <>
            
             <Box flex="1 1 48%">
            <TextField
              label="Number of Days"
              type="text"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(e.target.value)}
            />
          </Box>
            </>

        ) }
        </Box>

 <Box>
      <Typography variant="subtitle1" gutterBottom>
        Selected Template:
      </Typography>

      <Box
        onClick={() => setShowAllTemplates(true)}
        sx={{
          border: "2px solid blue",
          borderRadius: 2,
          cursor: "pointer",
          overflow: "hidden",
          width: "100%",
          maxWidth: 300,
          height: 200,
          mb: 2,
        }}
      >
        <img
           src={
            templates.find((t) => t.id === selectedTemplateId)?.image
          }
          alt="Selected Template"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>

      {!showAllTemplates && (
        <Button
          variant="outlined"
          onClick={() => setShowAllTemplates(true)}
        >
          More Templates
        </Button>
      )}
{showAllTemplates && (
       <Button
          variant="outlined"
          onClick={() => setShowAllTemplates(false)}
        >
          Less Templates
        </Button>
)}

      {showAllTemplates && (
        <Grid container spacing={2} mt={2}>
          {templates.map((template) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={template}
            >
              <Box
                  onClick={() => setSelectedTemplateId(template.id)}
                sx={{
                  border:
                    selectedTemplateId === template.id
                      ? "2px solid blue"
                      : "1px solid #ccc",
                  borderRadius: 2,
                  cursor: "pointer",
                  overflow: "hidden",
                  height: 150,
                }}
              >
                <img
                 src={template.image}
                alt={template.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>

  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                
                  <Button variant="contained" onClick={handleAddDevotion} sx={{background: '#177373'}}>Save</Button>
              </Box>
      </Paper>
    </Box>
  );
}
