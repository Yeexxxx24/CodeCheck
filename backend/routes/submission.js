// const express = require('express');
// const router = express.Router();
// const db = require('../models/db');
// const multer = require('multer');
// const path = require('path');
// const iconv = require('iconv-lite')

// // const upload = multer(); // 解析 multipart/form-data

// // 提交作业接口
// // 1. 设置上传目录
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const { assignmentId, studentId, studentName } = req.body;

//     if (!assignmentId || !studentId || !studentName) {
//       return cb(new Error('缺少必要参数（assignmentId / studentId / studentName）'), null);
//     }

//     const folderName = `${studentId}_${studentName}`;
//     const uploadPath = path.join(__dirname, `../jplag/data/${assignmentId}/${folderName}`);
//     fs.mkdirSync(uploadPath, { recursive: true });

//     cb(null, uploadPath);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = path.basename(file.originalname, ext);
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, `${name}-${uniqueSuffix}${ext}`);
//   }
// });

// const upload = multer({ storage })

// // 2. ✅ 接收文件的提交接口
// router.post('/', upload.single('file'), async (req, res) => {
//   const { studentId, assignmentId } = req.body

//   if (!studentId || !assignmentId || !req.file) {
//     return res.status(400).json({ code: 400, message: '缺少参数或文件' })
//   }

//   // 解析原始文件名（支持中文）
//   const originalName = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf8')

//   try {
//     await db.query(`
//       INSERT INTO submission (student_id, assignment_id, filename, original_name, submitted_at)
//       VALUES (?, ?, ?, ?, NOW())
//     `, [studentId, assignmentId, req.file.filename, originalName])

//     res.json({ code: 200, message: '提交成功' })
//   } catch (error) {
//     console.error('提交失败:', error)
//     res.status(500).json({ code: 500, message: '服务器错误' })
//   }
// })


// // 查询学生提交状态
// router.get('/status', async (req, res) => {
//   const { studentId, assignmentId } = req.query;
//   if (!studentId || !assignmentId) {
//     return res.status(400).json({ code: 400, message: '参数缺失' });
//   }

//   try {
//     const [rows] = await db.query(
//       `SELECT COUNT(*) AS count FROM submission WHERE student_id = ? AND assignment_id = ?`,
//       [studentId, assignmentId]
//     );
//     res.json({ code: 200, data: { submitted: rows[0].count > 0 } });
//   } catch (err) {
//     res.status(500).json({ code: 500, message: '服务器错误' });
//   }
// });

// // 教师查看提交记录
// router.get('/list', async (req, res) => {
//   const { assignmentId } = req.query;
//   if (!assignmentId) {
//     return res.status(400).json({ code: 400, message: '缺少 assignmentId 参数' });
//   }

//   try {
//     const [students] = await db.query(`SELECT id AS studentId, username AS studentName FROM user WHERE role = 'student'`);
//     const [submissions] = await db.query(`
//       SELECT student_id AS studentId, filename, original_name, submitted_at, score,comment  
//       FROM submission WHERE assignment_id = ?
//     `, [assignmentId]);

//     const map = new Map();
//     submissions.forEach(s => map.set(s.studentId, s));

//     // 遍历所有学生
//     const result = students.map(student => {
//       const sub = map.get(student.studentId);
//       return {
//         studentId: student.studentId,
//         studentName: student.studentName,
//         filename: sub?.filename || null,
//         originalName: sub?.original_name || null,
//         submittedAt: sub?.submitted_at || null,
//         score:sub?.score ?? null,
//         comment:sub?.comment ?? ''
//       };
//     });

//     res.json({ code: 200, data: result });
//   } catch (err) {
//     console.error('获取提交记录失败：', err);
//     res.status(500).json({ code: 500, message: '服务器错误' });
//   }
// });
// // 教师打分接口
// router.post('/grade', async (req, res) => {
//   const { studentId, assignmentId, score, comment } = req.body;

//   if (!studentId || !assignmentId || score === undefined) {
//     return res.status(400).json({ code: 400, message: '缺少参数' });
//   }

//   try {
//     await db.query(`
//       UPDATE submission
//       SET score = ?, comment = ?
//       WHERE student_id = ? AND assignment_id = ?
//     `, [score, comment || '', studentId, assignmentId]);

//     res.json({ code: 200, message: '评分成功' });
//   } catch (error) {
//     console.error('评分失败：', error);
//     res.status(500).json({ code: 500, message: '服务器错误' });
//   }
// });
// // 获取某学生某作业的提交详情（含评分和评语）
// router.get('/detail', async (req, res) => {
//   const { studentId, assignmentId } = req.query;

//   if (!studentId || !assignmentId) {
//     return res.status(400).json({ code: 400, message: '缺少参数' });
//   }

