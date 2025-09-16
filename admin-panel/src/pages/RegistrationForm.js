"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  MenuItem,
  IconButton,
  InputAdornment,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff, Refresh } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams } from 'react-router-dom';

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, SetOrgName] =useState("");
  const [orgPic, SetOrgPic] =useState("");
  const [orgId, SetOrgId] =useState("");
  const [userId, SetUserId] =useState("0");

  const [existed, SetExisted] =useState('')
const API_URL = process.env.REACT_APP_API_URL;

 const [captcha, setCaptcha] = useState("");
const { id } = useParams();

// Captcha generator
const handleRefreshCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  setCaptcha(result);
};

useEffect(() => {
  handleRefreshCaptcha(); // generate captcha when component mounts
}, []);

useEffect(() => {

    const fetchOrgDetails = async () => {
    // Replace this with your actual API call
    const response = await fetch(`${API_URL}org-details`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
            id:id
      }),

      
    });
     const data = await response.json();
     SetOrgName(data.data.org_name)
     SetOrgPic(data.data.logo)
     SetOrgId(data.data.id)

}
  fetchOrgDetails(); // generate captcha when component mounts
}, []);

  // ✅ Validation Schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Must be at least 8 characters")
      .matches(/[A-Z]/, "Must contain an uppercase letter")
      .matches(/[a-z]/, "Must contain a lowercase letter")
      .matches(/[0-9]/, "Must contain a number")
      .matches(/[@$!%*?&]/, "Must contain a special character"),
    phone: Yup.string()
      .nullable()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .notRequired(),
  //  maritalStatus: Yup.string().required("Marital status is required"),
captchaInput: Yup.string()
  .required("Captcha is required")
  .test("captcha-match", "Captcha does not match", function (value) {
    return value === captcha; // exact match, case-sensitive
  }),

  });

  // ✅ Formik
const formik = useFormik({
  initialValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    maritalStatus: "",
    captchaInput: "",
    gender: "male",
    baptized: "yes",
    country: "India",
    date_of_birth: "",
    profile_pic: null, // ✅ file will be stored here
    address: ""
  },
  validationSchema,
  validateOnBlur: true,
  validateOnChange: true,
  context: { captcha },
  enableReinitialize: true,
  onSubmit: async (values) => {
    try {
      // ✅ Create FormData for file + text
      const formData = new FormData();

      // Append all fields
      Object.keys(values).forEach((key) => {
        if (key === "profile_pic") {
          if (values.profile_pic) {
            formData.append("profile_pic", values.profile_pic); // file
          }
        } else {
          formData.append(key, values[key]);
        }
      });

      // Add extra fields
      formData.append("orgId", orgId);
      formData.append("existedUserId", userId);
      formData.append("existed", existed);

      const response = await fetch(`${API_URL}add-new-user`, {
        method: "POST",
        body: formData, // ✅ no headers (browser sets multipart boundary automatically)
      });

      if (response.ok) {
        alert("You have been successfully registered! Please check your email for further instructions.");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error saving settings: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Something went wrong!");
    }
  },
});


const checkEmailExists = async (email) => {
  if (!email) return false;
  try {
    SetExisted('')
    const res = await fetch(`${API_URL}check-user-exists`,{
               method:'POST',
                headers: {
                'Content-Type': 'application/json',
                },
               body: JSON.stringify({
                org_id:orgId,
                email:email
               })
    });
    const data = await res.json();
    if (data.success && data.current_org) {

        SetExisted(true)

    }
     if (data.success && !data.current_org && data.data) {
        // auto-fill values from backend
formik.setFieldValue("firstName", data.data.first_name || "");
formik.setFieldValue("lastName", data.data.last_name || "");
formik.setFieldValue("password", "AutoGenerated@123");
SetUserId(data.data.id)


         SetExisted(false)
      }


  } catch (err) {
    console.error("Error checking email:", err);
    return false;
  }
};

  const validateEmail = async (value) => {
  let error;
  if (!value) {
    error = "Email is required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    error = "Invalid email address";
  } else {
    const exists = await checkEmailExists(value);
    if (exists) {
      error = "Email already exists";
    }
  }
  return error;
};


  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        bgcolor: "#09232C",
        p: 4,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 600, width: "100%" }} elevation={3}>
        <Box textAlign="center" mb={3}>
          <img
            src={orgPic}
            alt="Logo"
            style={{ width: 100, height: "auto", marginBottom: 10 }}
          />
          <Typography variant="h5" gutterBottom>
           {orgName}
          </Typography>
          <Typography variant="subtitle1">User Registration</Typography>
        </Box>


   <form onSubmit={formik.handleSubmit}>
    <Grid container spacing={2}>
  {/* First & Last Name */}
  <Grid size={{ xs: 12, sm: 6 }}>
   <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={existed===false}
              />
  </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                disabled={existed===false}
              />
            </Grid>

  {/* Email & Password */}
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField
  label="Email"
  name="email"
  type="email"
  fullWidth
  value={formik.values.email}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  error={formik.touched.email && Boolean(formik.errors.email)}
  helperText={formik.touched.email && formik.errors.email}
  onInput={async (e) => {
    const error = await validateEmail(e.target.value);
    formik.setFieldError("email", error);
  }}
/>
{existed === true && (


<Typography color="red">You Already existed in this organization.</Typography>

)}

