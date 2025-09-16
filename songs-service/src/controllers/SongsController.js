const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');

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


exports.songsList = async (req, res) => {

  try {
    const orgId = req.user.org_id; // assuming JWT middleware sets req.user

    const songs = await prisma.songs.findMany({
      where: {
        org_id: orgId,
        status: 1,
      },
    });

    return res.status(200).json({
      success: true,
      data: convertBigInt(songs),
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



exports.newsongslist = async (req, res) => {
  const { language_id, page, sort, search = '', lyric_id } = req.body;

  // Validate input
  if (!language_id || !page || isNaN(page)) {
    return res.status(422).json({ error: 'language_id and page are required and page must be an integer' });
  }

  try {
    const orgId = req.user.org_id;



    // Fetch organization settings
    const settings = await prisma.settings.findFirst({
      where: { org_id: orgId },
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Get songbook PDFs if display setting includes PDFs
    let songbook = [];
    if (['Pdf', 'Both'].includes(settings.songs_display)) {
      songbook = await prisma.songs_pdf_files.findMany({
        where: {
          org_id: orgId,
          deleted_at: null,
        },
      });
    }

    // Calculate pagination
    const offset = (page - 1) * 30;
    let songs = [];

    // Determine lyric_id logic
    let lyricFilter = 0;
    if (language_id === 3) {
      lyricFilter = orgId === 1 ? 0 : 1;
    }

    // Only fetch songs if settings allow
    if (['Song', 'Both'].includes(settings.songs_display)) {

    const songs = await prisma.my_songs.findMany({
  skip: offset,
  take: 30,
  where: {
    org_id: orgId,
    songs: {
      status: 1,
      ...(language_id !== 0 && { language_id: parseInt(language_id) }),
      ...(search && {
        OR: [
          { title: { startsWith: search } },
          { eng_title: { startsWith: search } },
        ],
      }),
    },

    ...(search && !isNaN(search) && {
      song_number: parseInt(search),
    }),
  },
  orderBy: (() => {
    switch (sort) {
      case 'Song Number':
        return [{ song_number: 'asc' }];
      case 'Alphabetical':
        return [{ songs: { title: 'asc' } }];
      case 'Newest':
        return [{ id: 'desc' }];
      case 'Oldest':
        return [{ id: 'asc' }];
      default:
        return [{ song_number: 'asc' }];
    }
  })(),
  include: {
    songs: {
      select: {
        id: true,
        lyric_id: true,
        title: true,
        song: true,
        eng_title: true,
        eng_lyrics: true,
        author: true,
        status: true,
        language_id: true,
      },
    },
  },
});



      // Restructure the response to flatten `songs`
     var allsongs = songs.map((item) => ({
        id: item.songs.id,
        lyric_id: item.songs.lyric_id,
        title: item.songs.title,
        song: item.songs.song,
        eng_title: item.songs.eng_title,
        eng_lyrics: item.songs.eng_lyrics,
        author: item.songs.author,
        status: item.songs.status,
        song_id: item.song_number,
        language_id: item.songs.language_id,
      }));
    }

    return res.json({
      success: true,
      displayoption: settings.songs_display,
      data: convertBigInt(allsongs),
      songbook,
    });
  } catch (error) {
    console.error('Error in newsongslist:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


exports.songDetails = async (req, res) => {

  const { language_id, song_id, lyric_id, request_type } = req.body;

  // Validate input
  if (!language_id || !song_id || lyric_id === undefined) {
    return res.status(200).json({ error: 'language_id, song_id and lyric_id are required.' });
  }

  try {
    // Assuming user is set in middleware and available as req.user
    const user = req.user;

    // Build base query using Prisma
    let whereClause = {
      org_id: user.org_id,
      songs: {
        language_id: Number(language_id),
        status: 1,
      },
    };

    // Handle language_id and lyric_id conditions
    if (language_id == 2 || language_id == 3) {
      if (lyric_id == 1) {
        if (user.org_id != 1 && language_id == 3 && lyric_id == 0) {
          whereClause.songs.lyric_id = Number(lyric_id);
        } else {
          whereClause.songs.lyric_id = Number(lyric_id);
        }
      } else {
        if (user.org_id != 1 && language_id == 3 && lyric_id == 0) {
          whereClause.songs.eng_lyrics = {
            not: '',
          };
        }
      }
    }

    // Add song_number filter or ordering
    let orderBy = undefined;
    if (request_type === 'first') {
      orderBy = { song_number: 'asc' };
    } else if (request_type === 'last') {
      orderBy = { song_number: 'desc' };
    } else {
      whereClause.song_number = Number(song_id);
    }

    const song = await prisma.my_songs.findFirst({
      where: whereClause,
      orderBy: orderBy ? orderBy : undefined,
      include: {
        songs: {
          select: {
            id: true,
            lyric_id: true,
            title: true,
            eng_title: true,
            eng_lyrics: true,
            song: true,
            author: true,
            status: true,
            language_id: true,
          },
        },
      },
    });

    if (song) {
      const songDetails = {
        ...song.songs,
        song_id: song.song_number,
      };

      return res.json({
        success: true,
        data: convertBigInt(songDetails),
      });
    } else {
      return res.json({
        success: false,
        message: 'No songs found',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};




exports.songLyrics = [
  // Validation middleware
  body('song_id').notEmpty().withMessage('song_id is required'),
  body('lyric_id').notEmpty().withMessage('lyric_id is required'),
  body('language_id').notEmpty().withMessage('language_id is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ error: errors.mapped() });
    }

    const { song_id, lyric_id, language_id } = req.body;

    try {
      // Fetch the song with its related song data
      const songLyricDetails = await prisma.my_songs.findFirst({
        where: { sid: BigInt(song_id) },
        include: {
          songs: true,
        },
      });

      if (!songLyricDetails || !songLyricDetails.songs) {
        return res.status(200).json({
          success: false,
          data: 'No songs found',
        });
      }

      const song = songLyricDetails.songs;
      let responseData = {};

      if (parseInt(lyric_id) === 1) {
        responseData = {
          author: song.author,
          language_id: song.language_id,
          lyric_id: 1,
          song: song.song,
          song_id: songLyricDetails.song_number,
          id: song.id,
          title: song.title,
          eng_lyrics: song.eng_lyrics,
          eng_title: song.eng_title,
        };
      } else {
        if (song.eng_title && song.eng_title.trim() !== '') {
          responseData = {
            author: song.author,
            language_id: song.language_id,
            lyric_id: 0,
            song: song.eng_lyrics,
            song_id: songLyricDetails.song_number,
            title: song.eng_title,
            eng_lyrics: song.song,
            eng_title: song.title,
            id: song.id,
          };
        } else {
          return res.status(200).json({
            success: false,
            data: 'No Lyrics found',
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: convertBigInt(responseData),
      });
    } catch (error) {
      console.error('Error fetching song lyrics:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
];



exports.songArrows = async (req, res) => {

  const { song_id, language_id, lyric_id } = req.body;

  // Input validation
  if (!song_id || !language_id || !lyric_id) {
    return res.status(200).json({ error: 'song_id, language_id, and lyric_id are required' });
  }

  try {
    // Find the song matching the request
    const song = await prisma.songs.findFirst({
      where: {
        song_id: Number(song_id),
        lyric_id: Number(lyric_id),
        language_id: Number(language_id),
        status: 1,
      },
    });

    if (!song) {
      return res.status(200).json({
        success: false,
        data: 'no songs found',
      });
    }

    // Check for previous song
    const prevCount = await prisma.songs.count({
      where: {
        id: { lt: song.id },
        lyric_id: Number(lyric_id),
        language_id: Number(language_id),
        status: 1,
      },
    });

    // Check for next song
    const nextCount = await prisma.songs.count({
      where: {
        id: { gt: song.id },
        lyric_id: Number(lyric_id),
        language_id: Number(language_id),
        status: 1,
      },
    });

    return res.status(200).json({
      success: true,
      prev: prevCount > 0 ? 1 : 0,
      next: nextCount > 0 ? 1 : 0,
    });

  } catch (error) {
    console.error('Error in songArrows:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



exports.songLyricDetails = async (req, res) => {
  const { song_id, lyric_id } = req.body;

  // Validation
  if (!song_id) {
    return res.status(200).json({ error: { song_id: ['The song_id field is required.'] } });
  }

  try {
    const songRecord = await prisma.songs.findUnique({
      where: {
        id: parseInt(song_id),
      },
    });

    if (!songRecord) {
      return res.status(200).json({
        success: 'false',
        message: 'Song lyrics are not found',
      });
    }

    let songText;

    // Language-specific logic
    if ([2, 3].includes(songRecord.language_id)) {
      if (lyric_id === '0') {
        songText = songRecord.eng_lyrics;
      } else {
        songText = songRecord.song;
      }
    } else {
      songText = songRecord.song;
    }

    // Grouping lyrics
    const lines = songText.split(/\r?\n/).map(line => line.trim());

    const groupedLines = [];
    let currentGroup = [];

    for (const line of lines) {
      if (line === '') {
        if (currentGroup.length > 0) {
          groupedLines.push(currentGroup);
          currentGroup = [];
        }
      } else {
        currentGroup.push(line);
      }
    }

    // Add remaining group
    if (currentGroup.length > 0) {
      groupedLines.push(currentGroup);
    }

    return res.status(200).json({
      success: 'true',
      message: 'Song Lyrics',
      data: groupedLines,
    });
  } catch (error) {
    console.error('Error fetching song lyrics:', error);
    return res.status(500).json({
      success: 'false',
      message: 'Something went wrong',
    });
  }
};

exports.adddefaultsongstitle = async (req, res) => {

  try {
    // Get all songs where org_id is null
    const songs = await prisma.songs.findMany({
      where: {
        org_id: null,
      },
    });

    // Loop through each song and update the english_title
    const updatePromises = songs.map(song => {
      const englishLyric = song.eng_lyrics?.substring(0, 20) || '';

      return prisma.songs.update({
        where: { id: song.id },
        data: { eng_title: englishLyric },
      });
    });

    // Await all updates
    await Promise.all(updatePromises);

    // Return response
    return res.status(200).json({
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error updating default song titles:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating song titles.',
    });
  }
}

