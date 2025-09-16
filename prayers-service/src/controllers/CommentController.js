const { PrismaClient, sql  } = require('@prisma/client');
const prisma = new PrismaClient();

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



exports.commentList = async (req, res) => {
  const { prayer_id } = req.body;

  if (!prayer_id) {
    return res.status(422).json({
      success: false,
      error: { prayer_id: ['prayer_id is required'] },
    });
  }

  try {
    const comments = await prisma.prayer_comments.findMany({
      where: {
        prayer_id: prayer_id,
        deleted_at: null,
        parent_id: null,
      },
      select: {
        id: true,
        prayer_id: true,
        comment: true,
        created_at: true,
        app_users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_pic: true,
          },
        },
        other_prayer_comments: {
          where: { deleted_at: null },
          select: {
            id: true,
            comment: true,
            created_at: true,
            app_users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                profile_pic: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: convertBigInt(comments),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching comments.',
      error: error.message,
    });
  }
};


exports.addPrayerComment = async (req, res) => {
  const { prayer_id, comment, parent_id = null } = req.body;
  const user = req.user; // from JWT middleware

  if (!prayer_id || !comment) {
    return res.status(422).json({
      error: {
        prayer_id: !prayer_id ? ['prayer_id is required'] : undefined,
        comment: !comment ? ['comment is required'] : undefined,
      },
    });
  }

  try {
    await prisma.prayer_comments.create({
      data: {
        prayer_id,
        parent_id,
        comment,
        org_id: user.org_id,
        user_id: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully inserted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};


exports.editPrayerComment = async (req, res) => {
  const { comment_id, comment } = req.body;

  if (!comment_id || !comment) {
    return res.status(422).json({
      error: {
        comment_id: !comment_id ? ['comment_id is required'] : undefined,
        comment: !comment ? ['comment is required'] : undefined,
      },
    });
  }

  try {
    await prisma.prayer_comments.update({
      where: { id: comment_id },
      data: { comment },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully updated',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};


exports.deletePrayerComment = async (req, res) => {
  const { comment_id } = req.body;

  if (!comment_id) {
    return res.status(422).json({
      error: { comment_id: ['comment_id is required'] },
    });
  }

  try {
    await prisma.prayer_comments.update({
      where: { id: comment_id },
      data: { deleted_at: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
};
