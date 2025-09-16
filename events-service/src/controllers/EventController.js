const { PrismaClient, sql  } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const { startOfDay, endOfDay } = require('date-fns');

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

exports.eventsList = async (req, res) => {
  const user = req.user; // Ensure this is set via auth middleware
  const userId = user.id;
  const orgId = user.org_id;

  if (!orgId) {
    return res.status(400).json({
      error: { org_id: ['The org_id field is required.'] },
    });
  }

  try {
    const events = await prisma.events.findMany({
      where: {
        org_id: Number(orgId),
        start_date: {
          gte: new Date(), // FIXED: use Date object, not string
        },
        status: 'active',
      },
      orderBy: {
        start_date: 'asc',
      },
    });

    return res.json({
      success: true,
      message: 'Events list',
      data: convertBigInt(events),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.eventDetails = async (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({
      error: { event_id: ['The event_id field is required.'] },
    });
  }

  try {
    const event = await prisma.events.findUnique({
      where: {
        id: Number(event_id),
      },
      include: {
        origanisation: true, // Adjust to actual relation name in your Prisma schema
      },
    });

    if (!event) {
      return res.json({
        success: true,
        message: 'Event not found',
      });
    }

    return res.json({
      success: true,
      message: 'Event details',
      data: convertBigInt(event),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


exports.archiveEventsList = async (req, res) => {
  const user = req.user;
  const orgId = user.org_id;

  try {
    const events = await prisma.events.findMany({
      where: {
        org_id: Number(orgId),
        start_date: {
          lt: new Date(), // Use actual Date object
        },
      },
      orderBy: {
        start_date: 'asc',
      },
    });

    return res.json({
      success: true,
      message: 'Archive Events list',
      data: convertBigInt(events),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};
