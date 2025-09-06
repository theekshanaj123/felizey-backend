const fs = require("fs");

const uploadToSupabase = async (filePath, mimetype, targetPath) => {
  const file = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from("media")
    .upload(targetPath, file, {
      contentType: mimetype,
      upsert: false,
    });

  fs.unlinkSync(filePath); // delete temp file

  if (error) throw new Error(error.message);

  const { data: publicUrlData } = supabase.storage
    .from("media")
    .getPublicUrl(targetPath);

  return publicUrlData.publicUrl;
};

//  Profile Image Upload
exports.uploadProfileImage = async (req, res) => {
  try {
    const fileName = `profile-images/${Date.now()}-${req.file.originalname}`;
    const url = await uploadToSupabase(
      req.file.path,
      req.file.mimetype,
      fileName
    );
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Event Image Upload
exports.uploadEventImage = async (req, res) => {
  try {
    const fileName = `event-images/${Date.now()}-${req.file.originalname}`;
    const url = await uploadToSupabase(
      req.file.path,
      req.file.mimetype,
      fileName
    );
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Multiple Banner Images Upload
exports.uploadBanners = async (req, res) => {
  try {
    const urls = [];

    for (const file of req.files) {
      const fileName = `banner-images/${Date.now()}-${file.originalname}`;
      const url = await uploadToSupabase(file.path, file.mimetype, fileName);
      urls.push(url);
    }

    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
