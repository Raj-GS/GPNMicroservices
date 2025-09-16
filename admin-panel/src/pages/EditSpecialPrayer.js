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
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useParams } from 'react-router-dom';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import styles
import { useUser } from "../context/UserContext";

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




export default function EditSpecialPrayer() {
const [title, setTitle] = useState("");
const [category, setCategory] = useState("");
const [description, setDescription] = useState("");
const [prayerPlan, setPrayerPlan] = useState("fixed");
const [fromDate, setFromDate] = useState("");
const [toDate, setTodate] = useState("");
const [fromTime, setfromTime] = useState("");
const [toTime, setToTime] = useState("");
const [numberOfDays, setNumberOfDays] = useState("");
const [slotDuration, setSlotDuration] = useState("");
const [prayerType, setPrayerType] = useState("Group");
const [prayerFrequency, setPrayerFrequency] = useState("Daily");
 
const [daysOfWeek, setDaysOfWeek] = useState([]);
const [scriptures, setScriptures] = useState([{ id: '', scripture: '' }]);

const [prayerPoints, setPrayerPoints] = useState([
  { title: '', telugu: '', english: '' }
]);

const [selectedTemplateId, setSelectedTemplateId] = useState(21);
const [showAllTemplates, setShowAllTemplates] = useState(false);
const [categories, setCategories] = useState([]);

 const [loading, setLoading] = useState(false);
  const [generatedPoints, setGeneratedPoints] = useState([]); // API response
  const [pointCount, setPointCount] = useState(0);


const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useUser();

const { id } = useParams();
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // Replace this with your actual API call
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}special-prayer-categories`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({

      })
    });
    const data = await response.json();

    setCategories(data.data.categories);
  };


  useEffect(() => {
    fetchSpecialPrayer();
  }, []);

  const fetchSpecialPrayer = async () => {
    // Replace this with your actual API call
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}special-prayer-details`,{
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

setTitle(data.data.title);
setCategory(data.data.category);
setSlotDuration(data.data.slots);
setDescription(data.data.description);
setPrayerPlan(data.data.flow_type);
setFromDate(data.data.from_date);
setTodate(data.data.to_date);
setfromTime(data.data.from_time);
setToTime(data.data.to_time);
setNumberOfDays(data.data.number_of_days);

setPrayerType(data.data.prayer_type);
setPrayerFrequency(data.data.pray_for);
setDaysOfWeek([data.day_of_week]);


if (data.data?.session_prayer_points?.length) {
    const formattedPoints = data.data.session_prayer_points.map(point => ({
      id: point.id,
      title: point.category,
      english: point.prayer_point,
      telugu: point.te_prayer_point,
    }));
    setPrayerPoints(formattedPoints);
  }


const matchedTemplate = templates.find(t => t.image === data.data.image);
if (matchedTemplate) {
  setSelectedTemplateId(matchedTemplate.id);
}

const formattedScriptures = data.data.session_scriptures.map((s) => ({
  id: s.id,
  scripture: s.scripture,
}));

setScriptures(formattedScriptures);

   // setCategories(data.data.categories);
  };


const handleAddScripture = () => {
  setScriptures([...scriptures, '']);
};


const handleScriptureChange = (index, value) => {
  const updated = [...scriptures];
  updated[index].scripture = value;
  setScriptures(updated);
};
const handleAddPrayerPoint = () => {
  setPrayerPoints([...prayerPoints, { title: '', telugu: '', english: '' }]);
};

