const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const transporter = require('../utils/mailTransport');
const axios = require('axios');


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


exports.storeToken = async (req, res) => {
  const { device_key } = req.body;

  if (!device_key) {
    return res.status(200).json({
      error: { device_key: ['The device_key field is required.'] },
    });
  }

  try {
    await prisma.app_users.update({
      where: { id: req.user.id },
      data: { device_key },
    });

    return res.status(200).json({
      success: true,
      message: 'Token saved successfully',
    });
  } catch (error) {
    console.error('storeToken error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

exports.storeNotification = async (req, res) => {
  const { is_admin, title } = req.body;

  if (typeof is_admin === 'undefined') {
    return res.status(200).json({
      error: { is_admin: ['The is_admin field is required.'] },
    });
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        user_id: req.user.id,
        title: title || '',
        content: title || '',
        is_admin: 1, // forcefully setting like in Laravel
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification stored successfully',
      data: convertBigInt(notification),
    });
  } catch (error) {
    console.error('storeNotifi error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.notificationList = async (req, res) => {


  try {
    const user = req.user; // authenticated user from JWT middleware

    // Fetch unread notifications (limit 20)
    const notifications = await prisma.notification.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                role: 'User',
                user_id: user.id,
              },
              {
                role: 'All',
                NOT: {
                  user_id: user.id,
                },
              },
            ],
          },
          {
            OR: [
              { org_id: user.org_id },
              { org_id: null },
            ],
          },
          {
            NOT: {
              id: {
                in: (
                  await prisma.notification_users.findMany({
                    where: {
                      user_id: user.id,
                    },
                    select: { notification_id: true },
                  })
                ).map(nu => nu.notification_id),
              },
            },
          },
        ],
      },
      orderBy: {
        id: 'desc',
      },
      take: 20,
    });

    // Count total unread notifications
    const totalNotifications = await prisma.notification.count({
      where: {
        AND: [
          {
            OR: [
              {
                role: 'User',
                user_id: user.id,
              },
              {
                role: 'All',
                NOT: {
                  user_id: user.id,
                },
              },
            ],
          },
          {
            OR: [
              { org_id: user.org_id },
              { org_id: null },
            ],
          },
          {
            NOT: {
              id: {
                in: (
                  await prisma.notification_users.findMany({
                    where: {
                      user_id: user.id,
                    },
                    select: { notification_id: true },
                  })
                ).map(nu => nu.notification_id),
              },
            },
          },
        ],
      },
    });

    return res.status(200).json({
      success: true,
      data: convertBigInt(notifications),
      total_notifications: totalNotifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.notificationDetails = async (req, res) => {
  const { title, module_id, notification_id } = req.body;

  if (!title || !module_id || !notification_id) {
    return res.status(400).json({
      success: false,
      message: 'title, module_id and notification_id are required',
    });
  }

  const validTitles = ['Prayer', 'Testimony'];
  if (!validTitles.includes(title)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid title provided',
    });
  }

  const userId = req.user.id;
  const orgId = req.user.org_id;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notification_id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    let details = null;

    if (title === 'Prayer') {
      const prayer = await prisma.pray_requests.findFirst({
        where: {
          id: module_id,
          deleted_at: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
          is_approved: true,
          importance: true,
          user_id: true,
          category_id: true,
          categories: {
            select: { id: true, name: true },
          },
          app_users: {
            select: { id: true, first_name: true, last_name: true },
          },
          prayer_comments: {
            where: { deleted_at: null },
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id: true,
              prayer_id: true,
              comment: true,
              created_at: true,
              deleted_at: true,
            },
          },
          pray_requests_data: {
            where: {
              OR: [
                { user_id: userId, reaction_type: 1 },          // isPrayed
                { user_id: userId, reaction_type: { not: 1 } }, // isReacted
                { reaction_type: { not: 1 } },                  // userReactions
              ],
            },
            select: {
              id: true,
              user_id: true,
              reaction_type: true,
              created_at: true,
            },
          },
          _count: {
            select: {
              prayer_comments: {
                where: { deleted_at: null },
              },
              pray_requests_data: true,
            },
          },
        },
      });

      if (prayer) {
        const isPrayed = prayer.pray_requests_data.find(
          (r) => r.user_id === userId && r.reaction_type === 1
        );
        const isReacted = prayer.pray_requests_data.find(
          (r) => r.user_id === userId && r.reaction_type !== 1
        );
        const userReactions = prayer.pray_requests_data.filter(
          (r) => r.reaction_type !== 1
        );

        const maxCreatedAt = await prisma.pray_requests_data.aggregate({
          where: {
            prayer_id: module_id,
            reaction_type: 1,
          },
          _max: {
            created_at: true,
          },
        });

        details = {
          ...prayer,
          isPrayed: isPrayed || null,
          isReacted: isReacted || null,
          userReactions,
          latestComment: prayer.prayer_comments[0] || null,
          maxPrayedAt: maxCreatedAt._max.created_at || null,
        };
      }

    } else if (title === 'Testimony') {
      const testimony = await prisma.testimonies.findFirst({
        where: {
          id: module_id,
          deleted_at: null,
        },
        include: {
          userlist: true,
          prayer: true,
          editelist: true,
          category: true,
          _count: {
            select: {
              likes: true,
              praises: true,
              shares: true,
            },
          },
        },
      });

      if (testimony) {
        details = {
          ...testimony,
          total_likes: testimony._count.likes,
          total_praises: testimony._count.praises,
          total_shares: testimony._count.shares,
        };
      }
    }

    if (!details) {
      return res.status(404).json({
        success: false,
        message: `${title} details not found`,
      });
    }

    // Mark notification as read
const existing = await prisma.notification_users.findFirst({
  where: {
    notification_id: 473,
    user_id: 252,
  },
});

if (existing) {
  await prisma.notification_users.update({
    where: { id: existing.id },
    data: { updated_at: new Date() },
  });
} else {
  await prisma.notification_users.create({
    data: {
      notification_id: notification_id,
      user_id: userId,
      org_id: orgId,
    },
  });
}


    return res.status(200).json({
      success: true,
      data: convertBigInt(details),
      message: `${title} details retrieved successfully`,
    });

  } catch (error) {
    console.error('notificationDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

