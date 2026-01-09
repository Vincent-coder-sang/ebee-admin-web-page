const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const multer = require("multer");
require("dotenv").config(); // Load environment variables


// 🔧 Configure Cloudinary
cloudinary.config({
  cloud_name: "vincentsang",
  api_key: "455286944547629",
  api_secret: "764okYVYwP9WOp5iXMKS7Oxbr7c",
});

const storage = multer.memoryStorage();
const upload = multer({ storage });


const imageUploadUtil = async (file, options = {}) => {
  if (!file) throw new Error("No file provided");
  if (!file.buffer && !file.path) throw new Error("File must have buffer or path");

  // Defaults with 'ebee' preset
  const {
    folder = 'products',
    transformation = { quality: 'auto' },
    resourceType = 'image',
    preset = 'ebee' // Default preset
  } = options;

  try {
    const result = await cloudinary.uploader.upload(
      file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        upload_preset: preset,
        folder,
        transformation,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'png', 'webp'] // Recommended with presets
      }
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    };

  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed (Preset: ${preset}): ${error.message}`);
  } finally {
    // Cleanup
    if (file.buffer) file.buffer = null;
    if (file.tempFilePath) {
      try { require('fs').unlinkSync(file.tempFilePath); } 
      catch (e) { console.error('Temp file cleanup failed:', e); }
    }
  }
};

const imageUploadUtilFake = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          upload_preset: "ebee",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(new Error(error.message));
          } else {
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(error.message);
  }
};

const deleteImageUtil = async (publicId) => {
  if (!publicId) {
    throw new Error("Public ID is required");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true
    });

    if (result.result !== 'ok') {
      throw new Error(`Deletion failed: ${result.result}`);
    }

    return result;
  } catch (error) {
    console.error(`Failed to delete ${publicId}:`, error);
    throw new Error(`Deletion failed: ${error.message}`);
  }
};

// const deleteImageUtil = async (publicId) => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId);
//     return result;
//   } catch (error) {
//     console.error("Error deleting image from Cloudinary:", error);
//     throw new Error("Failed to delete image from Cloudinary");
//   }
// };

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Handle cases where publicId is already provided
    if (!url.includes('cloudinary.com')) return url.split('.')[0];
    
    const matches = url.match(/upload\/(?:v\d+\/)?(.+?)(?:\..+)?$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error("URL parsing error:", error);
    return null;
  }
};

// const getPublicIdFromUrl = (imageUrl) => {
//   try {
//     const url = new URL(imageUrl); // Ensure it's a valid URL
//     const pathParts = url.pathname.split("/"); // Get parts after domain
//     const fileNameWithExt = pathParts.pop(); // Extract last part (filename)
//     return fileNameWithExt.split(".")[0]; // Remove extension and return ID
//   } catch (error) {
//     console.error("Invalid Cloudinary URL:", error);
//     return null; // Handle invalid URL gracefully
//   }
// };


module.exports = {
  upload,
  imageUploadUtil,
  deleteImageUtil,
  getPublicIdFromUrl,
};
