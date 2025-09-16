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

exports.profile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const userDetails = await prisma.app_users.findFirst({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        origanisation: {
          select: {
            id: true,
            org_name: true,
            logo: true,
            short_code: true,
          },
        },
        languages: {
          select: {
            id: true,
            language: true,
          },
        },
        family_details: true,
      },
    });

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const weblink = `${req.protocol}://${req.get('host')}/appuserregistration/${userDetails.origanisation.short_code}`;

    return res.status(200).json({
      success: true,
      message: 'user profile',
      data: convertBigInt(userDetails),
      weblink,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

exports.deleteAcc = async (req, res) => {
  try {
    const userId = req.user?.id;
    const reason = req.body.reason;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const findDetails = await prisma.app_users.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!findDetails) {
      return res.status(200).json({
        success: false,
        message: 'Details Not Found',
      });
    }

    await prisma.app_users.update({
      where: { id: userId },
      data: {
        deleted_at: new Date(),
        delete_reason: reason,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};





exports.profileupdate = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orgId = req.user?.org_id;

    const {
      fname,
      lname,
      gender,
      phone_number,
      baptized,
      date_of_birth,
      marital_status,
      address,
    } = req.body;

    // Basic validation
    if (!fname || !lname || !address) {
      return res.status(200).json({
        error: {
          fname: !fname ? 'First name is required' : undefined,
          lname: !lname ? 'Last name is required' : undefined,
          address: !address ? 'Address is required' : undefined,
        },
      });
    }

    // Fetch existing user
    const user = await prisma.app_users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profilePicUrl = user.profile_pic;

    // Handle profile picture upload
    if (req.file) {
      const uploadDir = path.join(__dirname, `../public/organizations/${orgId}/images`);
      const oldFilePath = user.profile_pic
        ? path.join(__dirname, `../public/${new URL(user.profile_pic).pathname}`)
        : null;

      // Delete old file
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Move new file
      const newFileName = `${fname}_${Date.now()}${path.extname(req.file.originalname)}`;
      const newFilePath = path.join(uploadDir, newFileName);

      // Ensure directory exists
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(newFilePath, req.file.buffer);

      // Generate public URL
      profilePicUrl = `${req.protocol}://${req.get('host')}/public/organizations/${orgId}/images/${newFileName}`;
    }

    // Handle invalid date format
    const dob = date_of_birth && date_of_birth !== '--' ? new Date(date_of_birth) : null;

    // Update user profile
    await prisma.app_users.update({
      where: { id: userId },
      data: {
        first_name: fname,
        last_name: lname,
        gender,
        phone: phone_number,
        baptized,
        date_of_birth: dob,
        marital_status,
        address,
        profile_pic: profilePicUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


exports.iosProfileUpdate = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orgId = req.user?.org_id;

    console.log('Request body:', req.body);

    const {
      fname,
      lname,
    } = req.body;

    // Basic validation
    if (!fname || !lname) {
      return res.status(200).json({
        error: {
          fname: !fname ? 'First name is required' : undefined,
          lname: !lname ? 'Last name is required' : undefined,
        },
      });
    }

    // Fetch existing user
    const user = await prisma.app_users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profilePicUrl = user.profile_pic;

    // Handle profile picture upload
    if (req.file) {
      const uploadDir = path.join(__dirname, `../public/organizations/${orgId}/images`);
      const oldFilePath = user.profile_pic
        ? path.join(__dirname, `../public/${new URL(user.profile_pic).pathname}`)
        : null;

      // Delete old file
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Move new file
      const newFileName = `${fname}_${Date.now()}${path.extname(req.file.originalname)}`;
      const newFilePath = path.join(uploadDir, newFileName);

      // Ensure directory exists
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(newFilePath, req.file.buffer);

      // Generate public URL
      profilePicUrl = `${req.protocol}://${req.get('host')}/public/organizations/${orgId}/images/${newFileName}`;
    }


    // Update user profile
    await prisma.app_users.update({
      where: { id: userId },
      data: {
        first_name: fname,
        last_name: lname,
        profile_pic: profilePicUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.getSettings = async (req, res) => {
  try {
    const orgId = req.user?.org_id;

    console.log('Organization ID:', orgId);

    if (!orgId) {
      return res.status(400).json({ success: false, message: 'Organization ID not found in token' });
    }

    const settings = await prisma.settings.findFirst({
      where: { org_id: orgId },
    });

    return res.json({
      success: true,
      settings: settings ? convertBigInt(settings) : null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// controllers/organisationController.js

exports.multiOrganisationList = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(200).json({
      error: { email: ['The email field is required.'] },
    });
  }

  try {
    // Get all org_ids for the user
    const userDetails = await prisma.app_users.findMany({
      where: { email },
      select: { org_id: true },
    });

    if (userDetails.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No organizations found for this email',
        data: [],
      });
    }

    // Map each org_id to organisation details
    const userOrgDetails = await Promise.all(
      userDetails.map(async (user) => {
        const org = await prisma.origanisation.findUnique({
          where: { id: user.org_id },
          select: { id: true, org_name: true, logo: true },
        });
        return org;
      })
    );

    return res.status(200).json({
      success: true,
      message: 'User Multi Organisation List',
      data: convertBigInt(userOrgDetails.filter(Boolean)), // Filter out any nulls
    });
  } catch (error) {
    console.error('multiOrganisationList error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.checkShiftOrganisation = async (req, res) => {
  const { email, org_id } = req.body;

  // Basic validation
  const errors = {};
  if (!email) errors.email = ['The email field is required.'];
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = ['The email must be a valid email address.'];

  if (!org_id) errors.org_id = ['The org_id field is required.'];

  if (Object.keys(errors).length > 0) {
    return res.status(200).json({ error: errors });
  }

  try {
    const userDetails = await prisma.app_users.findMany({
      where: { email, org_id: Number(org_id) },
    });

    const userExists = userDetails.length > 0;

    return res.status(200).json({
      success: true,
      user_status: userExists,
      message: userExists
        ? 'User Already Existed in this Organisation'
        : 'User Not Found',
    });
  } catch (error) {
    console.error('checkShiftOrganisation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.updateDeviceKey = async (req, res) => {
  const userId = req.user?.id;
  const { device_key } = req.body;

  if (!device_key) {
    return res.status(400).json({
      success: false,
      message: 'Device key is required',
    });
  }

  try {
    await prisma.app_users.update({
      where: { id: userId },
      data: { device_key },
    });

    return res.status(200).json({
      success: true,
      message: 'Device Key Updated successfully',
    });
  } catch (error) {
    console.error('Update Device Key Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


exports.changePassword = async (req, res) => {

  const { old_password, new_password, is_sociallogin } = req.body;

  // Check for authenticated user
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }




  // Validation
  if (is_sociallogin === '0') {
    if (!old_password || !new_password) {
      return res.status(200).json({
        error: { message: 'Old and new passwords are required.' },
      });
    }
  } else {
    if (!new_password) {
      return res.status(200).json({
        error: { message: 'New password is required.' },
      });
    }
  }

  try {
    const user = await prisma.app_users.findUnique({
      where: { id: req.user.id },
    });

    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('old_password ID:', old_password);


    const currentPassword = user.password.replace(/^\$2y\$/, '$2a$');


    // For normal login: check old password
    if (is_sociallogin === '0') {
      const isMatch = await bcrypt.compare(old_password, currentPassword);
      if (!isMatch) {
        return res.status(200).json({ success: false, message: 'Old password not matched' });
      }
    }

    // Update password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await prisma.app_users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: 'New password updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};



exports.submitFeedback = async (req, res) => {
  const { rating, feedback } = req.body;

  if (!feedback) {
    return res.status(200).json({
      error: { feedback: ['Feedback is required.'] },
    });
  }

  try {
    const newFeedback = await prisma.feedback.create({
      data: {
        rating: rating ? rating : null,
        feedback,
        user_id: req.user.id,
        org_id: req.user.org_id,
        created_at: new Date()
      },
    });

    return res.json({
      success: true,
      message: 'Feedback inserted',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


exports.getYoutubeChannel = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.org_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch Sunday worships for the user's organization
    const sundayWorship = await prisma.sundayworships.findMany({
      where: {
        org_id: req.user.org_id,
        status: "1",
      },
      orderBy: {
        id: 'desc',
      },
    });

    // YouTube channel config
    const channels = {
      // API_KEY: 'AIzaSyAHvu54QASmtALuCRlWymBbmib9dIlcS9o', // Santhoshi Token
      API_KEY: 'AIzaSyC9jQd8c5U2YAQ3ArYz0Ou5Qtv2J11A6mg', // Kiran Token
      // API_KEY: 'AIzaSyBDyTC60vOTrF3YPoB5A1hiEgDAglWYo-M', // Rani Token
      // API_KEY: 'AIzaSyBVT1b7OhAtEBC6EllrjYxjfZ1xrEcZpOw', // Madhu Token
      CHANNEL_ID: 'UC95gv6060JrRN45cMU7VGwg',
    };

    return res.json({
      success: true,
      data: channels,
      sundayWorship:convertBigInt(sundayWorship),
    });
  } catch (error) {
    console.error('getYoutubeChannel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};



exports.getMinistries = async (req, res) => {
  try {
    // Make sure user is authenticated
    if (!req.user || !req.user.org_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const ministries = await prisma.ministries.findMany({
      where: {
        org_id: req.user.org_id,
        deleted_at: null,
      },
    });

    return res.json({
      success: true,
      ministries: convertBigInt(ministries),
    });

  } catch (error) {
    console.error('Error fetching ministries:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};




exports.addVolunteer = async (req, res) => {
  const { category_id } = req.body;

  if (!category_id) {
    return res.status(200).json({ error: { category_id: ['Category is required.'] } });
  }

  try {
    const userId = req.user.id;
    const orgId = req.user.org_id;

    // Insert into Volunteer
    const newVolunteer = await prisma.volunteers.create({
      data: {
        user_id: userId,
        ministry_id: category_id,
        org_id: orgId,
        status: 'Pending',
        created_at: new Date(),
      },
    });

    // Update Appuser
    const updatedUser = await prisma.app_users.update({
      where: { id: userId },
      data: {
        ministry: category_id,
        ministry_status: 'Pending',
      },
    });

    // Get ministry and admin
    const ministry = await prisma.ministries.findUnique({ where: { id: category_id } });
    const admin = await prisma.app_users.findFirst({
      where: { org_id: orgId, role: 2 },
    });

     const user = await prisma.app_users.findFirst({
      where: { id: userId },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const userData = {
      user_name: user.first_name + ' ' + user.last_name,
      admin_name: admin.first_name+ ' ' + admin.last_name,
      volunteer_name: ministry?.name || 'Unknown',
    };

await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: 'inakotisanthoshi@gmail.com',
        subject: 'New Volunteer Added',
        html: generateAddVolunteerEmail(userData)
      });
    // Send mail to admin
  //  await sendMail(admin.email, 'New Volunteer Added', generateAddVolunteerEmail(userData));

    return res.json({ success: true, message: 'Volunteer Added Successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};


exports.removeVolunteer = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.org_id;

    const user = await prisma.app_users.findUnique({ where: { id: userId } });

    if (!user || !user.ministry) {
      return res.status(404).json({ success: false, message: 'User or ministry not found' });
    }

    const ministry = await prisma.ministries.findUnique({ where: { id: Number(user.ministry) } });

    const admin = await prisma.app_users.findFirst({
      where: { org_id: orgId, role: 2 },
    });


    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const userData = {
      user_name: user.first_name + ' ' + user.last_name,
      admin_name: admin.first_name,
      volunteer_name: ministry?.name || 'Unknown',
    };

    // Update user to remove ministry
    await prisma.app_users.update({
      where: { id: userId },
      data: {
        ministry: 0,
        ministry_status: 'Pending',
      },
    });


    await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: 'inakotisanthoshi@gmail.com',
        subject: 'Volunteer Removed',
        html: generateRemoveVolunteerEmail(userData)
      });


    return res.json({ success: true, message: 'Removed from volunteer successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

   



const generateAddVolunteerEmail = ({ user_name, admin_name, volunteer_name }) => `
  <p>Dear ${admin_name},</p>
  <p>${user_name} has joined as a volunteer for <strong>${volunteer_name}</strong>.</p>
`;

const generateRemoveVolunteerEmail = ({ user_name, admin_name, volunteer_name }) => `
  <p>Dear ${admin_name},</p>
  <p>${user_name} has been removed from volunteering for <strong>${volunteer_name}</strong>.</p>
`;



exports.getDailyDevotions = async (req, res) => {
  try {
    let postData = [];
   const { date: dateParam, from } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const date = dateParam ? new Date(dateParam).toISOString().split('T')[0] : today;

    if (date <= today) {
      if (from !== 'wordpress' && req.user) {
        const settings = await prisma.settings.findFirst({
          where: { org_id: req.user.org_id },
          orderBy: { id: 'desc' },
        });

        if (settings?.hdailydevotiondefault === 'no') {
          postData[0] = await fetchOrgDevotion(date, from);
        }
      }

      if (postData.length === 0) {
        if (date === today) {
          const response = await axios.get(
            'https://kumarakrupa.blog/wp-json/custom/v1/appdailydevotion'
          );
          const posts = response.data;

          if (posts && posts.length > 0) {
            const devotion = await cleanContent(posts[0].devotion);
            postData[0] = await formatPostData(posts[0], devotion, from);
            await storeDevotionIfNotExists(posts[0]);
          }
        } else {
          postData[0] =
            date < '2024-04-12'
              ? await fetchLegacyDevotion(date, from)
              : await fetchStoredDevotion(date, from);
        }
      }
    }

    return res.status(202).json({ success: true, data: postData });
  } catch (error) {
    console.error('Daily Devotion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

async function storeDevotionIfNotExists(post) {
  const existing = await prisma.daily_devotions.findFirst({
    where: {
      date: post.date,
    },
  });

  if (!existing) {
    await prisma.daily_devotions.create({
      data: {
        date: post.date,
        title: post.title || '',
        devotion: post.devotion || '',
      },
    });
  }
}

function cleanContent(content) {
  const search = [
    '<!-- wp:paragraph -->', '<!-- /wp:paragraph -->', '\n', '<p>', '</p>', '&nbsp;',
    '<strong>', '</strong>', "\n\n", '<br>'
  ];
  const replace = ['', '', '\n', '', '', ' ', '', '', "\n", ''];
  return strReplaceMany(content, search, replace);
}

function strReplaceMany(str, search, replace) {
  return search.reduce((acc, s, i) => acc.split(s).join(replace[i]), str);
}

function formatPostData(post, devotion, from) {
  return {
    quote: post.quote,
    author: post.author,
    title: post.title,
    post_date: from === 'wordpress'
      ? new Date(post.post_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : post.post_date,
    devotion: from === 'wordpress' ? post.devotion : devotion,
  };
}

async function fetchLegacyDevotion(date, from) {
  const post = await prisma.wp_posts.findFirst({
    where: {
      post_date: new Date(date)
    }
  });

  if (!post) return [];

  const author = await prisma.wp_postmeta.findFirst({
    where: { post_id: post.ID, meta_key: 'author' }
  });

  const quote = await prisma.wp_postmeta.findFirst({
    where: { post_id: post.ID, meta_key: 'quote' }
  });

  return formatPostData({
    quote: quote?.meta_value || '',
    author: author?.meta_value || '',
    title: post.post_title,
    post_date: post.post_date,
    devotion: post.post_content
  }, cleanContent(post.post_content), from);
}

async function fetchStoredDevotion(date, from) {
  const post = await prisma.daily_devotions.findFirst({
    where: {
      post_date: new Date(date),
      org_id: 0
    }
  });

  if (!post) return [];

  return formatPostData({
    quote: post.quote,
    author: post.author,
    title: post.title,
    post_date: post.post_date,
    devotion: post.post_content
  }, cleanContent(post.post_content), from);
}


