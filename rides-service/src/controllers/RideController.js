const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse, isBefore, startOfDay, subMonths } = require('date-fns');


function convertBigInt(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString(); // or Number(obj), but toString is safer for large IDs
  } else if (obj instanceof Date) {
    return obj.toISOString(); // convert Date to string
  } else if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertBigInt(obj[key]);
    }
    return newObj;
  }
  return obj;
}

exports.getRideDetails = async (req, res) => {


  try {
    const {
      departureTime,
      fromLocation,
      toLocation,
      receiverId,
      org_id,
      user_id
    } = req.query;

    let conditions = {};

    if (departureTime) {
      conditions.departure_time = departureTime;
    }

    if (fromLocation) {
      conditions.from_location = { contains: fromLocation };
    }

    if (toLocation) {
      conditions.to_location = { contains: toLocation };
    }

    if (receiverId) {
      conditions.receiver_id = receiverId;
    }

    if (org_id) {
      conditions.org_id = org_id;
    }

    // Build initial conditions for user_id or requests JSON
    let userCondition = {};
    if (user_id) {
      userCondition = {
        OR: [
          { user_id: user_id },
          {
            requests: {
              contains: `"user_id":"${user_id}"` // assumes requests is JSON string
            }
          }
        ]
      };
    }

    const rides = await prisma.rides.findMany({
      where: {
        ...conditions,
        ...userCondition
      }
    });

    if (rides.length === 0) {
      return res.status(404).json({ message: 'No rides found.' });
    }

    const startOfToday = dayjs().startOf('day');

    for (const ride of rides) {
      const departure = dayjs(ride.departure_time, 'ddd, DD MMM YYYY');

      if (departure.isBefore(startOfToday)) {
        // Move to backup
        await prisma.ride_backup.create({
          data: {
            seats_available: ride.seats_available,
            departure_time: ride.departure_time,
            start_time: ride.start_time,
            from_location: ride.from_location,
            to_location: ride.to_location,
            vehicle_type: ride.vehicle_type,
            user_id: ride.user_id,
            org_id: ride.org_id,
            requests: ride.requests,
            started: ride.started,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Delete original ride
        await prisma.rides.delete({
          where: { id: ride.id }
        });
      }
    }

    // Delete old backup rides (older than 1 month)
    const oneMonthAgo = dayjs().subtract(1, 'month').toDate();
    await prisma.ride_backup.deleteMany({
      where: {
        created_at: {
          lt: oneMonthAgo
        }
      }
    });

    return res.status(200).json({ rides });
  } catch (error) {
    console.error('Error in getRideDetails:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getPassengerRequests = async (req, res) => {


  try {
    const {
      departureTime,
      location,
      destination,
      receiverId,
      org_id,
      user_id,
    } = req.query;

    const filters = {};

    if (departureTime) filters.departure_time = departureTime;
    if (receiverId) filters.receiver_id = parseInt(receiverId);
    if (org_id) filters.org_id = parseInt(org_id);
    if (user_id) filters.user_id = parseInt(user_id);
    if (location) filters.location = { contains: location };
    if (destination) filters.destination = { contains: destination };

    // Fetch matching passenger requests
    const rides = await prisma.passenger_requests.findMany({
      where: filters,
    });

    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: 'No rides found.' });
    }

    const now = new Date();
    const todayStart = startOfDay(now);

    for (const ride of rides) {
      const departureTimeParsed = parse(ride.departure_time, 'EEE, dd MMM yyyy', new Date());

      if (isBefore(departureTimeParsed, todayStart)) {
        // Insert into backup table
        await prisma.passenger_requests_backup.create({
          data: {
            name: ride.name,
            specialPerson: ride.specialPerson,
            departure_time: ride.departure_time,
            location: ride.location,
            destination: ride.destination,
            num_passengers: ride.num_passengers,
            start_time: ride.start_time,
            receiver_id: ride.receiver_id,
            status: ride.status,
            user_id: ride.user_id,
            org_id: ride.org_id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Delete from original table
        await prisma.passenger_requests.delete({
          where: { id: ride.id },
        });
      }
    }

    // Delete backup entries older than 1 month
    const oneMonthAgo = subMonths(new Date(), 1);
    await prisma.passenger_requests_backup.deleteMany({
      where: {
        created_at: {
          lt: oneMonthAgo,
        },
      },
    });

    return res.status(200).json({ rides:convertBigInt(rides) });
  } catch (err) {
    console.error('Error fetching passenger requests:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};




exports.getUserData = async (req, res) => {
  const userId = parseInt(req.body.user_id);

  // Basic validation
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user_id' });
  }

  try {
    const user = await prisma.app_users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user : convertBigInt(user) });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};





exports.updateRequestStatus = async (req, res) => {

  const { userId, requestId, type, started } = req.body;

  // ✅ Input validation
  if (!requestId || isNaN(requestId)) {
    return res.status(400).json({ error: 'requestId is required and must be an integer' });
  }

  if (type && (!userId || isNaN(userId))) {
    return res.status(400).json({ error: 'userId is required if type is provided and must be an integer' });
  }

  try {
    const ride = await prisma.rides.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    let existingRequests = Array.isArray(ride.requests) ? ride.requests : [];

    // ✅ Handle type updates
    if (type) {
      if (type === 'rejected') {
        existingRequests = existingRequests.filter(item => item.user_id !== userId);
      } else {
        existingRequests = existingRequests.map(item => {
          if (item.user_id === userId) {
            return { ...item, status: type };
          }
          return item;
        });
      }
    }

    // ✅ Prepare update data
    const updateData = {};

    if (typeof started === 'boolean') {
      updateData.started = started;
    }

    if (type) {
      updateData.requests = existingRequests;
    }

    await prisma.rides.update({
      where: { id: parseInt(requestId) },
      data: updateData
    });

    return res.status(200).json({ message: 'Ride request updated successfully' });

  } catch (error) {
    console.error('Error updating request:', error);
    return res.status(500).json({ error: 'An error occurred while updating the request.' });
  }
};



exports.deleteRequest = async (req, res) => {
  const { requestId, type } = req.body;

  // Validation
  if (!requestId || typeof requestId !== 'number') {
    return res.status(400).json({ error: { requestId: ['requestId is required and must be an integer'] } });
  }

  if (!type || !['rides', 'passengers'].includes(type)) {
    return res.status(400).json({ error: { type: ['type is required and must be one of: rides, passengers'] } });
  }

  try {
    if (type === 'rides') {
      const ride = await prisma.rides.findUnique({
        where: { id: requestId },
      });

      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      await prisma.rides.delete({
        where: { id: requestId },
      });

      return res.status(200).json({ message: 'Ride deleted successfully' });
    }

    if (type === 'passengers') {
      const passenger = await prisma.passenger_requests.findUnique({
        where: { id: requestId },
      });

      if (!passenger) {
        return res.status(404).json({ error: 'Passenger request not found' });
      }

      await prisma.passenger_requests.delete({
        where: { id: requestId },
      });

      return res.status(200).json({ message: 'Passenger request deleted successfully' });
    }

    return res.status(400).json({ error: 'Invalid type provided' });

  } catch (error) {
    console.error('Error deleting request:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the request.' });
  }
};




exports.acceptRequest = async (req, res) => {
  const schema = Joi.object({
    userId: Joi.number().required(),
    requestId: Joi.number().required(),
    type: Joi.string().valid('rides', 'passengers').required(),
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
requests: Joi.array().items(
    Joi.object({
      user_id: Joi.number().integer().required(),
      status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
      num_passengers:Joi.number().integer().required(),
    })
  ).optional(),
    num_passengers: Joi.number().optional(),
    specialPerson: Joi.string().allow(null, '').optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });

  const { userId, requestId, type, status, num_passengers, specialPerson } = value;

  try {
    if (type === 'rides') {
      const ride = await prisma.rides.findUnique({
        where: { id: requestId }
      });

      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      let existingRequests = [];

      if (ride.requests) {
        try {
          existingRequests = JSON.parse(ride.requests);
        } catch (e) {
          console.error('Invalid JSON in ride.requests');
        }
      }

      const newRequest = {
        user_id: userId,
        status: 'pending',
        num_passengers: num_passengers || null,
        specialPerson: specialPerson || null
      };

      const userExists = existingRequests.some(req => req.user_id === userId);

      if (!userExists) {
        existingRequests.push(newRequest);
      }

      await prisma.rides.update({
        where: { id: requestId },
        data: {
          requests: JSON.stringify(existingRequests),
          num_passengers: num_passengers || ride.num_passengers,
          specialPerson: specialPerson || ride.specialPerson
        }
      });

      return res.status(200).json({ message: 'Ride accepted successfully' });
    }

    if (type === 'passengers') {
      const passengerRequest = await prisma.passenger_requests.findUnique({
        where: { id: requestId }
      });

      if (!passengerRequest) {
        return res.status(404).json({ error: 'Passenger request not found' });
      }

      await prisma.passenger_requests.update({
        where: { id: requestId },
        data: {
          receiver_id: userId,
          status,
          num_passengers: num_passengers || passengerRequest.num_passengers,
          specialPerson: specialPerson || passengerRequest.specialPerson
        }
      });

      return res.status(200).json({ message: 'Passenger request accepted successfully' });
    }

    return res.status(400).json({ error: 'Invalid type provided' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while accepting the request.' });
  }
};



exports.postPassengerRequest = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(255).required(),
    specialPerson: Joi.string().valid('yes', 'no').required(),
    departureTime: Joi.string().required(),
    startTime: Joi.string().required(),
    location: Joi.string().max(255).required(),
    destination: Joi.string().max(255).required(),
    numPassengers: Joi.number().integer().min(1).required(),
    status: Joi.string().required(),
    receiverId: Joi.string().optional(),
    user_id: Joi.number().required(),
    org_id: Joi.number().optional(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details });
  }

  const {
    name,
    specialPerson,
    departureTime,
    startTime,
    location,
    destination,
    numPassengers,
    status,
    receiverId,
    user_id,
    org_id
  } = value;

  try {
    // Check for existing ride by user
    const existing = await prisma.passenger_requests.findFirst({
      where: {
        user_id
      }
    });

    if (existing) {
      return res.status(200).json({ message: 'Ride details already posted for this route.' });
    }

    // Create new ride
    await prisma.passenger_requests.create({
      data: {
        name,
        specialPerson,
        departure_time: departureTime,
        start_time: startTime,
        location,
        destination,
        num_passengers: numPassengers,
        status,
        user_id,
        receiver_id: receiverId,
        org_id
      }
    });

    return res.status(201).json({ message: 'Ride request posted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to post ride request.' });
  }
};

exports.postRideDetails = async (req, res) => {
  const {
    seatsAvailable,
    departureTime,
    startTime,
    fromLocation,
    toLocation,
    vehicleType,
    user_id,
    org_id,
    requests = [],
    started = false,
  } = req.body;

  // Validation (basic manual checks)
  if (
    !seatsAvailable || !departureTime || !startTime ||
    !fromLocation || !toLocation || !vehicleType
  ) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Check for existing ride by user
    const existingRide = await prisma.rides.findFirst({
      where: { user_id },
    });

    if (existingRide) {
      return res.status(200).json({ message: 'Ride details already posted for this route.' });
    }

    // Create new ride
    await prisma.rides.create({
      data: {
        seats_available: seatsAvailable,
        departure_time: departureTime,
        start_time: startTime,
        from_location: fromLocation,
        to_location: toLocation,
        vehicle_type: vehicleType,
        user_id,
        org_id,
        requests: JSON.stringify(requests),
        started: Boolean(started),
      },
    });

    return res.status(201).json({ message: 'Ride posted successfully' });
  } catch (error) {
    console.error('Error posting ride:', error);
    return res.status(500).json({ error: 'An error occurred while posting ride details.' });
  }
};



exports.getRideGiverDetails = async (req, res) => {

  const user_id = req.user.id;

  // Validate input
  if (!user_id || isNaN(parseInt(user_id))) {
    return res.status(400).json({ error: 'user_id is required and must be an integer' });
  }

  try {
    const rideDetails = await prisma.ride_giver_details.findMany({
      where: {
        user_id: parseInt(user_id),
      },
    });

    if (rideDetails.length === 0) {
      return res.status(404).json({ message: 'No ride details found for this user.' });
    }

    return res.status(200).json({ rideDetails });
  } catch (error) {
    console.error('Error fetching ride details:', error);
    return res.status(500).json({
      error: 'An error occurred while fetching ride details.',
      details: error.message,
    });
  }
};








// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const user = req.user;
    const uploadPath = `public/organizations/${user.org_id}/images/drivers`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name.replace(/\s+/g, '');
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}_${Date.now()}${extension}`);
  }
});

const upload = multer({ storage });

exports.postRideGiverDetails = async (req, res) => {

  const { vehicleType, vehicleNumber, seats } = req.body;
  const user = req.user;

  // Validation
  if (!vehicleType || !vehicleNumber) {
    return res.status(400).json({ error: 'vehicleType, vehicleNumber, and license are required.' });
  }

  try {
    // Check if ride already exists
    const existingRide = await prisma.ride_giver_details.findFirst({
      where: { user_id: user.id }
    });

    if (existingRide) {
      return res.status(200).json({ message: 'Ride details already posted for this vehicle.' });
    }

    // Check approval settings
    const approvalSettings = await prisma.approval_settings.findFirst({
      where: {
        module_name: 'rider',
        org_id: user.org_id
      }
    });

    let approve_status = 'Pending';
    const currentUserRole = user.role;

    if (currentUserRole === 4 && approvalSettings?.approval === 'yes') {
      approve_status = 'Approve';
    } else if (currentUserRole !== 4) {
      approve_status = 'Approve';
    }

    // Insert ride details
    const rideDetails = await prisma.ride_giver_details.create({
      data: {
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        seats: seats,
        user_id: user.id,
        org_id: user.org_id,
        approve_status,
        created_at: new Date()
      }
    });

    // Upload license image path to DB
    const licenseUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace('public/', '')}`;

    await prisma.ride_giver_details.update({
      where: { id: rideDetails.id },
      data: { license: licenseUrl }
    });

    // Notify admin (skip if role is 2)
    if (currentUserRole !== 2) {
      const notifyUser = await prisma.app_users.findUnique({
        where: { id: user.id }
      });

      await prisma.notification.create({
        data: {
          is_admin: true,
          title: 'Rider',
          time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          content: `Ride Giver Details added by ${notifyUser.first_name} ${notifyUser.last_name}`,
          user_id: user.id,
          org_id: user.org_id,
          is_admin_read: false,
          module_id: rideDetails.id,
          role: 'Admin'
        }
      });
    }

    res.status(201).json({
      message: 'Ride posted successfully',
      status: approve_status
    });

  } catch (error) {
    console.error('Error posting ride details:', error);
    res.status(500).json({
      error: 'An error occurred while posting ride details.',
      details: error.message
    });
  }
}

