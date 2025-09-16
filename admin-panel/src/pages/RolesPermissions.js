import React, { useState, useEffect } from "react";
import {
  Box, Button, Checkbox, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Paper
} from "@mui/material";

const permissionTypes = [
  { key: "mview", label: "View" },
  { key: "madd", label: "Add" },
  { key: "medit", label: "Edit" },
  { key: "mdelete", label: "Delete" }
];

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [rolePermissions, setRolePermissions] = useState({}); // keyed by permission_id
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000/api/admin/';
  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}roles-permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRoles(data.roles);
      setPermissions(data.permissions);
    };

    fetchRolesAndPermissions();
  }, []);

  const handleRoleChange = async (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
  
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}user-permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: roleId })
    });
    const data = await response.json();
  
    let formatted = {};
    if (data.data && data.data.length > 0) {
      // Use permissions from API, keyed by moduleid
      data.data.forEach((perm) => {
        formatted[perm.module_id] = {
          mview: perm.mview === "yes",
          madd: perm.madd === "yes",
          medit: perm.medit === "yes",
          mdelete: perm.mdelete === "yes",
          module: perm.module
        };
      });
    } else {
      // No permissions for this role, default all to true
      const defaultPerms = {};
      permissions.forEach((perm) => {
        defaultPerms[perm.id] = {
          mview: false,
          madd: false,
          medit: false,
          mdelete: false,
          module: perm.module
        };
      });
      formatted = defaultPerms;
    }
    setRolePermissions(formatted);
  };

  const handleCheckboxChange = (permissionId, type,module) => (event) => {
    setRolePermissions(prev => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [type]: event.target.checked,
        module: module
      }
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const formattedPermissions = Object.keys(rolePermissions).map(permissionId => ({
      role_id: selectedRole,
      permission_id: parseInt(permissionId),
      mview: rolePermissions[permissionId]?.mview ? "yes" : "no",
      madd: rolePermissions[permissionId]?.madd ? "yes" : "no",
      medit: rolePermissions[permissionId]?.medit ? "yes" : "no",
      mdelete: rolePermissions[permissionId]?.mdelete ? "yes" : "no",
      module: rolePermissions[permissionId]?.module
    }));

    const response = await fetch(`${API_URL}save-role-permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role_id: selectedRole, permissions: formattedPermissions })
    });

    const result = await response.json();
    if (result.success) {
      alert("Permissions saved successfully!");
    } else {
      alert("Failed to save permissions.");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Roles & Permissions</Typography>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="subtitle1">Select Role:</Typography>
        <Select
          value={selectedRole}
          onChange={handleRoleChange}
          size="small"
          displayEmpty
        >
          <MenuItem value=''>Select Role</MenuItem>
          {roles.map(role => (
            <MenuItem key={role.id} value={role.id}>{role.role}</MenuItem>
          ))}
        </Select>
      </Box>

      <>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Module</TableCell>
                {permissionTypes.map(type => (
                  <TableCell key={type.key} align="center">{type.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.map(perm => (
                <TableRow key={perm.id}>
                  <TableCell>{perm.module}</TableCell>
                  {permissionTypes.map(type => (
                    <TableCell align="center" key={type.key}>
                      <Checkbox
                        checked={!!rolePermissions[perm.id]?.[type.key]}
                        onChange={handleCheckboxChange(perm.id, type.key,perm.module)}
                        color="primary"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleSave}sx={{background: '#177373'}}>
            Save Permissions
          </Button>
        </Box>
      </>
    </Box>
  );
};

export default RolesPermissions;