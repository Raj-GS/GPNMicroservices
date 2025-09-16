const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');
const moment = require('moment');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

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

exports.SpecialPrayerCategories = async (req, res) => {
  try {
    const orgId = req.user?.org_id;

    const categories = await prisma.session_prayer_category.findMany({
      where: {
        deleted_at: null,
        status: 'active',
        OR: [
          { org_id: null },
          { org_id: orgId }
        ]
      },
      orderBy: {
        id: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching special prayer categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


exports.SpecialPrayerList = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.org_id;

    const {
      category,
      prayer_type,
      day_of_week
    } = req.query;

    const whereConditions = {
      status: 'active',
      OR: [
        { org_id: null },
        { org_id: orgId }
      ]
    };

    if (category) {
      whereConditions.category = category; // or 'category_id' depending on your schema
    }

    if (prayer_type) {
      whereConditions.prayer_type = prayer_type;
    }

    if (day_of_week) {
      whereConditions.day_of_week = {
        contains: day_of_week
      };
    }

    const prayers = await prisma.session_prayers.findMany({
      where: whereConditions,
      orderBy: {
        id: 'desc'
      },
      include: {
        session_prayer_category: true,
        session_prayer_points: true,
        session_scriptures: true,
        pray_for_nation: true,
        time_slots: {
          include: {
            special_prayers_subscribs: {
              where: {
                userId: userId
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: convertBigInt(prayers)
    });

  } catch (error) {
    console.error('Error fetching special prayer list:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};






exports.addSpecialPrayerSubscription = async (req, res) => {
  await body('prayerId').notEmpty().run(req);
  await body('slotId').notEmpty().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array(),
    });
  }

  try {
    const user = req.user;
    const userId = user.id;
    const { prayerId, slotId, category } = req.body;

    const currentSlot = await prisma.time_slots.findUnique({
      where: { id: Number(slotId) },
    });

    if (!currentSlot) {
      return res.status(400).json({ success: false, message: 'Slot not found' });
    }

    const currentFrom = dayjs(currentSlot.from_slot, 'HH:mm');
    const currentTo = dayjs(currentSlot.to_slot, 'HH:mm');

    // Conflict detection
    const conflictingSubscription = await prisma.special_prayers_subscribs.findFirst({
      where: {
        userId,
        deleted_at: null,
        prayerId: { not: Number(prayerId) },
        time_slots: {
          from_slot: { lt: currentTo.format('HH:mm') },
          to_slot: { gt: currentFrom.format('HH:mm') },
        },
      },
      include: {
        time_slots: true,
      },
    });

    if (conflictingSubscription) {
      return res.status(200).json({
        success: false,
        message: 'You have already booked another prayer at this time.',
      });
    }

    // Check if same subscription already exists
    const existing = await prisma.special_prayers_subscribs.findFirst({
      where: {
        userId,
        prayerId: Number(prayerId),
        slotId: Number(slotId),
        deleted_at: null,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: false,
        message: 'Already Subscribed to this prayer with the same slot.',
      });
    }

    const prayer = await prisma.session_prayers.findUnique({
      where: { id: Number(prayerId) },
    });

    if (!prayer) {
      return res.status(200).json({
        success: false,
        message: 'Prayer not found',
      });
    }

    let from_date = null;
    let to_date = null;

    if (prayer.org_id) {
      if (prayer.flow_type === 'floating') {
        [from_date, to_date] = await getSubscriptionDates(userId, prayerId, prayer.number_of_days);
      }
    } else {
      const nationPrayer = await prisma.pray_for_nation.findFirst({
        where: {
          org_id: user.org_id,
          prayer_id: Number(prayerId),
        },
      });

      if (nationPrayer && nationPrayer.flow_type === 'floating') {
        [from_date, to_date] = await getSubscriptionDates(userId, prayerId, nationPrayer.number_of_days);
      } else if (prayer.flow_type === 'floating') {
        [from_date, to_date] = await getSubscriptionDates(userId, prayerId, prayer.number_of_days);
      }
    }

    await prisma.special_prayers_subscribs.create({
      data: {
        userId,
        prayerId: Number(prayerId),
        slotId: Number(slotId),
        start_date: from_date,
        to_date: to_date,
        category: category || null,
        org_id: user.org_id,
        updated_by: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};




const getSubscriptionDates = async (userId, prayerId, numberOfDays = 1) => {
  const from_date = dayjs().tz('Asia/Kolkata').toISOString(); // ISO string with time
  const to_date = dayjs().tz('Asia/Kolkata').add(numberOfDays, 'day').toISOString();
  return [from_date, to_date];
};




exports.mySubscriptions = async (req, res) => {
  try {
    const user = req.user; // assuming this is added via auth middleware
    const orgId = user.org_id;
    const userId = user.id;

    const prayerType = req.query.prayer_type;
    const prayerIdFilter = req.query.prayerId;

    // STEP 1: Fetch subscriptions
    const subscriptions = await prisma.special_prayers_subscribs.findMany({
      where: {
        userId,
        org_id: orgId,
        deleted_at: null,
        ...(prayerIdFilter && { prayerId: parseInt(prayerIdFilter) }),
      },
      include: {
        // category: {
        //   select: { id: true, name: true },
        // },
        time_slots: {
          select: { id: true, from_slot: true, to_slot: true },
        },
        session_prayers: {
          where: prayerType ? { prayer_type: prayerType } : undefined,
          include: {
            session_scriptures: {
              select: { id: true, prayerId: true, scripture: true },
            },
            session_prayer_points: {
              select: {
                id: true,
                prayerId: true,
                prayer_point: true,
                te_prayer_point: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!subscriptions.length) {
      return res.json({
        success: true,
        message: 'No subscriptions found',
        subscriptionslist: [],
      });
    }

    // STEP 2: Get unique prayerIds
    const prayerIds = [
      ...new Set(subscriptions.map((sub) => sub.prayerId)),
    ];

    // STEP 3: Fetch prayForTheNation records per org and prayerId
    const prayForTheNationList = await prisma.pray_for_nation.findMany({
      where: {
        org_id: orgId,
        prayer_id: { in: prayerIds },
      },
      select: {
        id: true,
        prayer_id: true,
        flow_type: true,
        from_date: true,
        to_date: true,
        number_of_days: true,
      },
    });

    // STEP 4: Group and shape the result
    const grouped = Object.values(
      subscriptions.reduce((acc, sub) => {
        const pid = sub.prayerId;
        if (!sub.session_prayers) return acc; // skip null prayers

        if (!acc[pid]) {
          acc[pid] = {
            prayer: sub.session_prayers,
            prayforthenation: prayForTheNationList.find(
              (p) => p.prayer_id === pid
            ) || null,
            category: sub.category,
            slots: [],
            subscriptions: [],
          };
        }

        acc[pid].slots.push({
          slotId: sub.slotId,
          from_slot: sub.time_slots?.from_slot || 'N/A',
          to_slot: sub.time_slots?.to_slot || 'N/A',
        });

        acc[pid].subscriptions.push({
          slotId: sub.slotId,
          from_slot: sub.time_slots?.from_slot || 'N/A',
          to_slot: sub.time_slots?.to_slot || 'N/A',
          start_date: sub.start_date,
          to_date: sub.to_date,
        });

        return acc;
      }, {})
    );

    return res.status(200).json({
      success: true,
      message: 'Subscription details',
      subscriptionslist: convertBigInt(grouped),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Something went wrong',
    });
  }
};




exports.addUserDayActivity = async (req, res) => {
  const { prayerId, slotId, date, category } = req.body;

  if (!prayerId || !slotId || !date) {
    return res.status(400).json({
      success: false,
      error: 'prayerId, slotId, and date are required',
    });
  }

  try {
    // 1. Fetch prayer
    const prayer = await prisma.session_prayers.findUnique({
      where: { id: prayerId },
    });

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer Not Found',
      });
    }

    // 2. Fetch slot
    const slot = await prisma.time_slots.findFirst({
      where: {
        id: slotId,
        prayerId: prayerId,
      },
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot Not Found',
      });
    }

    const userId = req.user.id;
    const orgId = req.user.org_id;
const activityDate = new Date(moment(date).format('YYYY-MM-DD'));

    // 3. Check if existing activity
    const existingActivity = await prisma.user_day_activities.findFirst({
      where: {
        slotId,
        prayerId,
        userId,
        activity_date: activityDate,
      },
    });

    if (existingActivity) {
      if (category) {
        const existingCategories = existingActivity.category
          ? existingActivity.category.split(',')
          : [];

        if (!existingCategories.includes(category)) {
          const updatedCategories = Array.from(new Set([...existingCategories, category]));

          const totalPrayerCategoriesCount = await prisma.session_prayer_points.findMany({
            where: { prayerId },
            distinct: ['category'],
          });

          const userCategoryCount = updatedCategories.length;
          const isComplete = totalPrayerCategoriesCount.length === userCategoryCount;

          await prisma.user_day_activities.update({
            where: { id: existingActivity.id },
            data: {
              category: updatedCategories.join(','),
              slot_status: isComplete.toString(),
              updated_at: new Date(),
            },
          });
        }
      }

      return res.status(200).json({
        success: false,
        message: 'Day activity already added',
      });
    }

    // 4. Insert new activity
    const initialCategory = category ?? null;

    const totalPrayerCategoriesCount = await prisma.session_prayer_points.findMany({
      where: { prayerId },
      distinct: ['category'],
    });

    const userCategoryCount = initialCategory ? 1 : 0;
    const isComplete = totalPrayerCategoriesCount.length === userCategoryCount;

    await prisma.user_day_activities.create({
      data: {
        userId,
        slotId,
        prayerId,
        category: initialCategory,
        slot_status: isComplete.toString(),
        activity_date: activityDate,
        org_id: orgId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Day activity added',
    });
  } catch (err) {
    console.error('Error adding user day activity:', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error: ' + err.message,
    });
  }
};


// controllers/specialPrayerController.js



exports.getSpecialPrayerSlots = async (req, res) => {
  const { prayerId, date } = req.body;

  // Validate input
  if (!prayerId) {
    return res.status(400).json({
      success: false,
      error: { prayerId: ['The prayerId field is required.'] },
    });
  }

  try {



     const userId = req.user.id;
    const orgId = req.user.org_id;
    // Check if prayer exists
    const prayer = await prisma.session_prayers.findFirst({
      where: { id: Number(prayerId) },
    });

    if (!prayer) {
      return res.status(200).json({
        success: false,
        message: 'Prayer Not Found',
      });
    }

    const activityDate = new Date(moment(date).format('YYYY-MM-DD'));

    // Fetch time slots with subscription and day activity for this user
    const slots = await prisma.time_slots.findMany({
      where: { prayerId: Number(prayerId) },
      select: {
        id: true,
        from_slot: true,
        to_slot: true,
        special_prayers_subscribs: {
          where: {
            userId: userId,
            deleted_at: null,
          },
        }
        // mydayactivity: {
        //   where: {
        //     userId: userId,
        //     activity_date: activityDate,
        //   },
        // },
      },
    });

    // Append is_subscribed flag to each slot
    const formattedSlots = slots.map((slot) => ({
      ...slot,
      is_subscribed: slot.special_prayers_subscribs.length > 0,
    }));

    return res.status(200).json({
      success: true,
      timeslots: formattedSlots,
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};



exports.prayForTheNation = async (req, res) => {
  try {
    const prayer = await prisma.session_prayers.findFirst({
      where: {
        org_id: null,
      },
      include: {
        session_prayer_points: true,
        pray_for_nation: true,
        session_scriptures: true,
      },
    });

    if (prayer) {
      return res.status(200).json({
        success: true,
        prayer:convertBigInt(prayer),
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Prayer Not Found',
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.myDayActivity = async (req, res) => {
  const { prayerId, date, slotId } = req.body;

  if (!prayerId || !date) {
    return res.status(400).json({
      success: false,
      error: {
        prayerId: !prayerId ? 'prayerId is required' : undefined,
        date: !date ? 'date is required' : undefined,
      },
    });
  }

  try {
    const prayer = await prisma.session_prayers.findUnique({
      where: { id: Number(prayerId) },
    });

    if (!prayer) {
      return res.status(200).json({
        success: false,
        message: 'Prayer Not Found',
      });
    }

     const userId = req.user.id;
    const orgId = req.user.org_id;


    const activitydetails = await prisma.user_day_activities.findMany({
      where: {
        slotId: Number(slotId),
        userId,
        activity_date: new Date(date),
        prayerId: Number(prayerId),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Day activity details',
      dayactivitydetails: activitydetails,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.removeSpecialPrayerSubscription = async (req, res) => {
  const { prayerId, slotId } = req.body;

  // Validate input
  if (!prayerId || !slotId) {
    return res.status(400).json({
      success: false,
      error: {
        prayerId: !prayerId ? 'prayerId is required' : undefined,
        slotId: !slotId ? 'slotId is required' : undefined,
      },
    });
  }

  const userId = req.user.id; // Assuming JWT middleware sets req.user

  try {
    const existingSubscription = await prisma.special_prayers_subscribs.findFirst({
      where: {
        userId: userId,
        prayerId: parseInt(prayerId),
        slotId: parseInt(slotId),
        deleted_at: null,
      },
    });

    if (existingSubscription) {
      await prisma.special_prayers_subscribs.updateMany({
        where: {
          userId: userId,
          prayerId: parseInt(prayerId),
          slotId: parseInt(slotId),
          deleted_at: null,
        },
        data: {
          deleted_at: new Date(),
          updated_by: userId,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Subscription details are deleted successfully',
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Subscription details are not found.',
      });
    }
  } catch (error) {
    console.error('RemoveSpecialPrayerSubscription Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};
