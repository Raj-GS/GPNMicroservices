import React, { useState,useEffect } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import styles
const FaithStatementSettings = ({ mySettings }) => {
    const [faithstatement, setFaithstatement] = useState('');
    const [id, setId] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';


    const handleCancel = () => {
        setFaithstatement('');
    };


        const handleSave = async() => {

         const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}update-faithstatement-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                faith_statement: faithstatement,
                settingId: id,
            }),
        });
        if (response.ok) {
            alert("Settings saved successfully!");
        } else {
            const errorData = await response.json();
            alert(`Error saving settings: ${errorData.message}`);
        }
     
    };

        useEffect(() => {
            if (mySettings && mySettings.length > 0) {
                const orgSettings = mySettings[0]; // first org's settings
                setFaithstatement(orgSettings.faith_statement || '');
                setId(orgSettings.id || null);
            }
        }, [mySettings]);

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 16, background: '#fff' }}>


            <ReactQuill
              theme="snow"
              value={faithstatement}
              onChange={(content) => setFaithstatement(content)}
            />


            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button
                    style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4, marginRight: 10 }}
                     onClick={handleSave}
                >
                    Save
                </button>
                <button
                    style={{ background: '#757575', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4 }}
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default FaithStatementSettings;