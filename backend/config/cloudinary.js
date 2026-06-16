const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials exist
if (
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_KEY &&
  process.env.CLOUDINARY_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
}

/**
 * Uploads a local file to Cloudinary.
 * Fallbacks to serving local relative path if Cloudinary is unconfigured or fails.
 * @param {string} localFilePath - Path to the local file
 * @returns {Promise<string>} File URL
 */
const uploadToCloudinary = async (localFilePath) => {
  const filename = path.basename(localFilePath);
  
  if (
    !process.env.CLOUDINARY_NAME ||
    !process.env.CLOUDINARY_KEY ||
    !process.env.CLOUDINARY_SECRET
  ) {
    console.log(`Cloudinary is not configured. Storing file locally as /uploads/${filename}`);
    return `/uploads/${filename}`;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Support PDF, JPEG, PNG, etc.
      folder: 'medconnect',
    });

    // Delete the local temporary file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading file to Cloudinary. Falling back to local storage path. Details:', error.message);
    return `/uploads/${filename}`;
  }
};

module.exports = { uploadToCloudinary };
