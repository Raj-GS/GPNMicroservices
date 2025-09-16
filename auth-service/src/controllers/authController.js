const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');
const transporter = require('../utils/mailTransport');
const axios = require('axios');
const {getOtpEmailTemplate}= require('../mails/otpTemplate');

exports.register = async (req, res) => {
  const { email, password, firstName, lastName, org_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, org_id },
    });
    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(400).json({ message: 'Registration error', error: error.message });
  }
};






exports.login = async (req, res) => {

  const { email, password } = req?.body;



  if (!email || !password) {
    return res.status(200).json({
      error: { message: 'Email and password are required.' }
    });
  }

  try {
    const user = await prisma.app_users.findFirst({
      where: { email },
      include: {
        origanisation: true,
        family_details: true
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Login credentials are invalid.' });
    }

    // Fix Laravel bcrypt prefix
    const hashedPassword = user.password.replace(/^\$2y\$/, '$2a$');
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Password is wrong.' });
    }

    const safeUser = {
      id: Number(user.id),
      org_id: Number(user.org_id),
      role: Number(user.role),
    };

    const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Superadmin flow
    if (user.role === 1n || user.role === 1) {
      const orgList = await prisma.origanisation.findMany({
        where: { status: 'active' },
        select: { id: true, org_name: true, logo: true }
      });

      return res.status(200).json({
        success: true,
        superadmin: 'yes',
        is_active: true,
        org_is_active: true,
        user_id: Number(user.id),
        multiorganinizationList: convertBigInt(orgList)
      });
    }

    // Normal user: check if organization is active
    const orgId = Number(user.org_id);
    const org = await prisma.origanisation.findUnique({
      where: { id: orgId }
    });


    if (!org || org.status !== 'active') {
      return res.status(200).json({
        success: true,
        message: 'Organization Deactivated',
        is_active: false,
        org_is_active: false,
        user: convertBigInt(user)
      });
    }

    // For volunteers/external users
    if (user.role === 4n || user.role === 4) {
      const orgUser = await prisma.organisation_user.findFirst({
        where: { user_id: user.id }
      });

      if (orgUser?.account_status === '0') {
        return res.status(200).json({
          success: true,
          message: 'Account Deactivated',
          is_active: false,
          org_is_active: true,
          user: convertBigInt(user)
        });
      }
    }

    // Default success
    return res.status(200).json({
      success: true,
      user: convertBigInt(user),
      token,
      is_active: true,
      org_is_active: true,
      superadmin: 'no'
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Could not create token.' });
  }
};

// Recursively convert all BigInt values to Number or String
function convertBigInt(obj) {
  if (typeof obj === 'bigint') {
    return Number(obj); // or use obj.toString() if IDs are too large
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


exports.multiorganizationlogin = async (req, res) => {


  await Promise.all([
    body('user_id').notEmpty().withMessage('user_id is required').run(req),
    body('org_id').notEmpty().withMessage('org_id is required').run(req),
    body('user_type').notEmpty().withMessage('user_type is required').run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: errors.array() });
  }

  const { user_id, org_id, user_type } = req.body;

  try {
    if (user_type === 'yes') {
      const orgUser = await prisma.organisation_user.findFirst({
        where: { user_id: Number(user_id), org_id: Number(org_id) }
      });

      await prisma.app_users.update({
        where: { id: Number(user_id) },
        data: { org_id: Number(org_id) }
      });

      const userDetails = await prisma.app_users.findUnique({
        where: { id: Number(user_id) },
        include: {
          origanisation: true,
          family_details: true
        }
      });

      const token = jwt.sign({ id: userDetails.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        user: convertBigInt(userDetails),
        token,
        is_active: true,
        org_is_active: true
      });
    } else {
      const orgUser = await prisma.organisation_user.findFirst({
        where: { user_id: Number(user_id), org_id: Number(org_id) }
      });

      if (orgUser) {
        await prisma.app_users.update({
          where: { id: Number(user_id) },
          data: { org_id: Number(org_id) }
        });

        const userDetails = await prisma.app_users.findUnique({
          where: { id: Number(user_id) },
          include: {
            origanisation: true,
            family_details: true
          }
        });



        if (userDetails.origanisation?.status === 2) {
          return res.json({
            success: true,
            message: 'Organization Deactivated',
            is_active: false,
            org_is_active: false,
            user: convertBigInt(userDetails),
          });
        }

        if (userDetails.deleted_at !== null) {
          return res.json({
            success: true,
            message: 'Account Deactivated',
            is_active: false,
            org_is_active: true,
            user: convertBigInt(userDetails),
          });
        }

        const token = jwt.sign({ id: userDetails.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
          success: true,
          user: convertBigInt(userDetails),
          token,
          is_active: true,
          org_is_active: true
        });
      } else {
        return res.json({
          success: false,
          user: 'User Not Existed'
        });
      }
    }
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not create token.'
    });
  }

}

exports.checkappversion = async (req, res) => {

  await body('app_version')
    .notEmpty()
    .withMessage('app_version is required')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: errors.array() });
  }

  try {
    const { app_version, deviceType } = req.body;


    // Define required version for each platform
    const requiredVersion = deviceType === 'ios' ? 1 : 9;

    if (parseInt(app_version) >= requiredVersion) {
      return res.status(200).json({
        success: false,
        message: 'App version is up to date',
        app_update: false,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'App version is not up to date',
        app_update: true,
      });
    }
  } catch (error) {
    console.error('Error in checkAppVersion:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid Details',
    });
  }

}



