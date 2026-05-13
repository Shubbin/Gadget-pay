const sharp = require('sharp');
const supabase = require('../config/supabase');

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

    // Insert into Supabase
    const { data, error } = await supabase
      .from('product_images')
      .insert([{ data: compressedBuffer.toString('base64'), mime_type: 'image/jpeg' }])
      .select('id')
      .single();

    if (error) throw error;

    const publicUrl = `/api/upload/image/${data.id}`;
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('product_images')
      .select('data, mime_type')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageBuffer = Buffer.from(data.data, 'base64');
    res.set('Content-Type', data.mime_type);
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
