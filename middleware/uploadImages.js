const multer = require('multer');
const apiError = require('./apierror');

const multerOptions = () => {
  const storage = multer.diskStorage({
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const multerFilter = (req, file, cb) => {
    // Check if the file type is an image
    if (file.mimetype.startsWith('image/')) {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file
      cb(new apiError('Only images are allowed',400));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: multerFilter
});
  return upload;
};

exports.uploadSingleImage = (fieldName) => {
  return (req, res, next) => {
    console.log(`Middleware: Uploading single image for field ${fieldName}`);
    multerOptions().single(fieldName)(req, res, function (err) {
      if (err) {
       next(
        new apiError(err,400)
       )
      }
      if (!req.file) {
        console.error('No file uploaded');
        next(
          new apiError('No file uploaded' ,400)
         )
      }
      console.log('Image uploaded successfully');
      next();
    });
  };
};
exports.uploadArrayOfImages = (fieldName) => {
  return (req, res, next) => {
    multerOptions().array(fieldName, { min: 3 })(req, res, function (err) {
      if (err) {
        console.error('Error uploading images:', err.apiError.message);
        return res.status(400).json({ error: 'Error uploading images' });
      }
      if (!req.files || req.files.length === 0) {
        console.error('No files uploaded');
        return res.status(400).json({ error: 'No files uploaded' });
      }
      next(); // Call next to pass control to the next middleware in the chain
    });
  };
};
exports.validateImageCount = (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  const fileCount = req.files.length;
  if (fileCount < 3) {
    return res.status(400).json({ error: 'At least 3 images are required.' });
  }
  if (fileCount > 5) {
    return res.status(400).json({ error: 'Only 5 images are allowed.' });
  }

  next();
};