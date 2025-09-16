import React, { useState,useEffect } from 'react';

const initialRows = [
    { module: 'Sunday Worship', media: 'Youtube', channelName: '', channelId: '' },
    { module: 'Bible Study', media: 'Youtube', channelName: '', channelId: '' },
];

export default function YoutubeSettings({biblestudy, worship}) {
    const [rows, setRows] = useState(initialRows);
    const[worshipChannelName, setworshipChannelName] = useState(worship.channelName || '');
    const[biblestudyChannelName, setbiblestudyChannelName] = useState(biblestudy.channelName || '');
    const[worshipChannelId, setworshipChannelId] = useState(worship.channelId || '');
    const[biblestudyChannelId, setbiblestudyChannelId] = useState(biblestudy.channelId || '');
    const [bid, setBId] = useState(null);
    const [wid, setwId] = useState(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';

    const handleChange = (index, field, value) => {
        console.log(`Changing ${field} for ${rows[index].module} to ${value}`);
        if (field === 'channelName') {
            if (index === 0) {
                setworshipChannelName(value);
            } else {
                setbiblestudyChannelName(value);
            }
        } else if (field === 'channelId') {
            if (index === 0) {
                setworshipChannelId(value); 
            } else {
                setbiblestudyChannelId(value);
            }
        }

    
    };

    const handleSave = async() => {

         const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}update-youtube-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                wchannel_name: worshipChannelName,
                wchannel_id: worshipChannelId,
                bchannel_name: biblestudyChannelName,
                bchannel_id: biblestudyChannelId,
                bmoduleId: bid,
                wmoduleId: wid,
            }),
        });
        if (response.ok) {
            alert("Settings saved successfully!");
        } else {
            const errorData = await response.json();
            alert(`Error saving settings: ${errorData.message}`);
        }
     
    };

    const handleCancel = () => {
        setRows(initialRows);
    };
    useEffect(() => {
        if (biblestudy && biblestudy.length > 0 && worship && worship.length > 0) {
            const orgbibleSettings = biblestudy[0]; // first org's settings
            const orgworshipSettings = worship[0];
            setworshipChannelName(orgworshipSettings.channel_name || 'no');
            setworshipChannelId(orgworshipSettings.channel_id || 'no');
            setbiblestudyChannelName(orgbibleSettings.channel_name || 'no');
            setbiblestudyChannelId(orgbibleSettings.channel_id || 'no');
            setBId(orgbibleSettings.id || null);
            setwId(orgworshipSettings.id || null);
        }
    }, [biblestudy, worship]);
    return (
        <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 16, background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Module</th>
                        <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Media</th>
                        <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Channel Name</th>
                        <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Channel ID</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={row.module}>
                            <td style={{ padding: 8 }}>{row.module}</td>
                            <td style={{ padding: 8 }}>{row.media}</td>
                            <td style={{ padding: 8 }}>
                                <input
                                    type="text"
                                    value={row.module=== 'Sunday Worship' ? worshipChannelName : biblestudyChannelName}
                                    onChange={e => handleChange(idx, 'channelName', e.target.value)}
                                    style={{ width: '95%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                            </td>
                            <td style={{ padding: 8 }}>
                                <input
                                    type="text"
                                    value={row.module === 'Sunday Worship' ? worshipChannelId : biblestudyChannelId}
                                    onChange={e => handleChange(idx, 'channelId', e.target.value)}
                                    style={{ width: '95%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ textAlign: 'right' }}>
                <button
                    onClick={handleSave}
                    style={{
                        background: '#21829c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 20px',
                        marginRight: 8,
                        cursor: 'pointer'
                    }}
                >
                    Save
                </button>
                <button
                    onClick={handleCancel}
                    style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 20px',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}