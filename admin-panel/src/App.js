import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import AdminLayout from './layouts/AdminLayout';
import MyProfile from './pages/MyProfile';
import ChangePassword from './pages/ChangePassword';
import Languages from './pages/Languages';
import Roles from './pages/Roles';
import RolesPermissions from './pages/RolesPermissions';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import PrayerCategories from './pages/PrayerCategory';
import PublicPrayers from './pages/PublicPrayers';
import PrivatePrayers from './pages/PrivatePrayers';
import Testimonies from './pages/Testimonies';
import Events from './pages/Events';
import DailyDevotions from './pages/DailyDevotion';
import Drivers from './pages/Drivers';
import Feedback from './pages/Feedback';

import SpecialPrayerCategoryList from './pages/SpecialPrayerCategory';
import SpecialPrayers from './pages/SpecialPrayers';
import AddSpecialPrayer from './pages/AddSpecialPrayer';
import EditSpecialPrayer from './pages/EditSpecialPrayer';
import Subscribers from './pages/Subscribers';

import Songs from './pages/Songs';
import AddSong from './pages/AddSong';
import EditSong from './pages/EditSong';
import Settings from './pages/Settings';
import PdfSongs from './pages/PdfSongs';
import ViewPrayForTheNation from './pages/ViewPrayeTheNation';
import RegistrationForm from  './pages/RegistrationForm';

// PrivateRoute implementation
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="appuserregistration/:id" element={<RegistrationForm />} />
          {/* Protected admin routes */}
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="languages" element={<Languages />} />
            <Route path="roles" element={<Roles />} />
            <Route path="roles-permissions" element={<RolesPermissions />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="users" element={<Users />} />
            <Route path="prayer-categories" element={<PrayerCategories />} />
            <Route path="public-prayers" element={<PublicPrayers />} />
            <Route path="private-prayers" element={<PrivatePrayers />} />
             <Route path="testimonies" element={<Testimonies />} />
             <Route path="events" element={<Events />} />
             <Route path="daily-devotions" element={<DailyDevotions />} />
             <Route path="drivers" element={<Drivers />} />
             <Route path="feedback" element={<Feedback />} />
             <Route path="special-prayer-categories" element={<SpecialPrayerCategoryList />} />
             <Route path="special-prayers" element={<SpecialPrayers />} />
             <Route path="add-special-prayer" element={<AddSpecialPrayer />} />
             <Route path="edit-special-prayer/:id" element={<EditSpecialPrayer />} />
              <Route path="subscribers" element={<Subscribers />} />
              <Route path="songs" element={<Songs />} />
              <Route path="add-song" element={<AddSong />} />
              <Route path="edit-song/:id" element={<EditSong />} />
              <Route path="settings" element={<Settings />} />
              <Route path="pdf-songs" element={<PdfSongs />} />
              <Route path="view-pray-for-nation" element={<ViewPrayForTheNation />} />
              
              
          
          </Route>

          {/* Default route redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
