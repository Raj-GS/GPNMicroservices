import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
const dailydetionsimages = [
  'Daily_devotion.png',
  'daily_devotion2.jpg',
  'daily_devotion3.jpg',
  'daily_devotion4.jpg',
  'daily_devotion6.png',
  'daily_devotion7.png'
];

const churchhistoryimages = [
  'church_history1.jpg',
  'church_history2.jpg',
  'church_history3.jpg',
  'church_history4.jpg',
  'church_history5.jpg',
];

const eventsimages = [
  'events.jpeg',
  'events2.jpg',
  'events3.jpg',
  'events4.jpg',
  'events5.png',
];

const testimoniesimages = [
  'testimony.png',
  'testimony2.jpg',
  'testimony3.jpg',
];

const worshipimages = [
  'worship.jpeg',
  'worship2.jpg',
  'worship3.jpg',
  'worship4.jpg',
  'worship5.jpg',

];

const settingsData = [
    {
        name: 'Daily Devotion',
        ecolumn: "hdailydevotion",
        imgcolumn: "hdailydevotionimg",
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
       
    },
    {
        name: 'Church History',
        ecolumn: "hchurchhistory",
        imgcolumn: "hchurchhistoryimg",
        img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Events',
        ecolumn: "hevents",
        imgcolumn: "heventsimg",
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Sunday Worships',
        ecolumn: "hworships",
        imgcolumn: "hworshipsimg",
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Testimonies',
        ecolumn: "htestimonies",
        imgcolumn: "htestimoniesimg",
        img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    },
];

const sampleTemplates = [
  { id: 1, name: "Template 1", description: "A clean homepage layout." },
  { id: 2, name: "Template 2", description: "A modern dashboard style." },
  { id: 3, name: "Template 3", description: "A minimal welcome screen." },
];

