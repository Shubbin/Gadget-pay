const sharp = require('sharp');
const { query } = require('../config/db');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const file = req.files.image;
    
    // Compress with Sharp
    const compressedBuffer = await sharp(file.data)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Insert into DB
    const { rows } = await query(
      'INSERT INTO product_images (data, mime_type) VALUES ($1, $2) RETURNING id',
      [compressedBuffer, 'image/jpeg']
    );

    const imageId = rows[0].id;
    const publicUrl = `/api/upload/image/${imageId}`;

    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT data, mime_type FROM product_images WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const { data, mime_type } = rows[0];
    res.set('Content-Type', mime_type);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
