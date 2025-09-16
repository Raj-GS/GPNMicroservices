import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Menu,
  MenuItem,
    Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField as MuiTextField,
} from "@mui/material";

export default function RegistrationLinks({ shortCode }) {

  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({ name: "", email: "" });
  const [currentUrl, setCurrentUrl]=useState("")
const [anchorEl, setAnchorEl] = useState(null);

  const registrationLink =window.location.origin+"/appuserregistration/"+shortCode;
  const androidLink ="https://play.google.com/store/apps/details?id=com.glocalprayer.ep&pcampaignid=web_share";
  const iosLink ="https://apps.apple.com/in/app/glocal-prayer-network/id6479648726";


  // ✅ Copy to clipboard
  const handleCopy = async (type) => {
    try {
        if(type=="registration"){
            var url=registrationLink;
        }
        if(type=="android"){
            var url=androidLink;
        }
         if(type=="ios"){
            var url=iosLink;
        }
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // ✅ Share menu
 const handleShareClick = (event, link) => {
  setAnchorEl(event.currentTarget); // this is the DOM element to anchor the menu
  setCurrentUrl(link);              // this is your actual link
};
  const handleCloseMenu = () => setAnchorEl(null);

  // ✅ WhatsApp share
  const handleWhatsAppShare = () => {
    //console.log(anchorEl)

    window.open(
      `https://wa.me/?text=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
    handleCloseMenu();
  };



  // ✅ Email modal
  const handleEmailShare = () => {
    setOpenEmailDialog(true);
    handleCloseMenu();
  };

  const handleEmailSend = () => {
    const { name, email } = emailData;
    if (!name || !email) {
      alert("Please enter name and email");
      return;
    }
    // Using mailto for demo (you can replace with API call)
    window.location.href = `mailto:${email}?subject=Registration Link&body=Hi ${name},\n\nHere is your registration link: ${currentUrl}`;
    setOpenEmailDialog(false);
    setEmailData({ name: "", email: "" });
  };




  return (
    <Card sx={{ width: "100%", p: 4, borderRadius:4, marginTop:10 }} >
   <h3>Important Links</h3>
      <CardContent>
        {/* User Registration */}
        <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
          User Registration
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          Web
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          value={registrationLink}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton color="success" onClick={()=>handleCopy("registration")}>
                  <ContentCopyIcon />
                </IconButton>
               <IconButton color="primary"   onClick={(event) => handleShareClick(event, registrationLink)}>
                <ShareIcon />
              </IconButton>
              </InputAdornment>
            ),
          }}
        />

           {/* Share Menu */}
      <Menu  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleCloseMenu}>
        <MenuItem onClick={handleWhatsAppShare}>WhatsApp</MenuItem>
        <MenuItem onClick={handleEmailShare}>Email</MenuItem>
      </Menu>

        <Typography variant="body2" mt={1} mb={2}>
          <strong>Note:</strong> Users can use this link to become a member of the organization.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Mobile Apps */}
        <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
          Mobile Apps
        </Typography>

        <Box display="flex" gap={3} flexWrap="wrap">
          {/* Android */}
          <Box flex={1} minWidth={250}>
            <Typography variant="h6" fontWeight="bold">
              Android
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              value={androidLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="success" onClick={()=>handleCopy("android")}>
                      <ContentCopyIcon />
                    </IconButton>
               <IconButton color="primary"   onClick={(event) => handleShareClick(event, androidLink)}>
                      <ShareIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* iOS */}
          <Box flex={1} minWidth={250}>
            <Typography variant="h6" fontWeight="bold">
              iOS
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              value={iosLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="success" onClick={()=>handleCopy("ios")}>
                      <ContentCopyIcon />
                    </IconButton>
               <IconButton color="primary" onClick={(event) => handleShareClick(event, iosLink)} >
                      <ShareIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        <Typography variant="body2" mt={1}>
          <strong>Note:</strong> Members can use these links to download the App for Android or iOS.
        </Typography>
      </CardContent>

           {/* Email Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
        <DialogTitle>Send Registration Link via Email</DialogTitle>
        <DialogContent>
          <MuiTextField
            margin="dense"
            label="Name"
            fullWidth
            value={emailData.name}
            onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
          />
          <MuiTextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={emailData.email}
            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailSend}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
