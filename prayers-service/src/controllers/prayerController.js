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



exports.category = async (req, res) => {
  try {
   const userId = req.user.id;
const userOrgId = req.user.org_id;
const userRole = req.user.role;

console.log('User ID:', userId);
console.log('User Org ID:', userOrgId);
console.log('User Role:', userRole);

    // Fetch categories
    const categories = await prisma.categories.findMany({
      where: {
        deleted_at: null,
        OR: [
          { org_id: null },
          { org_id: userOrgId }
        ]
      },
      orderBy: { id: 'desc' }
    });

    const getarray = [];

    for (const category of categories) {
      const getprayers = await prisma.pray_requests.findMany({
        where: {
          org_id: userOrgId,
          category_id: Number(category.id),
          checked: 0,
          is_approved:'1',
          is_answerd: 0
        }
      });

      let prcount = getprayers.length;

      for (const prayer of getprayers) {
        const read = await prisma.readcount.findFirst({
          where: {
            name: 'prayer',
            user_id: userId,
            name_id: Number(prayer.id)
          }
        });
        if (read) {
          prcount -= 1;
        }
      }

      getarray.push({
        cat_id: category.id,
        count: prcount
      });
    }

    return res.status(200).json({
      success: true,
      count: convertBigInt(getarray),
      data: convertBigInt(categories)
    });

  } catch (error) {
    console.error('Category Error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};


exports.prayRequestList = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.org_id;

    const prayerRequests = await prisma.pray_requests.findMany({
      where: {
        user_id: userId,
        org_id: orgId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5,
      include: {
        categories: {
          select: { name: true }
        },
        testimonies: {
          select: {
            title: true,
            description: true
          },
          take: 1
        },
        prayer_comments: {
          orderBy: {
            created_at: 'desc'
          },
          select: {
            comment: true,
            created_at: true
          },
          take: 1
        }
      }
    });

    const formatted = prayerRequests.map(pr => ({
      category_name: pr.category?.name || null,
      title: pr.title,
      is_approved: pr.is_approved,
      is_answerd: pr.is_answerd,
      checked: pr.checked,
      is_clicked: pr.is_clicked,
      description: pr.description,
      id: pr.id,
      subcategory_id: pr.subcategory_id,
      created_at: pr.created_at,
      testimony_title: pr.testimonies?.[0]?.title || null,
      testimony_description: pr.testimonies?.[0]?.description || null,
      latest_comment: pr.prayer_comments?.[0]?.comment || null,
      comment_created_at: pr.prayer_comments?.[0]?.created_at || null
    }));

    return res.status(200).json({
      success: true,
      message: 'Pray request data',
      data: convertBigInt(formatted)
    });
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.answeredPrayersList = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.org_id;

    const prayers = await prisma.pray_requests.findMany({
      where: {
        is_answerd: 1,
        user_id: userId,
        org_id: orgId,
        deleted_at: null
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20,
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        pray_requests_data: {
          where: {
            user_id: userId,
            reaction_type: 1,
            created_at: {
              gte: startOfDay(new Date()),
              lte: endOfDay(new Date())
            }
          },
          include: {
            app_users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'answered prayers data',
      data: convertBigInt(prayers)
    });
  } catch (error) {
    console.error('Error fetching answered prayers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.allAnsweredPrayersList = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const userId = req.user.id;

    // Get today’s date range for prayedCount filtering
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const prayers = await prisma.pray_requests.findMany({
      where: {
        is_answerd: 1,
        org_id: orgId,
        deleted_at: null
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20,
      select: {
        user_id: true,
        title: true,
        is_clicked: true,
        description: true,
        id: true,
        category_id: true,
        created_at: true,
        answered_at: true,
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        origanisation: {
          select: {
            id: true,
            org_name: true // change if needed
          }
        },
        pray_requests_data: {
          where: {
            created_at: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          select: {
            user_id: true,
            app_users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        },
        // Fetch if current user has reacted to it (isPrayed logic)
        _count: {
          select: {
            pray_requests_data: {
              where: {
                user_id: userId,
                reaction_type: 1
              }
            }
          }
        },
        app_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'answered prayers data',
      data: convertBigInt(prayers)
    });

  } catch (error) {
    console.error('Error fetching all answered prayers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.allPrayRequestList = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const userId = req.user.id;

    const rawPrayerRequests = await prisma.pray_requests.findMany({
      where: {
        org_id: orgId,
        is_approved: "1",
        checked: null,
        deleted_at: null
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        is_answerd: true,
        is_clicked: true,
        checked: true,
        description: true,
        pray_requests_data: {
          where: {
            user_id: userId,
            reaction_type: 1
          },
          take: 1
        }
      }
    });

    // This is the Laravel-style prayedCount logic, written inline
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const enriched = await Promise.all(
      rawPrayerRequests.map(async (pr) => {
        const prayedCount = await prisma.pray_requests_data.findMany({
          where: {
            prayer_id: pr.id,
            created_at: {
              gte: start,
              lte: end
            }
          },
          select: {
            user_id: true,
            app_users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        });

        return {
          ...pr,
          prayedCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Pray request data',
      data: enriched
    });

  } catch (error) {
    console.error('Error fetching all prayer requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



exports.validatePrayRequest = [
  body('category_id').notEmpty().withMessage('Category is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

exports.prayrequest = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: errors.mapped() });
  }

  const { category_id, title, description, checked, importance } = req.body;
  const userId = req.user.id;
  const orgId = req.user.org_id;
  const role = req.user.role;



  try {
    // Get approval settings
    const approvalSettings = await prisma.approval_settings.findFirst({
      where: {
        module_name: 'prayer',
        org_id: orgId
      }
    });

    let pendingstatus = "0";
    let importance1 = '';
    if(importance==1){
   importance1 = 'critical';
}else if(importance==2){
   importance1 = 'high';
}
else {
    importance1 = 'medium';

}

    if (role === 4 && approvalSettings) {
      const currentUser = await prisma.organisation_user.findFirst({
        where: { user_id: userId }
      });

      const isVerified = currentUser?.isVerified === 1;
      const approvalYes = approvalSettings.approval === 'yes';
      const bvYes = approvalSettings.bv_status === 'yes';

      if (
        (approvalYes && bvYes && isVerified) ||
        (!approvalYes && bvYes && isVerified) ||
        (!approvalYes && !bvYes)
      ) {
        pendingstatus = "1";
      }
    } else if (role !== 4) {
      pendingstatus = "1";
    }

    const prayer = await prisma.pray_requests.create({
      data: {
        category_id: Number(category_id),
        title,
        description,
        checked: checked || 0,
        user_id: userId,
        org_id: orgId,
        importance: importance1,
        is_approved: pendingstatus,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const notifyUser = await prisma.app_users.findUnique({
      where: { id: userId },
      select: { first_name: true, last_name: true }
    });

    const notificationData = {
      title: 'Prayer',
      time: new Date().toLocaleTimeString(),
      content: `New prayer request by ${notifyUser.first_name} ${notifyUser.last_name}`,
      user_id: userId,
      org_id: orgId,
      is_admin_read: 'false',
      module_id: Number(prayer.id),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Send to all users if approved
    if (pendingstatus === "1") {
      await prisma.notification.create({
        data: {
          ...notificationData,
          is_admin: 0,
          role: 'All'
        }
      });
    }

    // Notify admin if current user is not admin
    if (role !== 2) {
      await prisma.notification.create({
        data: {
          ...notificationData,
          is_admin: 1,
          role: 'Admin'
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Pray request inserted successfully'
    });
  } catch (error) {
    console.error('Pray request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.filteredPrayRequestList = async (req, res) => {
const userId = req.user.id;
const orgId = req.user.org_id;
const categoryId = Number(req.body.category_id);

const prayers = await prisma.pray_requests.findMany({
  where: {
    org_id: orgId,
    is_approved: "1",
    checked: 0,
    deleted_at: null,
    category_id: categoryId
  },
  orderBy: { created_at: 'desc' },
  include: {
    categories: { select: { id: true, name: true } },
    pray_requests_data: {
      where: {
        user_id: userId,
        reaction_type: 1
      },
      take: 1
    },
    edit_prayer: true
  }
});

// Fetch all readcounts for the current user where name = 'prayer'
const readCounts = await prisma.readcount.findMany({
  where: {
    user_id: userId,
    name: 'prayer',
    name_id: { in: prayers.map(p => Number(p.id)) }
  },
  select: {
    name_id: true
  }
});

const readMap = new Set(readCounts.map(r => r.name_id));

// Append read status to each prayer
const finalResult = prayers.map(pr => ({
  ...pr,
  is_read: readMap.has(pr.id)
}));

return res.status(200).json({
  success: true,
  message: 'Pray request data',
  data: convertBigInt(finalResult)
});
};


exports.prayRequestUpdate = async (req, res) => {
  const { prayerId, reaction_type } = req.body;
  console.log('Pray Request Update:', req.body);

  if (!prayerId || !reaction_type) {
    return res.status(400).json({
      error: {
        message: 'Prayer ID and reaction_type are required.'
      }
    });
  }

  const userId = req.user.id;

  try {
    const existing = await prisma.pray_requests_data.findFirst({
      where: {
        user_id: userId,
        prayer_id: Number(prayerId),
        reaction_type: Number(reaction_type)
      }
    });

    if (!existing) {
      // Create new reaction
      await prisma.pray_requests_data.create({
        data: {
          user_id: userId,
          prayer_id: Number(prayerId),
          reaction_type: Number(reaction_type),
          created_at: new Date()
        }
      });

      // If not "prayed" reaction (type 1), delete other non-1 reactions
      if (Number(reaction_type) !== 1) {
        await prisma.pray_requests_data.deleteMany({
          where: {
            user_id: userId,
            prayer_id: Number(prayerId),
            reaction_type: {
              notIn: [1, Number(reaction_type)]
            }
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Pray request inserted successfully'
      });

    } else {
      // Delete the existing reaction
      await prisma.pray_requests_data.deleteMany({
        where: {
          user_id: userId,
          prayer_id: Number(prayerId),
          reaction_type: Number(reaction_type)
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Pray request deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error updating prayer reaction:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


exports.prayAnswerd = async (req, res) => {
  const { prayer_id } = req.body;

  if (!prayer_id || isNaN(prayer_id)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Prayer ID is required and must be a number.' }
    });
  }

  try {
    // First, check if the prayer exists (either answered or not answered, and not deleted)
    const existingPrayer = await prisma.pray_requests.findFirst({
      where: {
        id: Number(prayer_id),
        deleted_at: null
      }
    });

    if (!existingPrayer) {
      return res.status(200).json({
        success: false,
        message: 'Prayer does not exist'
      });
    }

    if (existingPrayer.is_answerd === 1) {
      // Unmark as answered
      await prisma.pray_requests.update({
        where: { id: Number(prayer_id) },
        data: {
          is_answerd: 0,
          answered_at: null
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Pray info deleted'
      });
    } else {
      // Mark as answered
      await prisma.pray_requests.update({
        where: { id: Number(prayer_id) },
        data: {
          is_answerd: 1,
          answered_at: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Pray info updated'
      });
    }
  } catch (error) {
    console.error('Error in prayAnswerd:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


exports.updatePrayRequest = async (req, res) => {
  const { prayer_id, title, description } = req.body;

  if (!prayer_id || !title || !description) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Prayer ID, title, and description are required.'
      }
    });
  }

  try {
    const existingPrayer = await prisma.pray_requests.findUnique({
      where: { id: Number(prayer_id) }
    });

    if (!existingPrayer) {
      return res.status(400).json({
        success: false,
        message: 'Pray not found'
      });
    }

    const orgId = req.user.org_id;
    const userId = req.user.id;
    const role = req.user.role;

    const approvalSettings = await prisma.approval_settings.findFirst({
      where: {
        module_name: 'prayer',
        org_id: orgId
      }
    });

    let pendingstatus = null;

    if (role === 4 && approvalSettings) {
      const orgUser = await prisma.organisation_user.findFirst({
        where: { user_id: userId }
      });

      const isVerified = orgUser?.isVerified === 1;
      const approvalYes = approvalSettings.approval === 'yes';
      const bvYes = approvalSettings.bv_status === 'yes';

      if (
        (approvalYes && bvYes && isVerified) ||
        (!approvalYes && bvYes && isVerified) ||
        (!approvalYes && !bvYes)
      ) {
        pendingstatus = 1;
      }
    } else if (role !== 4) {
      pendingstatus = 1;
    }

    if (pendingstatus === 1) {
      await prisma.pray_requests.update({
        where: { id: Number(prayer_id) },
        data: {
          title,
          description,
          is_approved: "1",
          updated_at: new Date()
        }
      });
    } else {
      await prisma.edit_prayer.create({
        data: {
          prayer_id: Number(prayer_id),
          description
        }
      });

      await prisma.pray_requests.update({
        where: { id: Number(prayer_id) },
        data: {
          is_approved: "0",
          updated_at: new Date(),
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Pray updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};



exports.prayRequestDetails = async (req, res) => {
  const { prayer_id } = req.body;

  if (!prayer_id) {
    return res.status(400).json({
      error: { prayer_id: ['The prayer_id field is required.'] }
    });
  }

  try {
    const prayer = await prisma.pray_requests.findUnique({
      where: {
        id: Number(prayer_id)
      },
      select: {
        id: true,
        title: true,
        description: true,
        is_answerd: true,
        pray_requests_data: {
          where: {
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)) // today only
            }
          },
          select: {
            app_users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        },
        edit_prayer: true
      }
    });

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Prayer details',
      data: convertBigInt(prayer)
    });
  } catch (error) {
    console.error('Error fetching prayer details:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};



exports.likePrayer = async (req, res) => {
  const { prayer_id, like_id } = req.body;
  const userId = req.user.id;

  if (!prayer_id || !like_id) {
    return res.status(400).json({
      error: {
        prayer_id: prayer_id ? undefined : ['The prayer_id field is required.'],
        like_id: like_id ? undefined : ['The like_id field is required.']
      }
    });
  }

  try {
    // Check if prayer exists
    const prayer = await prisma.pray_requests.findUnique({
      where: { id: Number(prayer_id) }
    });

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    // Check if user already liked
    const existingLike = await prisma.prayer_like.findFirst({
      where: {
        prayer_id: Number(prayer_id),
        like_id: Number(like_id),
        user_id: userId
      }
    });

    // If already liked and it's like_id 1 or 3 → remove it (toggle off)
    if (existingLike && [1, 3].includes(Number(like_id))) {
      await prisma.prayer_like.delete({
        where: {
          id: existingLike.id
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully reverted your like'
      });
    }

    // Create new like
    await prisma.prayer_like.create({
      data: {
        prayer_id: Number(prayer_id),
        user_id: userId,
        like_id: Number(like_id)
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully liked'
    });

  } catch (error) {
    console.error('Like prayer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


exports.prayerLikeList = async (req, res) => {
  const { prayer_id } = req.body;

  if (!prayer_id) {
    return res.status(400).json({
      error: {
        prayer_id: ['The prayer_id field is required.']
      }
    });
  }

  try {
    const prayer = await prisma.pray_requests.findUnique({
      where: { id: Number(prayer_id) }
    });

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    // Count likes by like_id
    const [like1, like2, like3] = await Promise.all([
      prisma.prayer_like.count({
        where: {
          prayer_id: Number(prayer_id),
          like_id: 1
        }
      }),
      prisma.prayer_like.count({
        where: {
          prayer_id: Number(prayer_id),
          like_id: 2
        }
      }),
      prisma.prayer_like.count({
        where: {
          prayer_id: Number(prayer_id),
          like_id: 3
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      like1,
      like2,
      like3
    });

  } catch (error) {
    console.error('Error in prayerLikeList:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


exports.editPrayer = async (req, res) => {
  const { prayer_id, title, description } = req.body;
  const user = req.user;

  // Validate input
  if (!prayer_id || !title || !description) {
    return res.status(200).json({ error: 'prayer_id, title and description are required' });
  }

  try {
    // Check if prayer exists and belongs to user
    const existingPrayer = await prisma.pray_requests.findFirst({
      where: {
        id: parseInt(prayer_id),
        user_id: user.id,
        deleted_at: null
      }
    });

    if (!existingPrayer) {
      return res.status(200).json({ success: false, message: 'Prayer not found' });
    }

    // Fetch approval settings
    const approvalSettings = await prisma.approval_settings.findFirst({
      where: {
        module_name: 'prayer',
        org_id: user.org_id
      }
    });

    let pendingStatus = null;

    if (user.role === 4 && approvalSettings) {
      const orgUser = await prisma.organisation_user.findFirst({
        where: {
          user_id: user.id
        }
      });

      const isVerified = orgUser?.isVerified === 1;
      const approvalYes = approvalSettings.approval === 'yes';
      const bvYes = approvalSettings.bv_status === 'yes';

      if ((approvalYes && bvYes && isVerified) || (!approvalYes && bvYes && isVerified) || (!approvalYes && !bvYes)) {
        pendingStatus = 1;
      }
    } else {
      // No approval check for other roles
      pendingStatus = 1;
    }

    // If auto-approval allowed
    if (pendingStatus === 1) {
      await prisma.pray_requests.update({
        where: { id: parseInt(prayer_id) },
        data: {
          title,
          description,
          is_approved: "1"
        }
      });
    } else {
      const isApproved = existingPrayer.is_approved === 1;

      if (isApproved) {
        const editRequest = await prisma.edit_prayer.findFirst({
          where: { prayer_id: parseInt(prayer_id) }
        });

        if (editRequest) {
          await prisma.edit_prayer.update({
            where: { id: editRequest.id },
            data: { title, description }
          });
        } else {
          await prisma.edit_prayer.create({
            data: {
              prayer_id: parseInt(prayer_id),
              title,
              description
            }
          });
        }

        await prisma.pray_requests.update({
          where: { id: parseInt(prayer_id) },
          data: {
            is_approved: "0",
            edit_request: 'yes'
          }
        });
      } else {
        const editRequest = await prisma.edit_prayer.findFirst({
          where: { prayer_id: parseInt(prayer_id) }
        });

        if (editRequest) {
          await prisma.edit_prayer.update({
            where: { id: editRequest.id },
            data: { title, description }
          });

          await prisma.pray_requests.update({
            where: { id: parseInt(prayer_id) },
            data: {
              is_approved: "0",
              edit_request: 'yes'
            }
          });
        } else {
          await prisma.pray_requests.update({
            where: { id: parseInt(prayer_id) },
            data: {
              title,
              description,
              is_approved: "0"
            }
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Prayer updated successfully'
    });

  } catch (error) {
    console.error('Edit Prayer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


exports.deletePrayer = async (req, res) => {
  const { prayer_id } = req.body;
  const user = req.user; // assuming JWT auth middleware sets this

  if (!prayer_id) {
    return res.status(200).json({ error: { prayer_id: ['The prayer_id field is required.'] } });
  }

  try {
    let testimony = 0;

    // Step 1: Check if prayer exists and is not deleted
    const existingPrayer = await prisma.pray_requests.findFirst({
      where: {
        id: parseInt(prayer_id),
        user_id: user.id,
        deleted_at: null
      }
    });

    if (!existingPrayer) {
      return res.status(200).json({
        success: true,
        is_testimony: testimony,
        message: 'Already Deleted'
      });
    }

    // Step 2: Check approval status
    const unapprovedPrayer = await prisma.pray_requests.findFirst({
      where: {
        id: parseInt(prayer_id),
        user_id: user.id,
        is_approved: null
      }
    });

    const currentDateTime = new Date();

    if (unapprovedPrayer) {
      await prisma.pray_requests.update({
        where: { id: parseInt(prayer_id) },
        data: { deleted_at: currentDateTime }
      });

      return res.status(200).json({
        success: true,
        is_testimony: testimony,
        message: 'Successfully Deleted'
      });
    } else {
      // Check for testimony
      const existingTestimony = await prisma.testimonies.findFirst({
        where: {
          prayer_id: parseInt(prayer_id),
          deleted_at: null
        }
      });

      if (existingTestimony) {
        testimony = 1;

        await prisma.testimonies.updateMany({
          where: { prayer_id: parseInt(prayer_id) },
          data: { deleted_at: currentDateTime }
        });
      }

      await prisma.pray_requests.update({
        where: { id: parseInt(prayer_id) },
        data: { deleted_at: currentDateTime }
      });

      return res.status(200).json({
        success: true,
        is_testimony: testimony,
        message: 'Successfully Deleted'
      });
    }
  } catch (error) {
    console.error('Delete Prayer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something Went wrong'
    });
  }
};



exports.prayClicked = async (req, res) => {
  const { prayer_id } = req.body;

  // Basic validation
  if (!prayer_id || isNaN(prayer_id)) {
    return res.status(200).json({
      error: {
        prayer_id: ['The prayer_id field is required and must be an integer.']
      }
    });
  }

  try {
    // Check if prayer exists and is not deleted
    const prayer = await prisma.pray_requests.findFirst({
      where: {
        id: parseInt(prayer_id),
        deleted_at: null
      }
    });

    if (!prayer) {
      return res.status(200).json({
        success: false,
        message: 'Prayer does not exist'
      });
    }

    // Update is_clicked field to 1
    await prisma.pray_requests.update({
      where: {
        id: parseInt(prayer_id)
      },
      data: {
        is_clicked: 1
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Pray info updated'
    });

  } catch (error) {
    console.error('Error updating clicked status:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};




exports.newPrayerList = async (req, res) => {
  const userId = req.user.id;
  const orgId = req.user.org_id;

  const perPage = parseInt(req.query.perPage) || 5;
  const page = parseInt(req.query.page) || 1;
  const searchTerm = req.query.search || null;

  let dateSearch = null;
  if (searchTerm) {
    const parsedDate = moment(searchTerm, 'YYYY-MM-DD', true);
    if (parsedDate.isValid()) {
      dateSearch = parsedDate.format('YYYY-MM-DD');
    }
  }

  try {
    const offset = (page - 1) * perPage;

    // Main prayer list
    const prayers = await prisma.pray_requests.findMany({
      where: {
        org_id: orgId,
        is_approved: "1",
        checked: 0,
        is_answerd: 0,
        deleted_at: null,
        ...(searchTerm && !dateSearch
          ? {
              user: {
                OR: [
                  { first_name: { contains: searchTerm } },
                  { last_name: { contains: searchTerm } },
                ],
              },
            }
          : {}),
      },
      skip: offset,
      take: perPage,
      orderBy: {
        created_at: 'desc',
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
          select: {
            id: true,
            name: true,
          },
        },
        app_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        pray_requests_data: {
          where: {
            user_id: userId,
            reaction_type: 1,
          },
          take: 1,
        },
        
        prayer_comments: {
          where: {
            parent_id: null,
            deleted_at: null,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
    });

    // Count total for pagination
    const totalItems = await prisma.pray_requests.count({
      where: {
        org_id: orgId,
        is_approved: "1",
        checked: 0,
        is_answerd: 0,
        deleted_at: null,
        ...(searchTerm && !dateSearch
          ? {
              user: {
                OR: [
                  { first_name: { contains: searchTerm } },
                  { last_name: { contains: searchTerm } },
                ],
              },
            }
          : {}),
      },
    });

    // Format response
const formatted = await Promise.all(
  prayers.map(async (p) => {
    const total_prayed_count = await prisma.pray_requests_data.count({
      where: { prayer_id: p.id, reaction_type: 1 },
    });

    const last_prayed = await prisma.pray_requests_data.findFirst({
      where: { prayer_id: p.id },
      orderBy: { created_at: 'desc' },
      select: { created_at: true },
    });

    const total_reactions_count = await prisma.pray_requests_data.count({
      where: { prayer_id: p.id, reaction_type: { not: 1 } },
    });

    const is_pinned = await prisma.pinned_prayer_requests.findFirst({
      where: { user_id: userId, prayer_id: Number(p.id) },
    });



    const isReacted = await prisma.pray_requests_data.findFirst({
      where: {
        user_id: userId,
        prayer_id: p.id,
        reaction_type: {
          not: 1,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const userReactions = await prisma.pray_requests_data.findMany({
      where: {
        prayer_id: p.id,
        reaction_type: {
          not: 1,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return {
      id: p.id,
      title: p.title,
      message: p.description,
      date: moment(p.created_at).format('YYYY-MM-DD HH:mm:ss'),
      is_approved: p.is_approved,
      importance: p.importance,
      user_id: p.user_id,
      category_id: p.category_id,
      latest_comments: p.prayer_comments[0]?.comment || null,
      latest_comment_id: p.prayer_comments[0]?.id || null,
      latest_comment_created_at: p.prayer_comments[0]?.created_at || null,
      total_comments: p.prayer_comments.length,
      total_prayed_count,
      last_prayed_date: last_prayed?.created_at || null,
      total_reactions_count,
      is_pinned: is_pinned ? 1 : 0,
      category: p.categories,
      userdetails:p.app_users,
      is_prayed: p.pray_requests_data[0] || null,
      is_reacted: isReacted,
      user_reactions:userReactions,
      latest_comment: p.prayer_comments[0] || null,
    };
  })
);


    return res.status(200).json({
      success: true,
      message: 'Prayer request data',
      data: convertBigInt(formatted),
      pagination: {
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / perPage),
        current_page: page,
        per_page: perPage,
      },
    });
  } catch (err) {
    console.error('Error fetching new prayer list:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.addPinPrayer = async (req, res) => {

  const { prayer_id } = req.body;

  // Validate input
  if (!prayer_id) {
    return res.status(400).json({ error: { prayer_id: ['The prayer_id field is required.'] } });
  }

  try {
    // Get authenticated user from decoded JWT
    const user = req.user; // Ensure this is set via auth middleware
    const userId = user.id;
    const orgId = user.org_id;

    // Check if the prayer is already pinned by this user
    const existingPin = await prisma.pinned_prayer_requests.findFirst({
      where: {
        user_id: userId,
        prayer_id: prayer_id,
      },
    });

    if (existingPin) {
      // If exists, unpin (delete the record)
      await prisma.pinned_prayer_requests.deleteMany({
        where: {
          user_id: userId,
          prayer_id: prayer_id,
        },
      });

      return res.status(200).json({ message: 'Prayer request unpinned successfully' });
    }

    // Insert a new record in the pinned_prayer_requests table
    await prisma.pinned_prayer_requests.create({
      data: {
        user_id: userId,
        prayer_id: prayer_id,
        org_id: orgId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.status(201).json({ message: 'Prayer request pinned successfully' });

  } catch (error) {
    console.error('Error in addPinPrayer:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};


exports.reactionsDetails = async (req, res) => {


  const { prayer_id } = req.body;

  // Validate input
  if (!prayer_id) {
    return res.status(400).json({
      success: false,
      error: { prayer_id: ['The prayer_id field is required.'] },
    });
  }

  try {
    const reactionData = await prisma.$queryRaw`
      SELECT 
        prd.prayer_id,
        prd.reaction_type,
        COUNT(*) AS total,
        GROUP_CONCAT(CONCAT(au.first_name, ' ', au.last_name)) AS users,
        GROUP_CONCAT(au.profile_pic) AS profile_pics
      FROM pray_requests_data prd
      JOIN app_users au ON prd.user_id = au.id
      WHERE prd.prayer_id = ${prayer_id}
        AND prd.reaction_type != '1'
      GROUP BY prd.prayer_id, prd.reaction_type
    `;

    if (!reactionData || reactionData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reactions found for the given prayer ID.',
      });
    }

    return res.status(200).json({
      success: true,
      reactionsdata: convertBigInt(reactionData),
      message: 'Reaction details fetched successfully.',
    });

  } catch (error) {
    console.error('Error fetching reaction details:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

exports.myPinnedPrayers = async (req, res) => {

  try {
    const user = req.user; // assuming `req.user` contains decoded JWT with `id` and `org_id`

    if (!user?.id || !user?.org_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const pinnedPrayers = await prisma.$queryRaw`
      SELECT 
        au.first_name,
        au.last_name,
        pr.id AS prayer_request_id,
        pr.title,
        pr.description,
        pr.created_at,
        c.name AS category_name
      FROM pinned_prayer_requests ppr
      JOIN pray_requests pr ON ppr.prayer_id = pr.id
      JOIN categories c ON pr.category_id = c.id
      JOIN app_users au ON pr.user_id = au.id
      WHERE ppr.org_id = ${user.org_id}
        AND ppr.user_id = ${user.id}
    `;

    return res.status(200).json({
      success: true,
      message: 'Pinned Prayer List',
      data: convertBigInt(pinnedPrayers),
    });
  } catch (error) {
    console.error('Error fetching pinned prayers:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};



exports.aigeneratedprayerpoints = async (req, res) => {
  try {
    const user = req.user;

    if (!user?.id || !user?.org_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const prayerpoints = await prisma.$queryRaw`
      SELECT 
        * 
      FROM ai_generated_pp 
      WHERE deleted_at IS NULL
    `;

    return res.status(200).json({
      success: true,
      message: 'Prayer Points details',
      data: convertBigInt(prayerpoints),
    });
  } catch (error) {
    console.error('Error fetching AI generated prayer points:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};