//   try {
//     const [rows] = await db.query(`
//       SELECT score, comment
//       FROM submission
//       WHERE student_id = ? AND assignment_id = ?
//       LIMIT 1
//     `, [studentId, assignmentId]);

//     if (rows.length > 0) {
//       res.json({ code: 200, data: rows[0] });
//     } else {
//       res.json({ code: 404, message: '未找到提交记录' });
//     }
//   } catch (err) {
//     console.error('获取提交详情出错', err);
//     res.status(500).json({ code: 500, message: '服务器错误' });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

// 1. 临时上传目录
const tempPath = path.join(__dirname, '../jplag/temp_upload');
fs.mkdirSync(tempPath, { recursive: true });

// 2. 配置 Multer 存储策略：先上传到临时文件夹
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });


// 3. ✅ 提交作业接口
router.post('/', upload.single('file'), async (req, res) => {
  const { studentId, assignmentId, studentName } = req.body;

  if (!studentId || !assignmentId || !studentName || !req.file) {
    return res.status(400).json({ code: 400, message: '缺少参数或文件' });
  }

  try {
    // 计算目标目录路径
    const folder = `${studentId}_${studentName}`;
    const targetDir = path.join(__dirname, `../jplag/data/${assignmentId}/${folder}`);
    fs.mkdirSync(targetDir, { recursive: true });

    // 移动文件到目标位置
    const oldPath = req.file.path;
    const newPath = path.join(targetDir, req.file.filename);
    fs.renameSync(oldPath, newPath);

    const originalName = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf8');

    await db.query(`
      INSERT INTO submission (student_id, assignment_id, filename, original_name, submitted_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        filename = VALUES(filename),
        original_name = VALUES(original_name),
        submitted_at = NOW()
    `, [studentId, assignmentId, req.file.filename, originalName]);

    res.json({ code: 200, message: '提交成功' });
  } catch (error) {
    console.error('提交失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});


// 4. 查询提交状态
router.get('/status', async (req, res) => {
  const { studentId, assignmentId } = req.query;

  if (!studentId || !assignmentId) {
    return res.status(400).json({ code: 400, message: '参数缺失' });
  }

  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count FROM submission WHERE student_id = ? AND assignment_id = ?`,
      [studentId, assignmentId]
    );
    res.json({ code: 200, data: { submitted: rows[0].count > 0 } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});


// 5. 教师查看提交列表
router.get('/list', async (req, res) => {
  const { assignmentId } = req.query;

  if (!assignmentId) {
    return res.status(400).json({ code: 400, message: '缺少 assignmentId 参数' });
  }

  try {
    const [students] = await db.query(`
      SELECT id AS studentId, username AS studentName FROM user WHERE role = 'student'
    `);

    const [submissions] = await db.query(`
      SELECT student_id AS studentId, filename, original_name, submitted_at, score, comment
      FROM submission WHERE assignment_id = ?
    `, [assignmentId]);

    const map = new Map();
    submissions.forEach(s => map.set(s.studentId, s));

    const result = students.map(student => {
      const sub = map.get(student.studentId);
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        filename: sub?.filename || null,
        originalName: sub?.original_name || null,
        submittedAt: sub?.submitted_at || null,
        score: sub?.score ?? null,
        comment: sub?.comment ?? ''
      };
    });

    res.json({ code: 200, data: result });
  } catch (err) {
    console.error('获取提交记录失败：', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});


// 6. 教师评分接口
router.post('/grade', async (req, res) => {
  const { studentId, assignmentId, score, comment } = req.body;

  if (!studentId || !assignmentId || score === undefined) {
    return res.status(400).json({ code: 400, message: '缺少参数' });
  }

  try {
    await db.query(`
      UPDATE submission
      SET score = ?, comment = ?
      WHERE student_id = ? AND assignment_id = ?
    `, [score, comment || '', studentId, assignmentId]);

    res.json({ code: 200, message: '评分成功' });
  } catch (error) {
    console.error('评分失败：', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});


// 7. 学生查看评分/评语
router.get('/detail', async (req, res) => {
  const { studentId, assignmentId } = req.query;

  if (!studentId || !assignmentId) {
    return res.status(400).json({ code: 400, message: '缺少参数' });
  }

  try {
    const [rows] = await db.query(`
      SELECT score, comment
      FROM submission
      WHERE student_id = ? AND assignment_id = ?
      LIMIT 1
    `, [studentId, assignmentId]);

    if (rows.length > 0) {
      res.json({ code: 200, data: rows[0] });
    } else {
      res.json({ code: 404, message: '未找到提交记录' });
    }
  } catch (err) {
    console.error('获取提交详情出错', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
