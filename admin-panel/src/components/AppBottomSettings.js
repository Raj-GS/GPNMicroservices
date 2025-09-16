import React, { useState, useEffect } from 'react';

const categories = ['Events', 'Testimonies', 'Messages', 'Songs'];

export default function AppBottomSettings({ mySettings }) {
    const [songsEnabled, setSongsEnabled] = useState('no');
    const [messageEnabled, setMessageEnabled] = useState('no');
    const [eventsEnabled, setEventsEnabled] = useState('no');
    const [testimonyEnabled, setTestimonyEnabled] = useState('no');
    const [id, setId] = useState(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
    useEffect(() => {
        if (mySettings && mySettings.length > 0) {
            const orgSettings = mySettings[0]; // first org's settings
            setSongsEnabled(orgSettings.songs || 'no');
            setMessageEnabled(orgSettings.messages || 'no');
            setEventsEnabled(orgSettings.events || 'no');
            setTestimonyEnabled(orgSettings.testimonies || 'no');
            setId(orgSettings.id || null);
        }
    }, [mySettings]);

    const getSelectedCount = () => {
        return [songsEnabled, messageEnabled, eventsEnabled, testimonyEnabled]
            .filter(v => v === 'yes').length;
    };

    const handleCheckboxChange = (cat) => {
        const selectedCount = getSelectedCount();
        const isCurrentlyChecked =
            (cat === 'Songs' && songsEnabled === 'yes') ||
            (cat === 'Messages' && messageEnabled === 'yes') ||
            (cat === 'Events' && eventsEnabled === 'yes') ||
            (cat === 'Testimonies' && testimonyEnabled === 'yes');

        // If trying to check and already have 2 selected → prevent
        if (!isCurrentlyChecked && selectedCount >= 2) {
            alert("You can select only two options at a time.");
            return;
        }

        // Toggle logic
        if (cat === 'Songs') setSongsEnabled(songsEnabled === 'yes' ? 'no' : 'yes');
        else if (cat === 'Messages') setMessageEnabled(messageEnabled === 'yes' ? 'no' : 'yes');
        else if (cat === 'Events') setEventsEnabled(eventsEnabled === 'yes' ? 'no' : 'yes');
        else if (cat === 'Testimonies') setTestimonyEnabled(testimonyEnabled === 'yes' ? 'no' : 'yes');
    };

    const SaveApprovalSettings = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}update-bottom-bar-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                songs: songsEnabled,
                messages: messageEnabled,
                events: eventsEnabled,
                testimonies: testimonyEnabled,
                id: id
            }),
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {categories.map(cat => (
                        <tr key={cat}>
                            <td style={{ padding: '16px 8px', fontSize: 18 }}>{cat}</td>
                            <td style={{ textAlign: 'right', padding: '16px 8px' }}>
                                <input
                                    type="checkbox"
                                    checked={
                                        cat === 'Songs' ? songsEnabled === 'yes' :
                                        cat === 'Messages' ? messageEnabled === 'yes' :
                                        cat === 'Events' ? eventsEnabled === 'yes' :
                                        cat === 'Testimonies' ? testimonyEnabled === 'yes' :
                                        false
                                    }
                                    onChange={() => handleCheckboxChange(cat)}
                                    style={{ width: 20, height: 20 }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <button
                    style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 24px',
                        marginRight: 10,
                        cursor: 'pointer'
                    }}
                    onClick={SaveApprovalSettings}
                >
                    Save
                </button>
                <button
                    style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 24px',
                        cursor: 'pointer'
                    }}
                    onClick={() => window.location.reload()}
                >
                    Cancel
                </button>
            </div>
        </section>
    );
}
