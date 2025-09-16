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


// GET /api/worship?search=title&page=1
exports.worship = async (req, res) => {
  try {
    const { search = '', page = 1 } = req.query;
    const take = 5;
    const skip = (parseInt(page) - 1) * take;

    const [data, total] = await Promise.all([
      prisma.sundayworships.findMany({
        where: {
          org_id: req.user.org_id,
          status: "1",
          title: {
      contains: search || '',
      ...(search ? { mode: 'insensitive' } : {}) // only apply mode if searching
    },
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take,
      }),
      prisma.sundayworships.count({
        where: {
          org_id: req.user.org_id,
          status: "1",
          title: {
      contains: search || '',
      ...(search ? { mode: 'insensitive' } : {}) // only apply mode if searching
    },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
      message: 'Sunday worship info',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


// POST /api/worship/view { id: sundayworship_id }
exports.worshipview = async (req, res) => {
  try {
    const { id } = req.body;

    await prisma.sundayworship_views.create({
      data: {
        user_id: req.user.id,
        sundayworship_id: parseInt(id),
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};


exports.worshipsearch = async (req, res) => {
  const { search = '' } = req.body;

  if (!search.trim()) {
    return res.status(400).json({
      success: false,
      error: { search: ['Search field is required'] },
    });
  }

  try {
    const results = await prisma.sundayworships.findMany({
      where: {
        org_id: req.user.org_id,
        OR: [
          { title: { contains: search } },
          { service: { contains: search } },
          { description: { contains: search } },
          
        ],
      },
      take: 3,
    });

    return res.status(200).json({
      success: true,
      data: convertBigInt(results),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
