import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RegistrationLinks from "../components/RegistrationLinks";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,BarChart, Bar
} from "recharts";

import PageLoader from "../components/PageLoader";

const summaryData = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12% from last month",
    icon: "👥",
    column: 'totalUsers',
    url:"users"
  },
  {
    title: "Organizations",
    value: "2,341",
    change: "+8% from last month",
    icon: "🏢",
    column: 'totalOrganizations',
    url:"organizations"
  },
  {
    title: "Active Prayers",
    value: "8,492",
    change: "+23% from last month",
    icon: "🙏",
    column: 'approvedPrayers',
    url:"public-prayers"
  },
  {
    title: "Pending Approvals",
    value: "127",
    change: "Needs attention",
    icon: "⏰",
    column: 'pendingPrayers',
    url:"public-prayers"
  },
];

const quickActions = [
  { label: "Add New Prayer", icon: "➕" ,url:"#" },
  { label: "Review Prayers", icon: "✔️",url:'public-prayers' },
  { label: "System Settings", icon: "⚙️", url:'settings' },
];


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardCounts, setDashboardCounts] = useState([]);
  const [recentActivities1, setRecentActivities1] = useState(null);
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [requestText, setRequestText] = useState("");
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [reportdata, setReportdata] = useState([]);
  const [orgShortcode, setOrgShortcode]=useState('');
    