const AppHomeSettings = ({ mySettings }) => {
    const [enabled, setEnabled] = useState([]);
    const [files, setFiles] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [currentRequest, setCurrentRequest] = useState('');


    const [devotionEnabled, setdevotionEnabled] = useState('no');
    const [churchhistoryEnabled, setchurchhistoryEnabled] = useState('no');
    const [eventsenabled, seteventsenabled] = useState('no');
    const [testimonyEnabled, settestimonyEnabled] = useState('no');
    const [worshipEnabled, setWorshipEnabled] = useState('no');
    const [devotionImg, setdevotionImg] = useState('');
    const [churchHistoryImg, setchurchHistoryImg] = useState('');
    const [eventimg, seteventimg] = useState('');
    const [testimonyImg, settestimonyImg] = useState('');
    const [worshipImg, setworshipImg] = useState('');
    const [id, setId] = useState(null);
const fileMeta = [];
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
const Image_URL = process.env.REACT_APP_Image_URL;

    // Dynamically set from mySettings
    useEffect(() => {
        if (mySettings && mySettings.length > 0) {
            const orgSettings = mySettings[0]; // first org's settings

            setdevotionEnabled(orgSettings.hdailydevotion || 'no');
            setchurchhistoryEnabled(orgSettings.hchurchhistory || 'no');
            seteventsenabled(orgSettings.hevents || 'no');
            settestimonyEnabled(orgSettings.htestimonies || 'no');
            setWorshipEnabled(orgSettings.hworships || 'no');

            setdevotionImg(orgSettings.hdailydevotionimg || '');
            setchurchHistoryImg(orgSettings.hchurchhistoryimg || '');
            seteventimg(orgSettings.heventsimg || '');
            settestimonyImg(orgSettings.htestimoniesimg || '');
            setworshipImg(orgSettings.hworshipsimg || '');



            setId(orgSettings.id || null);

            const newEnabled = settingsData.map(setting =>
                orgSettings[setting.ecolumn] === 'yes'
            );
            setEnabled(newEnabled);

            const newImages = settingsData.map(setting =>
            orgSettings[setting.imgcolumn] || null
        );
            setFiles(new Array(settingsData.length).fill(null));
        }
    }, [mySettings]);

    const handleEnableChange = (idx) => {
        setEnabled((prev) => {
            const copy = [...prev];
            copy[idx] = !copy[idx];
            return copy;
        });
    };

    const handleFileChange = (idx, e) => {
        setFiles((prev) => {
            const copy = [...prev];
            copy[idx] = e.target.files[0];
            return copy;
        });
    };

    const handleOpenDialog = (settingname) => {
        setDialogOpen(true)
        setCurrentRequest(settingname)
        setSelectedTemplate(null); // Reset selected template when opening dialog
    };
    const handleCloseDialog = () => setDialogOpen(false);
    const handleSelectTemplate = (template) => setSelectedTemplate(template);

const SaveApprovalSettings = async () => {
    const token = localStorage.getItem('token');

    const formData = new FormData();

    // Add enabled states
    formData.append("id", id);

    // Add normal fields
    formData.append("hdailydevotion", JSON.stringify({
        enabled: devotionEnabled,
        img: devotionImg
    }));

    formData.append("hchurchhistory", JSON.stringify({
        enabled: churchhistoryEnabled,
        img: churchHistoryImg
    }));

    formData.append("hevents", JSON.stringify({
        enabled: eventsenabled,
        img: eventimg
    }));

    formData.append("hworships", JSON.stringify({
        enabled: worshipEnabled,
        img: worshipImg
    }));

    formData.append("htestimonies", JSON.stringify({
        enabled: testimonyEnabled,
        img: testimonyImg
    }));

// Loop through files and settings together
files.forEach((file, idx) => {
    if (file) {
        formData.append("files", file);
        fileMeta.push({
            key: settingsData[idx].key,  // e.g., "logo", "banner"
            name: settingsData[idx].ecolumn || null
        });
    }
});

formData.append("fileMeta", JSON.stringify(fileMeta));


    const response = await fetch(`${API_URL}update-home-settings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Don't set Content-Type manually
        },
        body: formData
    });

    if (response.ok) {
        alert("Settings saved successfully!");
    } else {
        const errorData = await response.json();
        alert(`Error saving settings: ${errorData.message}`);
    }
};



    return (
        <section
            style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                padding: 24,
                gap: 24
            }}
        >
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Setting</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Enable</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Select Your Template</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Upload Template</th>
                    </tr>
                </thead>
                <tbody>
                    {settingsData.map((setting, idx) => (
                        <tr key={setting.name} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '16px', border: '1px solid #ddd' }}>{setting.name}</td>
                            <td style={{ textAlign: 'center', border: '1px solid #ddd' }}>
                                <input
                                    type="checkbox"
                                    checked={ setting.name=='Daily Devotion' ? devotionEnabled === 'yes' :
                                            setting.name=='Church History' ? churchhistoryEnabled === 'yes' :
                                            setting.name=='Events' ? eventsenabled === 'yes' :
                                            setting.name=='Testimonies' ? testimonyEnabled === 'yes' :
                                            setting.name=='Sunday Worships' ? worshipEnabled === 'yes' : enabled[idx] || false}
                                    onChange={() => setting.name=='Daily Devotion' ? setdevotionEnabled(devotionEnabled === 'yes' ? 'no' : 'yes') :
                                            setting.name=='Church History' ? setchurchhistoryEnabled(churchhistoryEnabled === 'yes' ? 'no' : 'yes') :
                                            setting.name=='Events' ? seteventsenabled(eventsenabled === 'yes' ? 'no' : 'yes') :
                                            setting.name=='Testimonies' ? settestimonyEnabled(testimonyEnabled === 'yes' ? 'no' : 'yes') :
                                            setting.name=='Sunday Worships' ? setWorshipEnabled(worshipEnabled === 'yes' ? 'no' : 'yes') :
                                            handleEnableChange(idx)}
                                    style={{ width: 20, height: 20 }}
                                />
                            </td>
                            <td
  style={{
    border: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'center',  // horizontal center
    alignItems: 'center',      // vertical center
    height: '100%'
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: 8,
      background: '#f9f9f9',
      borderRadius: 8,
      width: 260
    }}
  >
<img
  src={
    setting.name === "Daily Devotion"
      ? `${Image_URL}${devotionImg}`
      : setting.name === "Church History"
      ? `${Image_URL}${churchHistoryImg}`
      : setting.name === "Events"
      ? `${Image_URL}${eventimg}`
      : setting.name === "Testimonies"
      ? `${Image_URL}${testimonyImg}`
      : setting.name === "Sunday Worships"
      ? `${Image_URL}${worshipImg}`
      : "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
  }
  alt={setting.name}
  style={{
    width: 100,
    height: 70,
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #ccc",
  }}
/>


    <button
      style={{
        background: '#1976d2',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '8px 18px',
        cursor: 'pointer',
        fontWeight: 500
      }}
     onClick={() => handleOpenDialog(setting.name)} // ✅ Runs only when clicked

    >
      More..
    </button>
  </div>
</td>

                           <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
  <input
    type="file"
    onChange={(e) => handleFileChange(idx, e)}
    style={{
      marginRight: 8,
      padding: '6px 0'
    }}
  />
</td>



                        </tr>
                    ))}
                </tbody>
            </table>



            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button
                style={{
                  backgroundColor: "#c0c5cfff",
                  color: "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                onClick={() => window.location.reload()}
              >
                Cancel
              </Button>
            
              <Button variant="contained" sx={{ background: "#177373" }} onClick={SaveApprovalSettings}>
                Save Settings
              </Button>
            </Box>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Select a Template</DialogTitle>
        <DialogContent>
<Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>

  {currentRequest === 'Daily Devotion' &&
    dailydetionsimages.map((image, index) => (
         <Grid key={index} size={{ xs: 12, sm: 4, md: 4 }}>

        <Card
          variant={selectedTemplate?.id === index + 1 ? "outlined" : "elevation"}
          sx={{
            cursor: "pointer",
            border:
              selectedTemplate?.id === index + 1
                ? "2px solid #2563eb"
                : "1px solid #e0e0e0",
          }}
          onClick={() => {
  setdevotionImg(`${Image_URL}sample/daily_devotion/${image}`)

             setSelectedTemplate({ id: index + 1 });
}
          }
        >
          <CardContent>
            {/* <Typography variant="h6">Daily Devotion {index + 1}</Typography> */}
            <img
              src={`${Image_URL}sample/daily_devotion/${image}`}
              alt={`Daily Devotion ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))
  }


  {currentRequest === 'Church History' &&
    churchhistoryimages.map((image, index) => (
         <Grid key={index} size={{ xs: 12, sm: 4, md: 4 }}>

        <Card
          variant={selectedTemplate?.id === index + 1 ? "outlined" : "elevation"}
          sx={{
            cursor: "pointer",
            border:
              selectedTemplate?.id === index + 1
                ? "2px solid #2563eb"
                : "1px solid #e0e0e0",
          }}
          onClick={() => {

            setchurchHistoryImg(`sample/church_history/${image}`)
        
         setSelectedTemplate({ id: index + 1 });
        }
    }
       
          
        >
          <CardContent>
            {/* <Typography variant="h6">Daily Devotion {index + 1}</Typography> */}
            <img
              src={`${Image_URL}sample/church_history/${image}`}
              alt={`Church History ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))
  }



    {currentRequest === 'Events' &&
    eventsimages.map((image, index) => (
         <Grid key={index} size={{ xs: 12, sm: 4, md: 4 }}>

        <Card
          variant={selectedTemplate?.id === index + 1 ? "outlined" : "elevation"}
          sx={{
            cursor: "pointer",
            border:
              selectedTemplate?.id === index + 1
                ? "2px solid #2563eb"
                : "1px solid #e0e0e0",
          }}
          onClick={() => {
            seteventimg(`sample/events/${image}`)
             setSelectedTemplate({ id: index + 1 });
        
        }
    }
         
        >
          <CardContent>
            {/* <Typography variant="h6">Daily Devotion {index + 1}</Typography> */}
            <img
              src={`${Image_URL}sample/events/${image}`}
              alt={`Events ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))
  }


    {currentRequest === 'Sunday Worships' &&
    worshipimages.map((image, index) => (
         <Grid key={index} size={{ xs: 12, sm: 4, md: 4 }}>

        <Card
          variant={selectedTemplate?.id === index + 1 ? "outlined" : "elevation"}
          sx={{
            cursor: "pointer",
            border:
              selectedTemplate?.id === index + 1
                ? "2px solid #2563eb"
                : "1px solid #e0e0e0",
          }}
          onClick={() =>{
            setworshipImg(`sample/worship/${image}`);
            setSelectedTemplate({ id: index + 1 });
        
        } }
           
          
        >
          <CardContent>
            {/* <Typography variant="h6">Daily Devotion {index + 1}</Typography> */}
            <img
              src={`${Image_URL}sample/worship/${image}`}
              alt={`Sunday Worships ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))
  }


    {currentRequest === 'Testimonies' &&
    testimoniesimages.map((image, index) => (
         <Grid key={index} size={{ xs: 12, sm: 4, md: 4 }}>

        <Card
          variant={selectedTemplate?.id === index + 1 ? "outlined" : "elevation"}
          sx={{
            cursor: "pointer",
            border:
              selectedTemplate?.id === index + 1
                ? "2px solid #2563eb"
                : "1px solid #e0e0e0",
          }}
          onClick={() => {
  settestimonyImg(`sample/testimonies/${image}`);
  setSelectedTemplate({ id: index + 1 });
}}
            
            
        >
          <CardContent>
            {/* <Typography variant="h6">Daily Devotion {index + 1}</Typography> */}
            <img
              src={`${Image_URL}sample/testimonies/${image}`}
              alt={`Testimonies ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))
  }







</Grid>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedTemplate}
            onClick={handleCloseDialog}
          >
            Select
          </Button>
        </DialogActions>
      </Dialog>
        </section>
    );
};

export default AppHomeSettings;
