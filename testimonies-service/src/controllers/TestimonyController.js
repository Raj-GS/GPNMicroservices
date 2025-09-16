const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

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

exports.postTestimony = async (req, res) => {
  const { prayer_id, title, description } = req.body;

  // Validation
  const errors = {};
  if (!prayer_id) errors.prayer_id = ['The prayer_id field is required.'];
  if (!title) errors.title = ['The title field is required.'];
  if (!description) errors.description = ['The description field is required.'];

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: errors });
  }

  try {
    const user = req.user; // assuming from JWT auth middleware
    const userId = user.id;
    const orgId = user.org_id;
    const userRole = user.role;

    const answeredPrayer = await prisma.pray_requests.findFirst({
      where: {
        id: Number(prayer_id),
        is_answerd: 1,
        deleted_at: null,
      },
    });

    if (!answeredPrayer) {
      return res.status(202).json({
        success: true,
        message: 'Please select answered prayer',
      });
    }

    const existingTestimony = await prisma.testimonies.findFirst({
      where: {
        prayer_id: Number(prayer_id),
        deleted_at: null,
      },
    });

    if (existingTestimony) {
      return res.status(202).json({
        success: true,
        message: 'Already posted',
      });
    }

    // Approval settings logic
    const approvalSettings = await prisma.approval_settings.findFirst({
      where: {
        module_name: 'testimony',
        org_id: orgId,
      },
    });

    let pendingStatus = 0;

    if (userRole === 4 && approvalSettings) {
      const orgUser = await prisma.organisation_user.findFirst({
        where: { user_id: userId },
      });

      const isVerified = orgUser?.isVerified === 1;
      const approvalYes = approvalSettings.approval === 'yes';
      const bvYes = approvalSettings.bv_status === 'yes';

      if ((approvalYes && bvYes && isVerified) || 
          (!approvalYes && !bvYes) || 
          (!approvalYes && bvYes && isVerified)) {
        pendingStatus = 1;
      } else if (!approvalYes && bvYes && !isVerified) {
        pendingStatus = 0;
      }
    } else {
      if (userRole !== 4) {
        pendingStatus = 1;
      }
    }

    // Create Testimony
    const testimony = await prisma.testimonies.create({
      data: {
        prayer_id: Number(prayer_id),
        category_id: answeredPrayer.category_id,
        title,
        description,
        user_id: userId,
        org_id: orgId,
        status: pendingStatus,
      },
    });

    // Notifications
    try {
      const notifyUser = await prisma.app_users.findUnique({ where: { id: userId } });

      const commonNotification = {
        title: 'Testimony',
        time: new Date().toTimeString().split(' ')[0], // HH:mm:ss
        content: `New Testimony added by ${notifyUser.first_name} ${notifyUser.last_name}`,
        user_id: userId,
        org_id: orgId,
        is_admin_read: 'false',
        module_id: testimony.id,
      };

      if (pendingStatus === 1) {
        await prisma.notification.create({
          data: {
            ...commonNotification,
            is_admin: 1,
            role: 'All',
          },
        });
      }

      if (userRole !== 2) {
        await prisma.notification.create({
          data: {
            ...commonNotification,
            is_admin: 1,
            role: 'Admin',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification created successfully',
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: err.message,
      });
    }

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: e.message,
    });
  }
};


