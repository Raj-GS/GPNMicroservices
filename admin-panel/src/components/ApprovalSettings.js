import React, { useState,useEffect } from 'react';
import { Box, Button } from '@mui/material';
const ApprovalSettings = ({ approvals }) => {



        const [prayerApproval, setPrayerApproval] = useState('no');
        const [prayerBv, setPrayerBv] = useState('no');
        const [testimonyApproval, setTestimonyApproval] = useState('no');
        const [testimonyBv, setTestimonyBv] = useState('no');
        const [backgroundVerify, setBackgroundVerify] = useState('no');
        const [backgroundBv, setBackgroundBv] = useState('no');
        const [rideApproval, setRideApproval] = useState('no');
        const [rideBv, setRideBv] = useState('no');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';

useEffect(() => {
    if (approvals) {
      setPrayerApproval(approvals.prayer?.approval || "no");
      setPrayerBv(approvals.prayer?.bv_status || "no");

      setTestimonyApproval(approvals.testimony?.approval || "no");
      setTestimonyBv(approvals.testimony?.bv_status || "no");

      setBackgroundVerify(approvals.backgroundVerification?.approval || "no");

      setRideApproval(approvals.rider?.approval || "no");
      setRideBv(approvals.rider?.bv_status || "no");
    }
  }, [approvals]);

const SaveApprovalSettings = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}update-approval-settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            prayer: {
                approval: prayerApproval,
                bv_status: prayerBv,
            },
            testimony: {
                approval: testimonyApproval,
                bv_status: testimonyBv,
            },
            backgroundVerification: {  
                approval: backgroundVerify,
                bv_status: backgroundBv,
            },
            rider: {
                approval: rideApproval,
                bv_status: rideBv,
            },
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
                                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Prayer Module</div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontWeight: 500 }}>Prayer posts need approval?</label>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12,marginTop: 10 }}>
                                        <span style={{ fontWeight: 500, marginRight: 8 }}>{prayerApproval === "yes" ? 'Enabled' : 'Disabled'}</span>
                                        <label className="switch">
<input
  type="checkbox"
  checked={prayerApproval === "yes"} // convert "yes"/"no" to boolean
  onChange={e => setPrayerApproval(e.target.checked ? "yes" : "no")} // convert boolean to "yes"/"no"
/>
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                
                                    </div>

                                    {prayerApproval=== 'yes' && (

                                    <div>
                                        <label>
                                            <input
                                        type="checkbox"
                                        checked={prayerBv === "yes"} // convert to boolean
                                        onChange={e => setPrayerBv(e.target.checked ? "yes" : "no")} // convert back to "yes"/"no"
                                        style={{ marginRight: 8 }}
                                        />

                                            Exclude those with Background verification
                                        </label>
                                    </div>
                                    )}

                                    {prayerApproval === 'no' && (

                                     <div>
                                        <label>
                                           <input
                                        type="checkbox"
                                        checked={prayerBv === "yes"} // convert to boolean
                                        onChange={e => setPrayerBv(e.target.checked ? "yes" : "no")} // convert back to "yes"/"no"
                                        style={{ marginRight: 8 }}
                                        />

                                            Include those without Background verification
                                        </label>
                                    </div>
                                    )}
                                </div>






                        <div style={{ marginTop: 24,borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
                                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Testimony Module</div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontWeight: 500 }}>Testimony posts need approval</label>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12,marginTop: 10 }}>
                                        <span style={{ fontWeight: 500, marginRight: 8 }}>{testimonyApproval === "yes" ? 'Enabled' : 'Disabled'}</span>
                                        <label className="switch">
                                            <input type="checkbox"
                                                checked={testimonyApproval === "yes"} // convert "yes"/"no" to boolean
                                                onChange={e => setTestimonyApproval(e.target.checked ? "yes" : "no")}
                                              
                                              />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                
                                    </div>

                                    {testimonyApproval === 'yes' && (
                                    <div>
                                        <label>
                                            <input
                                                type="checkbox"

                                        checked={testimonyBv === "yes"} // convert to boolean
                                        onChange={e => setTestimonyBv(e.target.checked ? "yes" : "no")} // convert back to "yes"/"no"
                                                style={{ marginRight: 8 }}
                                            />
                                            Exclude those with Background verification
                                        </label>
                                    </div>
                                    )}
                                    {testimonyApproval === 'no' && (

                                     <div>
                                        <label>
                                            <input
                                                type="checkbox"
                                                 checked={testimonyBv === "yes"} // convert to boolean
                                                 onChange={e => setTestimonyBv(e.target.checked ? "yes" : "no")} // convert back to "yes"/"no"
                                                style={{ marginRight: 8 }}
                                            />
                                            Include those without Background verification
                                        </label>
                                    </div>
                                    )}
                                </div>


                             <div style={{ marginTop: 24,borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
                                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Background Verification</div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontWeight: 500 }}>Is Background verification needed?</label>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12,marginTop: 10 }}>
                                        <span style={{ fontWeight: 500, marginRight: 8 }}>{backgroundVerify=='yes' ? 'Enabled' : 'Disabled' }</span>
                                        <label className="switch">
                                            <input type="checkbox"
                                             
                                             checked={backgroundVerify === "yes"} // convert "yes"/"no" to boolean
                                             onChange={e => setBackgroundVerify(e.target.checked ? "yes" : "no")}
                                             
                                             />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                
                                    </div>
                                </div>    


                        <div style={{ marginTop: 24,borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
                                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Give Ride/ Get Ride</div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontWeight: 500 }}>Rider need approval</label>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12,marginTop: 10 }}>
                                        <span style={{ fontWeight: 500, marginRight: 8 }}>Enabled</span>
                                        <label className="switch">
                                            <input type="checkbox"
                                            checked={rideApproval === "yes"} // convert "yes"/"no" to boolean
                                             onChange={e => setRideApproval(e.target.checked ? "yes" : "no")}
                                             
                                             />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                
                                    </div>
                                    {rideApproval === 'yes' && (

                                    <div>
                                        <label>
                                            <input
                                                type="checkbox"

                                                 checked={rideBv === "yes"} // convert to boolean
                                                 onChange={e => setRideBv(e.target.checked ? "yes" : "no")} // convert back to "yes"/"no"
                                             
                                                style={{ marginRight: 8 }}
                                            />
                                            Exclude those with Identity verification
                                        </label>
                                    </div>
                                    )}
                                    {rideApproval === 'no' && (

                                     <div>
                                        <label>
                                            <input
                                                type="checkbox"
                                                 checked={rideBv === "yes"} // convert to boolean
                                                 onChange={e => setRideBv(e.target.checked ? "yes" : "no")} // convert back to "yes"/"no"
                                                style={{ marginRight: 8 }}
                                            />
                                            Include those without Identity verification
                                        </label>
                                    </div>
                                    )}
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
export default ApprovalSettings;