// Utility: Generate short code
function generateShortCode(name) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars[Math.floor(Math.random() * chars.length)];
  }
  const shuffledName = name.split('').sort(() => 0.5 - Math.random()).join('').substring(0, 4);
  return `${randomStr}-${shuffledName}`;
}

exports.addneworganisation = async (req, res) => {
  await Promise.all([
    body('org_name').notEmpty().run(req),
    body('contact_name').notEmpty().run(req),
    body('contact_email').isEmail().run(req),
    body('contact_number').isLength({ min: 10 }).run(req),
    body('admin_name').notEmpty().run(req),
    body('admin_email').isEmail().run(req),
    body('admin_number').isLength({ min: 10 }).run(req),
    body('admin_password').isLength({ min: 6 }).run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(200).json({ error: errors.array() });

  const {
    org_name,
    contact_name,
    contact_email,
    contact_number,
    admin_name,
    admin_email,
    admin_number,
    admin_password,
    address_country,
    country_code,
    dial_code,
    address,
    website,
    organisation_logo,
  } = req.body;

  try {
    // Check for existing phone/email
    const phoneExists = await prisma.origanisation.findFirst({ where: { phone: contact_number } });
    if (phoneExists) return res.json({ success: false, message: 'Phone Number Already Existed!' });

    const orgEmailExists = await prisma.origanisation.findFirst({ where: { email: contact_email } });
    if (orgEmailExists) return res.json({ success: false, message: 'You are already registered!' });

    const adminExists = await prisma.app_users.findFirst({ where: { email: admin_email } });
    if (adminExists) return res.json({ success: false, message: 'This admin already Existed!' });

    // Generate unique short code
    let shortCode = generateShortCode(org_name);
    while (await prisma.origanisation.findFirst({ where: { short_code: shortCode } })) {
      shortCode = generateShortCode(org_name);
    }

    // Create organisation
    const organisation = await prisma.origanisation.create({
      data: {
        org_name,
        contact_person_name: contact_name,
        email: contact_email,
        phone: contact_number,
        status: 'pending',
        country: country_code,
        country_code: address_country,
        dial_code,
        address,
        website,
        short_code: shortCode.replace(/\s/g, ''),
      },
    });

    const orgId = Number(organisation.id);

    // Handle logo upload
    if (organisation_logo) {
      const base64Data = organisation_logo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const folderPath = path.join(__dirname, '..', 'public', 'organizations', `${orgId}`, 'images');
      await fs.ensureDir(folderPath);

      const fileName = `${org_name.replace(/\s/g, '')}${Date.now()}.png`;
      const filePath = path.join(folderPath, fileName);
      fs.writeFileSync(filePath, buffer);

      const logoUrl = `${req.protocol}://${req.get('host')}/public/organizations/${orgId}/images/${fileName}`;

      await prisma.organisations.update({
        where: { id: orgId },
        data: { logo: logoUrl },
      });
    }

    // Add Notification
    await prisma.notification.create({
      data: {
        is_admin: 1,
        title: 'Organization Register',
        time: new Date().toLocaleTimeString(),
        content: `${org_name} Registered`,
        user_id: orgId,
        org_id: null,
        is_admin_read: false,
        module_id: orgId,
      },
    });

    // Add default settings
    await prisma.settings.create({
      data: {
        org_id: orgId,
        events: 'no',
        testimonies: 'no',
        messages: 'no',
        songs: 'no',
        hevents: 'yes',
        hworships: 'no',
        htestimonies: 'yes',
        hdailydevotion: 'yes',
        hchurchhistory: 'no',
      },
    });

    // Approval settings
    const approvalModules = ['prayer', 'testimony', 'backgroundVerification'];
    for (const module_name of approvalModules) {
      await prisma.approval_settings.create({
        data: {
          module_name,
          approval: 'yes',
          bv_status: 'no',
          org_id: orgId,
          bv_done:'no',
          bv_not_done:'no',
        },
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    const adminUser = await prisma.app_users.create({
      data: {
        first_name: admin_name,
        last_name: '',
        email: admin_email,
        password: hashedPassword,
        phone: admin_number,
        org_id: orgId,
        role: '2',
        verified_status:'Verified',
        is_staff_admin:"no",
        status:'Active'
      },
    });

    // Organisation user entry
    await prisma.organisation_user.create({
      data: {
        user_id: adminUser.id,
        org_id: orgId,
        isVerified: '1',
        account_status: '1',
        role: '2',
        active_request:'Accepted',
        account_status:'Accepted',
        isVerified : 1
      },
    });






    // Send email
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // await transporter.sendMail({
    //   to: admin_email,
    //   subject: 'Organization Registered',
    //   text: `Hi ${admin_name}, your organization ${org_name} is registered.`,
    // });

//     await transporter.sendMail({
//   from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
//   to: admin_email,
//   subject: 'Thank you for registering! We will get back to you shortly.',
//   html: getAdminWelcomeEmail(org_name)
// });

    // await transporter.sendMail({
    //   to: 'vijay.burton@gmail.com',
    //   subject: 'New Organization Registered',
    //   html:getSuperAdminEmail(org_name),
    // });



    // await transporter.sendMail({
    //   to: 'vijay.burton@gmail.com',
    //   subject: 'Confirmation: I Accepted Terms & Conditions and Faith Statement',
  //   html: getTermsAcceptedEmail({
//    user_name: org_name,
//    user_mail: contact_email,
 //   phone_number: contact_number
 // }),


    // });

    return res.json({
      success: true,
      message: 'You are registered Successfully!',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong!' });
  }
};

exports.searchedOrganisationsList = async (req, res) => {
  try {
 
    // Without filtering (as your current working Laravel code does)
    const organisations = await prisma.origanisation.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        org_name: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: convertBigInt(organisations),
    });

  } catch (error) {
    console.error('Error fetching organisations:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid Details',
    });
  }
};



exports.wdailydevotion = async (req, res) => {
  const { date: dateParam, from } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const date = dateParam ? new Date(dateParam).toISOString().split('T')[0] : today;

  try {
    let postData = [];

    if (date <= today) {
      if (date === today) {
        const response = await axios.get('http://kumarakrupa.blog/wp-json/custom/v1/appdailydevotion');
        const posts = response.data;
        const devotion = cleanContent(posts[0].devotion);

        postData[0] = formatPostData(posts[0], devotion, from);

        const exists = await prisma.daily_devotions.findFirst({
          where: {
            post_date: new Date(today),
            org_id: 0
          }
        });

        if (!exists) {
          await prisma.daily_devotions.create({
            data: {
              post_date: new Date(today),
              title: posts[0].title,
              post_content: removeZeroWidth(posts[0].devotion),
              author: posts[0].author,
              quote: posts[0].quote,
              org_id: 0
            }
          });
        }
      } else if (date < '2024-04-12') {
        postData[0] = await fetchLegacyDevotion(date, from);
      } else {
        postData[0] = await fetchStoredDevotion(date, from);
      }
    }

    return res.status(202).json({ success: true, data: postData });

  } catch (error) {
    console.error('Error in wdailydevotion:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// -- Helpers --

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

function removeZeroWidth(content) {
  return content.replace(/\u200B/g, '');
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


exports.forgotPassword= async (req, res) => {
  await body('is_set').notEmpty().isInt({ min: 1, max: 3 }).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(200).json({ error: errors.array() });

  const { is_set, email, otp, password } = req.body;

  if (is_set == 1) {
    await body('email').isEmail().run(req);
    if (!validationResult(req).isEmpty()) return res.status(200).json({ error: errors.array() });

    return await emailVerifyAndSendOtp(email, res);
  } else if (is_set == 2) {
    await Promise.all([body('email').isEmail().run(req), body('otp').notEmpty().run(req)]);
    if (!validationResult(req).isEmpty()) return res.status(200).json({ error: errors.array() });

    return await otpVerify(email, otp, res);
  } else if (is_set == 3) {
    await Promise.all([body('email').isEmail().run(req), body('password').isLength({ min: 6 }).run(req)]);
    if (!validationResult(req).isEmpty()) return res.status(200).json({ error: errors.array() });

    return await updatePassword(email, password, res);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid is_set value' });
  }
}

async function emailVerifyAndSendOtp(email, res) {
  try {
    const user = await prisma.app_users.findFirst({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();



    const existingRecord = await prisma.forgotpasswords.findFirst({
  where: { email: email },
});

if (existingRecord) {
  await prisma.forgotpasswords.update({
    where: { id: existingRecord.id },
    data: { otp },
  });
} else {
  await prisma.forgotpasswords.create({
    data: { email: email, otp },
  });
}



    try {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your Password Reset OTP',
        html: getOtpEmailTemplate(`${user.first_name || ''} ${user.last_name || ''}`, otp)
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Unable to send mail' });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

async function otpVerify(email, otp, res) {
  try {
    const record = await prisma.forgotpasswords.findFirst({ where: { email } });
    if (record && record.otp === otp) {
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(422).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

async function updatePassword(email, newPassword, res) {
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.appuser.update({ where: { email }, data: { password: hashed } });
    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}  

exports.activateAccountRequest = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(200).json({ error: { id: ['The id field is required.'] } });
  }

  try {
    const userDetails = await prisma.app_users.findUnique({ where: { id: parseInt(id) } });

    if (!userDetails) {
      return res.status(200).json({ success: false, message: 'User Not Found' });
    }

    if (userDetails.active_request === '1') {
      return res.status(200).json({
        success: true,
        message: 'Already Requested',
        request_status: '1',
      });
    }

    await prisma.app_users.update({
      where: { id: parseInt(id) },
      data: { active_request: 'requested' },
    });

    const adminDetails = await prisma.app_users.findFirst({
      where: {
        org_id: userDetails.org_id,
        role: '2',
      },
    });

    const userData = {
      user_name: `${userDetails.first_name} ${userDetails.last_name}`,
      admin_name: `${adminDetails.first_name} ${adminDetails.last_name}`,
    };

    // Send mail to admin
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: adminDetails.email,
      subject: 'Activate Account Request',
      html: `<p>User <strong>${userData.user_name}</strong> has requested account activation.</p>`,
    });

    return res.status(200).json({
      success: true,
      message: 'Request sent Successfully',
      request_status: '0',
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: 'Invalid Details',
    });
  }
};
exports.checkAppUserExistOrNot = async (req, res) => {
  const { email, org_id } = req.body;

  try {
    const userDetails = await prisma.app_users.findFirst({ where: { email } });

    if (!userDetails) {
      return res.status(200).json({
        success: false,
        message: 'This User not Existed!',
      });
    }

    const currentOrgDetails = await prisma.organisation_user.findFirst({
      where: {
        user_id: userDetails.id,
        org_id: parseInt(org_id),
      },
    });

    if (currentOrgDetails) {
      return res.status(200).json({
        success: true,
        current_org: true,
        message: 'This User Already Existed!',
      });
    }

    return res.status(200).json({
      success: true,
      current_org: false,
      message: 'This User Already Existed!',
      data: convertBigInt(userDetails),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

exports.deleteDbUser = async (req, res) => {
  try {
    const deleted = await prisma.users.delete({
      where: { id: 3 },
    });

    return res.send('I am deleted');
  } catch (err) {
    return res.send('I am not deleted');
  }
};


const getAdminWelcomeEmail = (org_name) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Glocal Prayer Network</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            max-width: 200px;
            height: auto;
        }
        h1 {
            color: #4a4a4a;
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 15px;
        }
        ul {
            padding-left: 20px;
        }
        .signature {
            margin-top: 20px;
            font-style: italic;
        }
        a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://glocalprayer.net/prayer/public/assets/img/glocal-prayer-logo.png" alt="Glocal Prayer Network Logo">
        </div>
        
        <h1>Welcome to Glocal Prayer Network</h1>
        
        <p>Dear ${org_name},</p>
        
        <p>Thank you for your interest in joining the Glocal Prayer Network (<a href="https://glocalprayer.net/" target="_blank">www.glocalprayer.net</a>).</p>        
        <p>We appreciate you choosing our platform for your prayer and other spiritual activities. Our goal is to provide a meaningful and enriching experience for all our members.</p>
        
        <p>Here's what you can expect next:</p>
        <ul>
            <li>Your registration is currently being processed.</li>
            <li>Once approved, you'll receive a confirmation email with further instructions.</li>
            <li>You'll then have full access to our platform and its features.</li>
        </ul>
        
        <p>We hope you'll find our platform valuable and consider recommending it to others in your community.</p>
        
        <p>Blessings,</p>
        
        <div class="signature">
            <p>The GPN Team</p>
        </div>
    </div>
</body>
</html>
`;


const getSuperAdminEmail = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Organization Added</title>
  <style>
    body {
      font-family: Tahoma, Arial, sans-serif;
      font-size: 18px;
      color: #333;
      background-color: #f8f8f8;
      margin: 0;
      padding: 40px 16px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background-color: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 0 10px rgba(0,0,0,0.05);
    }
    p {
      color: #565a5c;
      font-size: 18px;
      line-height: 1.6;
    }
    a {
      color: #007BFF;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>The new organization <strong>${data.name}</strong> has been added.</p>
    <p>Please verify the details by following this link:</p>
    <p><strong>URL:</strong> <a href="https://glocalprayer.net/prayer/login" target="_blank">https://glocalprayer.net/prayer/login</a></p>
  </div>
</body>
</html>
`;


const getTermsAcceptedEmail = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Terms & Conditions Accepted</title>
  <style>
    body {
      font-family: Tahoma, Arial, sans-serif;
      font-size: 18px;
      color: #565a5c;
      background-color: #f8f8f8;
      margin: 0;
      padding: 40px 16px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background-color: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 0 10px rgba(0,0,0,0.05);
    }
    p {
      margin: 16px 0;
      line-height: 1.6;
    }
    .footer-info p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear Glocal Prayer Team,</p>
    
    <p>
      I wanted to inform you that I have accepted the Terms & Conditions and the Statement of Faith on our platform.
      I am committed to adhering to these guidelines and ensuring a positive experience for all users.
    </p>

    <p>
      Please don't hesitate to reach out if you have any questions or need further clarification.
    </p>

    <p>Thank you for your attention to this matter.</p>

    <p>Best regards,</p>

    <div class="footer-info">
      <p><strong>${data.user_name}</strong></p>
      <p>${data.user_mail}</p>
      <p>${data.phone_number}</p>
    </div>
  </div>
</body>
</html>
`;