const handlePrayerPointChange = (index, field, value) => {
  const updated = [...prayerPoints];
  updated[index][field] = value;
  setPrayerPoints(updated);
};


 const handleAddDevotion = async () => {
    const token = localStorage.getItem('token');

  if(title=='' || category=='' || description=='' || fromTime=='' || toTime=='' || slotDuration==''){
    alert("Category and Title and Description and  from Time and To time and Slot duration is required")
    return false;
  }
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

  if(prayerFrequency=='Weekly'){

    if(daysOfWeek.length<1){
         alert("Day of week is required")
        return false;
    }
  }

  for(var i=0;i<prayerPoints.length;i++){
    if(prayerPoints[i]['title']=='' || prayerPoints[i]['english']==''){
        alert('Prayer Point'+(i+1)+' '+ 'Title and English Prayer Point is required')
        return false
    }
  }


console.log('Image URL:', templates.find(t => t.id === selectedTemplateId)?.image);

    const response = await fetch(`${API_URL}update-special-prayer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // ❌ Do NOT set 'Content-Type' when sending FormData
      },
      body: JSON.stringify({
       title:title,
       category:category,
       description:description,
       prayerPlan:prayerPlan,
       fromDate:fromDate,

       toDate:toDate,
       fromTime:fromTime,
       toTime:toTime,
       numberOfDays:numberOfDays,
       slotDuration:slotDuration,

       prayerType:prayerType,
       prayerFrequency:prayerFrequency,
       prayerType:prayerType,
       daysOfWeek:daysOfWeek,
       scriptures:scriptures,
       prayerPoints:prayerPoints,
       selectedTemplateId:templates.find(t => t.id === selectedTemplateId)?.image,
       id:id
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


   const generatePrayerPoints = async () => {
    setLoading(true);
    setGeneratedPoints([]);
    try {
      const country_code = "in";
      const no_of_prayers = 20;

      const res = await fetch(
        `http://64.227.157.61:8004/generate-prayers?country=in&count=5`
      );
      const data = await res.json();

      let formatted = data.formatted_output
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/```json|```/gi, "")
        .trim();

      const correctData = JSON.parse(formatted);

      if (correctData && Array.isArray(correctData)) {
        // Flatten points with category
        const parsedPoints = [];
        correctData.forEach((section) => {
          section.prayer_points.forEach((point) => {
            parsedPoints.push({
              id: ++pointCount,
              title: section.category.replace(/\s*\d+\.\s*/, " "),
              english: point.en,
              telugu: point.te,
            });
          });
        });
        setGeneratedPoints(parsedPoints);
        setPointCount(pointCount);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };
 const approvePrayerPoint = (index) => {
    const point = generatedPoints[index];

    const newApproved = {
      id: Date.now(), // new unique id
      title: point.title,
      english: point.english,
      telugu: point.telugu,
    };

    setPrayerPoints((prev) => [...prev, newApproved]);
  };
  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: "900px" }}>
        <Typography variant="h5" gutterBottom>
          Edit Special Prayer
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
        >
          {/* Title */}
          <Box flex="1 1 48%">
            <TextField label="Title" value={title} required fullWidth onChange={(e) => setTitle(e.target.value)} />
          </Box>

         <Box flex="1 1 48%">

         <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <MenuItem value="">
                    <em>Select category</em>
                  </MenuItem>
                   {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </MenuItem>
                              ))}
                </Select>
              </FormControl>
         </Box>
 </Box>
          {/* Description */}
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Description *
          </Typography>


            <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={(content) => setDescription(content)}
                      />
        </Box>

          
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



          <Box flex="1 1 48%">
            <TextField
              label="From Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={fromTime}
              onChange={(e) => setfromTime(e.target.value)}
            />
          </Box>

          {/* To Time */}
          <Box flex="1 1 48%">
            <TextField
              label="To Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />
          </Box>
        </Box>



        <Box flex="1 1 48%" mt={2}>
           <FormControl fullWidth required>
                <InputLabel>Slot Duration</InputLabel>
                <Select label="Category" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} >
                  <MenuItem value="">
                    <em>Select Duration</em>
                  </MenuItem>
                  <MenuItem value="10">10 minutes</MenuItem>
                  <MenuItem value="15">15 minutes</MenuItem>
                   <MenuItem value="30">30 minutes</MenuItem>
                    <MenuItem value="60">60 minutes</MenuItem>
                </Select>
              </FormControl>      
         
          </Box>

            <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
          mt={5}
        >
        {/* Pray Type */}
        <Box flex="1 1 48%" mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Pray Type *
          </Typography>
          <RadioGroup
            row
            value={prayerType}
            onChange={(e) => setPrayerType(e.target.value)}
          >
            <FormControlLabel
              value="Group"
              control={<Radio />}
              label="Group"
            />
            <FormControlLabel
              value="Personal"
              control={<Radio />}
              label="Personal"
            />
          </RadioGroup>
        </Box>

        {/* Prayer Frequency */}
       <Box flex="1 1 48%" mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Prayer Frequency *
          </Typography>
          <RadioGroup
            row
            value={prayerFrequency}
            onChange={(e) => setPrayerFrequency(e.target.value)}
          >
            <FormControlLabel
              value="Daily"
              control={<Radio />}
              label="Daily"
            />
            <FormControlLabel
              value="Weekly"
              control={<Radio />}
              label="Weekly"
            />
          </RadioGroup>
        </Box>
{prayerFrequency=="Weekly" && (
       <Box flex="1 1 48%" mt={2}>
  <FormControl fullWidth>
    <InputLabel>Day of Week</InputLabel>
    <Select
      multiple
      value={daysOfWeek}
      onChange={(e) => setDaysOfWeek(e.target.value)}
      label="Day of Week"
      renderValue={(selected) => selected.join(', ')}
    >
      {[
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ].map((day) => (
        <MenuItem key={day} value={day}>
          <Checkbox checked={daysOfWeek.indexOf(day) > -1} />
          <ListItemText primary={day} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>
)}
</Box>

        {/* Scripture */}
       <Box flex="1 1 100%" mt={2}>
  <Typography variant="subtitle1" gutterBottom>
    Scriptures:
  </Typography>

{scriptures.map((item, index) => (
  <Box key={item.id || index} mt={1}>
    <TextField
      label={`Scripture ${index + 1}`}
      value={item.scripture}
      onChange={(e) => handleScriptureChange(index, e.target.value)}
      fullWidth
    />
  </Box>
))}


 <Button variant="contained" onClick={() => setScriptures([...scriptures, { id: '', scripture: '' }])}>
  Add Scripture
</Button>
</Box>



          {/* Scripture */}
     <Box flex="1 1 100%" mt={2}>
  <Typography variant="subtitle1" gutterBottom>
    Prayer Points:
  </Typography>

  {prayerPoints.map((point, index) => (
    <Box key={index} mt={2} display="flex" flexDirection="column" gap={2}>
      <TextField
        label={`Prayer Topic ${index + 1}`}
        value={point.title}
        onChange={(e) => handlePrayerPointChange(index, 'title', e.target.value)}
        fullWidth
      />
      
      <TextField
        label="English Prayer Point"
        value={point.english}
        onChange={(e) => handlePrayerPointChange(index, 'english', e.target.value)}
        fullWidth
      />
      <TextField
        label="Telugu Prayer Point"
        value={point.telugu}
        onChange={(e) => handlePrayerPointChange(index, 'telugu', e.target.value)}
        fullWidth
      />
    </Box>
  ))}






     {/* Render generated points */}
      {generatedPoints.map((point, index) => (
        <Box
          key={index}
          mt={2}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Typography variant="h6">{point.title}</Typography>

          <TextField
            label={`English Prayer Point`}
            value={point.english}
            onChange={(e) =>
              handlePrayerPointChange(index, "english", e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Telugu Prayer Point"
            value={point.telugu}
            onChange={(e) =>
              handlePrayerPointChange(index, "telugu", e.target.value)
            }
            fullWidth
          />

          <Button
            variant="outlined"
            color="success"
            onClick={() => approvePrayerPoint(index)}
          >
            Approve
          </Button>
        </Box>
      ))}












{user?.role===1 ?(

   <Button variant="contained" onClick={generatePrayerPoints} sx={{ mt: 2 }}>
    Generate Prayer Points
  </Button>
)



: (
      <Button variant="contained" onClick={handleAddPrayerPoint} sx={{ mt: 2 }}>
    + Prayer Point
  </Button>

)

}

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
