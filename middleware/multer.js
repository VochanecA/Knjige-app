const multer = require("multer");

// Set up the Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder where uploaded images will be stored
    cb(null, "/assets/knjige/");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded image
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
