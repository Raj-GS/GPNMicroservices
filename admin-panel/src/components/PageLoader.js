import React from "react";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const PageLoader = ({ open }) => {
  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Backdrop
        sx={{
          position: "absolute",   // overlay only this container
          top: 100,
          left: 0,
          width: "100%",
          height: "100%",
          color: "#178866ff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default PageLoader;