const API_URL = process.env.REACT_APP_API_URL;
  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormError("");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}dashboard-counts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to load profile');
        } else {

          setDashboardCounts(data.data.counts);
          setRecentActivities1(data.data.recent);
          setCategories(data.data.categories);
          setOrgShortcode(data.data.orgDetails?.short_code)

          const report = data.data.report; // 👈 extract "report"
      const formatted = Object.entries(report).map(([month, values]) => ({
        month,
        ...values,
      }));

         
          setReportdata(formatted);
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  
  const filteredSummaryData = summaryData.filter(item => {
    if (item.column === 'totalOrganizations') {
      return user?.role === 1; // Only show for role 1
    }
    return true; // Show all other cards
  });

  dayjs.extend(relativeTime);


// After fetching your API data:
const recentPrayers = recentActivities1?.recentPrayers || [];
const recentTestimonies = recentActivities1?.recentTestimonies || [];
const recentSpecialPrayerSubscriptions = recentActivities1?.recentSpecialPrayerSubscriptions || [];

const recentActivities = [
  ...recentPrayers.map(item => ({
    user: `${item.app_users.first_name} ${item.app_users.last_name}`,
    action: `submitted a prayer request: "${item.title}"`,
    time: dayjs(item.created_at).fromNow(), // or use your own formatting
    type: "Prayer",
  })),
  ...recentTestimonies.map(item => ({
    user: `${item.app_users.first_name} ${item.app_users.last_name}`,
    action: `shared a testimony: "${item.title}"`,
    time: dayjs(item.created_at).fromNow(),
    type: "Testimony",
  })),
  ...recentSpecialPrayerSubscriptions.map(item => ({
    user: `${item.app_users.first_name} ${item.app_users.last_name}`,
    action: `subscribed to special prayer: "${item.session_prayers.title}"`,
    time: dayjs(item.created_at).fromNow(),
    type: "Special Subscription",
  })),
].sort((a, b) => new Date(b.time) - new Date(a.time)); // Optional: sort by time

const quicklinks = (url) => {
  if(url=="#"){
    setOpenDialog(true)
  }else {
     window.location.href=url;
  }

}

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !title.trim() || !requestText.trim()) {
      setFormError("Please select a category and title and enter your prayer request.");
      return;
    }
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}add-public-prayer`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        title: title,
        description: requestText,
        priority: priority,
      }),
    });
    const data = await response.json();
    if(data.status === 200){
      alert("Prayer added successfully")
      window.location.reload();
    }else{
       alert("Prayer added successfully")
      window.location.reload();
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
    <div className="dashboard-content" style={{ padding: 24 }}>
      {/* Summary Cards */}
      <div className="summary-cards" style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        {filteredSummaryData.map((item) => (
          <div
            key={item.title}
            className="card"
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <div style={{ fontSize: 14, color: "#888" }}>{item.title}</div>
            <div style={{ fontSize: 32, fontWeight: 700}}><a href={item.url} style={{ 
      textDecoration: "none",   // removes underline
      color: "#ff8c00"          // MUI primary blue (you can change to any color)
    }}>{dashboardCounts?.[item.column] ?? 0}</a></div>
            <div style={{ fontSize: 14, color: "#4caf50" }}>{item.change}</div>
            <div style={{ fontSize: 28, marginLeft: "auto", marginTop: -32 }}>{item.icon}</div>
          </div>
        ))}
      </div>

{/* Main Content */}
{/* Main Content */}
<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
  {/* User Growth Chart */}
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
      Last 5 Months {user?.role === 1 ? "Organizations Report" : "Users Report"}
    </h3>
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={reportdata}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, "auto"]} />
          <Tooltip />
          <Legend />
          {user?.role === 1 ? (
            <Bar dataKey="organizations" fill="#4e79a7" radius={[6, 6, 0, 0]} />
          ) : (
            <Bar dataKey="users" fill="#82ca9d" radius={[6, 6, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Quick Actions */}
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Quick Actions</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {quickActions.map((action) => (
        <button
          key={action.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #e0e0e0",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#eef2ff";
            e.currentTarget.style.borderColor = "#c7d2fe";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#e0e0e0";
          }}
          onClick={() => quicklinks(action.url)}
        >
          <span style={{ fontSize: 18 }}>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  </div>
</div>



<RegistrationLinks shortCode={orgShortcode} />

      {/* Recent Activity */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3>Recent Activity</h3>
        <div>
        {recentActivities.map((activity, idx) => (
  <div
    key={idx}
    style={{
      display: "flex",
      alignItems: "center",
      borderBottom: idx < recentActivities.length - 1 ? "1px solid #f0f0f0" : "none",
      padding: "12px 0",
    }}
  >
    <div style={{ fontSize: 32, marginRight: 16 }}>👤</div>
    <div style={{ flex: 1 }}>
      <div>
        <strong>{activity.user}</strong> {activity.action}
      </div>
      <div style={{ fontSize: 12, color: "#888" }}>{activity.time}</div>
    </div>
    <div
      style={{
        background: "#f0f0f0",
        borderRadius: 12,
        padding: "2px 12px",
        fontSize: 12,
        marginLeft: 8,
      }}
    >
      {activity.type}
    </div>
  </div>
))}
        </div>
        {/* Pagination */}
        {/* <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
          <button style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer" }}>{"<"}</button>
          <span style={{ margin: "0 12px" }}>3 / 5</span>
          <button style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer" }}>{">"}</button>
        </div> */}
      </div>







      {/* Submit Prayer Request Modal */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Submit Prayer Request</DialogTitle>
        <DialogContent>
          <form id="prayer-form" onSubmit={handleSubmit}>
          <FormControl fullWidth margin="dense" size="small">
  <InputLabel id="category-label">Category</InputLabel>
  <Select
    labelId="category-label"   // 👈 link to InputLabel
    value={category}
    label="Category"
    onChange={(e) => setCategory(e.target.value)}
    data-testid="category-select"
  >
    {categories.map((cat) => (
      <MenuItem key={cat.id} value={cat.id}>
        {cat.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>


            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value)}
                data-testid="priority-select"
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Title"
              fullWidth
              margin="dense"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="title-input"
            />


            <TextField
              label="Prayer Request"
              multiline
              rows={4}
              fullWidth
              margin="dense"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              error={!!formError}
              helperText={formError}
               data-testid="request-input"
            />


          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit" form="prayer-form" variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>



    </div>
  );
};

export default Dashboard;