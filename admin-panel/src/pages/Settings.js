import React, { useState,useEffect } from "react";
import ApprovalSettings from "../components/ApprovalSettings";
import FeatureSettings from "../components/FeatureSetting";
import AppHomeSettings from "../components/AppHomeSettings";
import AppBottomSettings from "../components/AppBottomSettings";
import YoutubeSettings from "../components/YoutubeSettings";
import FaithStatementSettings from "../components/FaithStatementSettings";
import PageLoader from "../components/PageLoader";
const Settings = () => {

    const [currentTab, setCurrentTab] = useState("Approval Settings");

    const [Approvals, setApprovals] = useState([]);
    const [mySettings, setmySettings] = useState([]);
    const [biblestudy, setbiblestudy] = useState([]);
    const [worship, setworship] = useState([]);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
const [loading, setLoading] = useState(true);

      useEffect(() => {
        fetchSettings();
      }, []);
    
      const fetchSettings = async () => {
        // Replace this with your actual API call
          try {
       setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}settings`,{
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
    
        setApprovals(data.approvalSettings);
        setmySettings(data.settings);
        setbiblestudy(data.bibleStudies);
        setworship(data.sundayWorships);
        
     } catch (err) {
       // setError('Network error. Please try again.');
      } finally {
        setLoading(false);
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
        <div style={{ background: "#fafbfc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
            {/* <div style={{ display: "flex", height: "100vh" }}> */}


                {/* Main Content */}
                <main style={{ flex: 1, padding: "32px 40px" }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Settings</h1>
                        <div style={{ color: "#6b7280" }}>Configure system settings, modules, and templates.</div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 32 }}>
                        {["Approval Settings", "Feature Settings","APP Home Page Settings", "App Bottom Bar Settings", "Sunday Worship & Bible Study Settings", "Faith Statement Settings"].map((tab, i) => (
                            <div key={tab}

                            onClick={() => setCurrentTab(tab)}
                                style={{
                                    padding: "12px 24px",
                                    fontWeight: 500,
                                  borderBottom: currentTab === tab ? "2px solid #2563eb" : "none",
color: currentTab === tab ? "#2563eb" : "#374151",
                                    cursor: "pointer"
                                }}>

                                {tab}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 32 }}>
                        {/* Left Column */}
                        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 24 }}>
                            {/* Approval Settings */}
                            {currentTab === "Approval Settings" && (
                                <ApprovalSettings approvals={Approvals} />
                            )}
                            { currentTab === "Feature Settings" && (
                                <FeatureSettings mySettings={mySettings}/>
                            )}
                            {currentTab === "APP Home Page Settings" && (
                                <AppHomeSettings mySettings={mySettings} />
                            )}
                            {currentTab === "App Bottom Bar Settings" && (
                                <AppBottomSettings mySettings={mySettings} />
                            )}
                            {currentTab === "Sunday Worship & Bible Study Settings" && (
                                <YoutubeSettings biblestudy={biblestudy} worship={worship} />
                            )}
                            {currentTab === "Faith Statement Settings" && (
                                <FaithStatementSettings mySettings={mySettings} />
                            )}
                       
                           
                            
                          

                          


                        </div>


                    </div>
                </main>
            {/* </div> */}

            {/* Switch CSS */}
            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #e5e7eb;
                    border-radius: 24px;
                    transition: .4s;
                }
                .switch input:checked + .slider {
                    background-color: #2563eb;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    border-radius: 50%;
                    transition: .4s;
                }
                .switch input:checked + .slider:before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
};

export default Settings;