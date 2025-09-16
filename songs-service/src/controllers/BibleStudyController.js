// GET /api/bible-studies

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



exports.biblestudylist = async (req, res) => {

  const { search = '', page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const studies = await prisma.bible_study.findMany({
      where: {
        org_id: req.user.org_id,
        status: "1",
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: { id: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const totalCount = await prisma.bible_study.count({
      where: {
        org_id: req.user.org_id,
        status: "1",
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return res.json({
      success: true,
      message: 'Bible study info',
      data: {
        items: studies,
        total: totalCount,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}


exports.biblestudyview = async (req, res) => {

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: { id: ['The id field is required.'] } });
  }

  try {
    await prisma.biblestudy_views.create({
      data: {
        user_id: req.user.id,
        biblestudy_id: id,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to save view' });
  }
}

exports.searchbiblestudy = async (req, res) => {


  const { search } = req.body;

  if (!search) {
    return res.status(400).json({ error: { search: ['The search field is required.'] } });
  }

  try {
    const results = await prisma.bible_study.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { speaker: { contains: search, mode: 'insensitive' } },
          { date: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
}