exports.getList = async (req, res) => {
  const user = req.user; // Set from JWT middleware
  const orgId = user.org_id;

  try {
    const testimonies = await prisma.testimonies.findMany({
      where: {
        org_id: orgId,
        deleted_at: null,
        status: 1,
      },
      include: {
        app_users: true,
        pray_requests: true,
     //   editelist: true,
        categories: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    // Count likes, praises, shares for each testimony
    const enrichedTestimonies = await Promise.all(testimonies.map(async (testimony) => {
      const [total_likes, total_praises, total_shares] = await Promise.all([
        prisma.testimony_like.count({ where: { testimony_id: testimony.id, like_id:1 } }),
        prisma.testimony_like.count({ where: { testimony_id: testimony.id, like_id:3 } }),
        prisma.testimony_like.count({ where: { testimony_id: testimony.id, like_id:2 } }),
      ]);

      return {
        ...testimony,
        total_likes,
        total_praises,
        total_shares,
      };
    }));

    return res.status(202).json({
      success: true,
      data: convertBigInt(enrichedTestimonies),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};




exports.getOwnList = async (req, res) => {

  try {
    const user = req.user; // Assuming verifyToken adds `user` to `req`

    const testimonies = await prisma.testimonies.findMany({
      where: {
        org_id: user.org_id,
        user_id: user.id,
        deleted_at: null,
      },
      include: {
        app_users: true,
        pray_requests: true,
     //   editelist: true,
        categories: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return res.status(202).json({
      success: true,
      data: convertBigInt(testimonies),
    });
  } catch (error) {
    console.error('Error fetching own testimonies:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


// controllers/testimonyController.ts


exports.likeTestimony = async (req, res) => {
  const { prayer_id, testimony_id, like_id } = req.body;
  const user = req.user; // set via auth middleware

  if (!prayer_id || !testimony_id || !like_id) {
    return res.status(400).json({
      success: false,
      message: 'prayer_id, testimony_id, and like_id are required',
    });
  }

  try {
    const prayer = await prisma.pray_requests.findFirst({
      where: {
        id: prayer_id,
        is_answerd: 1,
        deleted_at: null,
      },
    });

    if (!prayer) {
      return res.status(200).json({
        success: true,
        message: 'Answered Prayer not Found',
      });
    }

    const testimony = await prisma.testimonies.findFirst({
      where: {
        id: testimony_id,
        deleted_at: null,
      },
    });

    if (!testimony) {
      return res.status(200).json({
        success: true,
        message: 'Testimony not Found',
      });
    }

    const existingLike = await prisma.testimony_like.findFirst({
      where: {
        testimony_id,
        like_id,
        user_id: user.id,
      },
    });

    const likeIdNum = parseInt(like_id);

    // Prevent conflicting likes
    if (likeIdNum === 1) {
      const alreadyPraised = await prisma.testimony_like.findFirst({
        where: {
          testimony_id,
          like_id: 3,
          user_id: user.id,
        },
      });
      if (alreadyPraised) {
        return res.status(200).json({
          success: false,
          message: 'You already Praised it.',
        });
      }
    }

    if (likeIdNum === 3) {
      const alreadyLiked = await prisma.testimony_like.findFirst({
        where: {
          testimony_id,
          like_id: 1,
          user_id: user.id,
        },
      });
      if (alreadyLiked) {
        return res.status(200).json({
          success: false,
          message: 'You already liked it.',
        });
      }
    }

    if (existingLike) {
      // Revert like if exists
      if (likeIdNum === 1 || likeIdNum === 3) {
        await prisma.testimony_like.delete({
          where: {
            id: existingLike.id,
          },
        });

        return res.status(200).json({
          success: true,
          message: 'Successfully Reverted Your like',
        });
      }
    }

    // Create a new like
    await prisma.testimony_like.create({
      data: {
        prayer_id,
        testimony_id,
        like_id: likeIdNum,
        user_id: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully liked',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

exports.getTestimonyLikesList = async (req, res) => {

  const { prayer_id } = req.body;

  if (!prayer_id) {
    return res.status(400).json({ error: { prayer_id: ['The prayer_id field is required.'] } });
  }

  try {
    const prayer = await prisma.pray_requests.findFirst({
      where: {
        id: Number(prayer_id),
        is_answerd: 1,
      },
    });

    if (!prayer) {
      return res.status(200).json({
        success: true,
        message: 'Answered Prayer not Found',
      });
    }

    const testimony = await prisma.testimonies.findFirst({
      where: {
        prayer_id: Number(prayer_id),
      },
    });

    if (!testimony) {
      return res.status(200).json({
        success: true,
        message: 'Testimony not Found',
      });
    }

    const like1 = await prisma.testimony_like.count({
      where: { prayer_id: Number(prayer_id), like_id: 1 },
    });

    const like2 = await prisma.testimony_like.count({
      where: { prayer_id: Number(prayer_id), like_id: 2 },
    });

    const like3 = await prisma.testimony_like.count({
      where: { prayer_id: Number(prayer_id), like_id: 3 },
    });

    return res.status(200).json({
      success: true,
      like1,
      like2,
      like3,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something Went wrong' });
  }
};

exports.deleteTestimony = async (req, res) => {

  const { testimony_id } = req.body;
  const user = req.user;

  if (!testimony_id) {
    return res.status(400).json({ error: { testimony_id: ['The testimony_id field is required.'] } });
  }

  try {
    const testimony = await prisma.testimonies.findFirst({
      where: {
        id: Number(testimony_id),
        user_id: user.id,
        deleted_at: null,
      },
    });

    if (!testimony) {
      return res.status(200).json({
        success: true,
        message: 'Already deleted / Not found',
      });
    }

    await prisma.testimonies.update({
      where: { id: Number(testimony_id) },
      data: {
        deleted_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something Went wrong' });
  }
};

exports.editTestimony = async (req, res) => {

  const { testimony_id, title, description } = req.body;
  const user = req.user;

  if (!testimony_id || !title || !description) {
    return res.status(400).json({
      error: {
        ...(testimony_id ? {} : { testimony_id: ['The testimony_id field is required.'] }),
        ...(title ? {} : { title: ['The title field is required.'] }),
        ...(description ? {} : { description: ['The description field is required.'] }),
      },
    });
  }

  try {
    const testimony = await prisma.testimonies.findFirst({
      where: {
        id: Number(testimony_id),
        user_id: user.id,
        deleted_at: null,
      },
    });

    if (!testimony) {
      return res.status(200).json({
        success: true,
        message: 'Testimony not Found',
      });
    }

    await prisma.testimonies.update({
      where: { id: Number(testimony_id) },
      data: {
        title,
        description,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Testimony Updated Successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something Went wrong' });
  }
};



exports.readCount = async (req, res) => {

  const { name, name_id } = req.body;
  const userId = req.user?.id;

  if (!name || !name_id) {
    return res.status(200).json({
      error: {
        name: !name ? ['The name field is required.'] : undefined,
        name_id: !name_id ? ['The name_id field is required.'] : undefined,
      }
    });
  }

  try {
    if (name === 'prayer') {
      const prayer = await prisma.pray_requests.findUnique({
        where: { id: Number(name_id) }
      });

      if (!prayer) {
        return res.status(200).json({
          success: false,
          message: 'prayer not found'
        });
      }
    }

    if (name === 'notification') {
      const notification = await prisma.notification.findUnique({
        where: { id: Number(name_id) }
      });

      if (!notification) {
        return res.status(200).json({
          success: false,
          message: 'notification not found'
        });
      }
    }

    const existing = await prisma.readcount.findFirst({
      where: {
        user_id: userId,
        name,
        name_id: Number(name_id)
      }
    });

    if (existing) {
      return res.status(200).json({
        success: false,
        message: 'Already clicked'
      });
    }

    await prisma.readcount.create({
      data: {
        name,
        name_id: Number(name_id),
        user_id: userId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'viewed successfully'
    });

  } catch (error) {
    console.error('readCount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

