const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const iconv = require("iconv-lite");

const router = express.Router();

const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${name}-${unique}${ext}`);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: "未收到文件" });
  }

  const originalName = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf8');

  res.json({
    code: 200,
    message: "上传成功",
    filename: req.file.filename,
    originalName
  });
});

module.exports = router;
