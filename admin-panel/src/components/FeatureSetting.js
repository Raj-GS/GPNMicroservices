import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';

const FeatureSettings = ({ mySettings }) => {  // destructure props here
  const [rideEnabled, setRideEnabled] = useState('no');
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  useEffect(() => {
    if (mySettings && mySettings.length > 0) {
            setRideEnabled(mySettings[0].ride || "no");

    }
  }, [mySettings]);


const SaveApprovalSettings = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}update-approval-settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            ride: {
                approval: rideEnabled,
            }
        }),
    });
    if (response.ok) {
        alert("Settings saved successfully!");
    }
    else {
        const errorData = await response.json();
        alert(`Error saving settings: ${errorData.message}`);
    }
};

    return (
                    <section style={{
                                background: "#fff",
                                borderRadius: 12,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                padding: 24,
                              
                                gap: 24
                            }}>
                                <div style={{ marginTop: 24,borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
                                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Ride Module</div>
                                    <div style={{ marginBottom: 16 }}>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12,marginTop: 10 }}>
                                        <span style={{ fontWeight: 500, marginRight: 8 }}>{rideEnabled === "yes" ? 'Enabled' : 'Disabled'}</span>
                                        <label className="switch">
                                            <input type="checkbox" checked={rideEnabled === "yes"} onChange={e => setRideEnabled(e.target.checked ? 'yes':'no')} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                
                                    </div>

           

                             
                                </div>












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



                            </section>
    );


}
export default FeatureSettings;