{existed === false && (


<Typography color="red">You are already registered. You can proceed with the same details.</Typography>

)}
  </Grid>
  <Grid size={{ xs: 12, sm: 6 }}>
   <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={existed===false}
              />
  </Grid>

  {/* Gender & Baptized */}
<Grid item xs={12} sm={6}>
  <FormLabel>Gender</FormLabel>
  <RadioGroup
    row
    name="gender" // ✅ Important for Formik
    value={formik.values.gender}
    onChange={formik.handleChange}
  >
    <FormControlLabel value="male" control={<Radio />} label="Male" />
    <FormControlLabel value="female" control={<Radio />} label="Female" />
  </RadioGroup>
</Grid>

  <Grid size={{ xs: 12, sm: 6 }}>
    <FormLabel>Baptized</FormLabel>
    <RadioGroup
    row
    name="baptized" // ✅ Important for Formik
    value={formik.values.baptized}
    onChange={formik.handleChange}
    
    
    >
      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
      <FormControlLabel value="no" control={<Radio />} label="No" />
    </RadioGroup>
  </Grid>

  {/* Country & Phone */}
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField select label="Country"
     fullWidth
    name="country"
    value={formik.values.country}  // ✅ will be "" initially
    onChange={formik.handleChange}
      
      >
      <MenuItem value="India">India</MenuItem>
      <MenuItem value="USA">USA</MenuItem>
      <MenuItem value="UK">UK</MenuItem>
    </TextField>
  </Grid>
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField
                label="Phone"
                name="phone"
                fullWidth
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
  </Grid>

  {/* DOB & Marital Status */}
  <Grid size={{ xs: 12, sm: 6 }}>
    <TextField
      label="Date of Birth"
      type="date"
    name="date_of_birth"
    value={formik.values.date_of_birth}  // ✅ will be "" initially
    onChange={formik.handleChange}
     
      InputLabelProps={{ shrink: true }}
      fullWidth
    />
  </Grid>
  <Grid size={{ xs: 12, sm: 6 }}>
   <FormControl fullWidth>
  <InputLabel id="marital-status-label">Marital Status</InputLabel>
  <Select
    labelId="marital-status-label"
    name="maritalStatus"
    value={formik.values.maritalStatus}  // ✅ will be "" initially
    onChange={formik.handleChange}
  >
    <MenuItem value="">Select</MenuItem>
    <MenuItem value="single">Single</MenuItem>
    <MenuItem value="married">Married</MenuItem>
    <MenuItem value="widowed">Widowed</MenuItem>
  </Select>
  {formik.touched.maritalStatus && formik.errors.maritalStatus && (
    <FormHelperText error>{formik.errors.maritalStatus}</FormHelperText>
  )}
</FormControl>

  </Grid>

  {/* Address */}
  <Grid size={{ xs: 12}}>
    <TextField label="Address" fullWidth multiline rows={3}
    name="address"
    value={formik.values.address}  // ✅ will be "" initially
    onChange={formik.handleChange}
    
    
    
    />
  </Grid>

  {/* Profile Pic */}
  <Grid size={{ xs: 12}}>
  <Button variant="outlined" component="label" fullWidth>
    Upload Profile Pic
    <input
      type="file"
      hidden
      name="profile_pic"
      accept="image/*"
      onChange={(event) => {
        const file = event.currentTarget.files[0];
        if (file) {
          formik.setFieldValue("profile_pic", file); // store file in Formik
        }
      }}
    />
  </Button>

  {formik.values.profile_pic && (
    <div style={{ marginTop: "12px", textAlign: "center" }}>
      <img
        src={URL.createObjectURL(formik.values.profile_pic)}
        alt="Profile Preview"
        style={{
          width: "120px",
          height: "120px",
          objectFit: "cover",
          borderRadius: "50%",
          border: "2px solid #ccc",
        }}
      />
      <div style={{ marginTop: "6px", fontSize: "14px" }}>
        {formik.values.profile_pic.name}
      </div>
    </div>
  )}
</Grid>



  {/* Captcha + Refresh */}
<Grid size={{ xs: 8, sm: 9 }}>
  <TextField
    label="Captcha"
    name="captchaInput"
    fullWidth
    value={formik.values.captchaInput}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched.captchaInput && Boolean(formik.errors.captchaInput)}
    helperText={formik.touched.captchaInput && formik.errors.captchaInput}
  />
</Grid>

  <Grid size={{ xs: 4, sm: 3 }}>
    <Button
      onClick={handleRefreshCaptcha}
      variant="contained"
      fullWidth
      sx={{ height: "70%" }}
    >
      <Refresh fontSize="small" />
    </Button>
  </Grid>

  {/* Captcha Preview */}
  <Grid size={{ xs: 12}}>
    <Box
      p={1}
      sx={{
        border: "1px solid #ccc",
        display: "inline-block",
        fontWeight: "bold",
        letterSpacing: 2,
      }}
    >
      {captcha}
    </Box>
  </Grid>

  {/* Submit Button */}
  <Grid size={{ xs: 12 }}>
    <Button type="submit" variant="contained" fullWidth disabled={existed}>
      Register
    </Button>
  </Grid>
</Grid>
</form>

      </Paper>
    </Box>
  );
};

export default RegistrationForm;
