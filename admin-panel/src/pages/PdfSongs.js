import React, { useState,useEffect } from 'react';

// Example songs data
const songs = [
    {
        id: 1,
        title: 'Song One',
        pdfUrl: '/pdfs/song-one.pdf',
    },
    {
        id: 2,
        title: 'Song Two',
        pdfUrl: '/pdfs/song-two.pdf',
    },
    // Add more songs as needed
];

const PdfSongs = () => {
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [pdfs, setSongs] = useState([]);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
    const handlePdfClick = (pdfUrl) => {
        setSelectedPdf(pdfUrl);
    };

    const handleCloseModal = () => {
        setSelectedPdf(null);
    };

     useEffect(() => {
       const fetchPdfSongs = async () => {
         const token = localStorage.getItem('token');
         const response = await fetch(`${API_URL}songs-pdf-list`, {
           headers: {
             'Authorization': `Bearer ${token}`
           }
         });
         const data = await response.json();
         setSongs(data.data);
   
       };
   
       fetchPdfSongs();
     }, []); 

    return (
        <div>
            <h2>PDF Songs</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {pdfs.map((song) => (
                    <div
                        key={song.id}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '16px',
                            width: '200px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        <h3>{song.title}</h3>
                        <button
                            onClick={() => handlePdfClick(song.song_url)}
                            style={{
                                marginTop: '8px',
                                padding: '8px 12px',
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            View PDF
                        </button>
                    </div>
                ))}
            </div>

            {selectedPdf && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={handleCloseModal}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '24px',
                            borderRadius: '8px',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            position: 'relative',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleCloseModal}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: '#f44336',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                        <iframe
                            src={selectedPdf}
                            title="PDF Viewer"
                            style={{ width: '80vw', height: '80vh', border: 'none' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfSongs;