// routes/check.js
const express  = require("express");
const fs       = require("fs");
const path     = require("path");
const { exec } = require("child_process");
const router   = express.Router();
const db       = require("../models/db");

// ------------------ 1. 简易文本相似度查重 (POST /check) ------------------
function calculateSimilarity(a, b) {
  const len = Math.max(a.length, b.length);
  if (len === 0) return 100;
  let same = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) same++;
  }
  return ((same / len) * 100).toFixed(1);
}

router.post("/", async (req, res) => {
  const { filename, userId } = req.body;
  const uploadDir  = path.join(__dirname, "../uploads");
  const uploadPath = path.join(uploadDir, filename);

  if (!fs.existsSync(uploadPath))
    return res.status(400).json({ code: 400, message: "文件不存在" });

  const current = fs.readFileSync(uploadPath, "utf8");
  let maxSim = 0, matched = "";

  for (const f of fs.readdirSync(uploadDir)) {
    const fp = path.join(uploadDir, f);
    if (f !== filename && fs.lstatSync(fp).isFile()) {
      const sim = calculateSimilarity(current, fs.readFileSync(fp, "utf8"));
      if (sim > maxSim) { maxSim = sim; matched = f; }
    }
  }

  // 写入 check_history
  try {
    await db.query(
      `INSERT INTO check_history (user_id, filename, matched_file, similarity)
       VALUES (?,?,?,?)`,
      [userId, filename, matched, maxSim]
    );
  } catch (e) { console.error("写入历史失败:", e); }

  res.json({ code: 200, message: "查重成功", similarity: maxSim, matchedFile: matched });
});

// ------------------ 2. 教师分页查看全部查重记录 ------------------
router.get("/all", async (req, res) => {
  const { page = 1, pageSize = 5 } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    const [records] = await db.query(
      `SELECT u.username,c.filename,c.matched_file,c.similarity,c.create_at
       FROM check_history c JOIN user u ON c.user_id=u.id
       ORDER BY c.create_at DESC LIMIT ? OFFSET ?`,
      [Number(pageSize), Number(offset)]
    );
    const [cnt] = await db.query(`SELECT COUNT(*) AS total FROM check_history`);
    res.json({ code: 200, data: { records, total: cnt[0].total } });
  } catch (e) {
    console.error("教师获取查重记录失败:", e);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// ------------------ 3. 学生查看自己查重历史 ------------------
router.get("/history", async (req, res) => {
  const { userId, page = 1, pageSize = 5 } = req.query;
  const offset = (page - 1) * pageSize;
  try {
    const [rows] = await db.query(
      `SELECT filename,matched_file,similarity,create_at
       FROM check_history WHERE user_id=? ORDER BY create_at DESC
       LIMIT ? OFFSET ?`,
      [userId, Number(pageSize), Number(offset)]
    );
    const [cnt] = await db.query(
      `SELECT COUNT(*) AS total FROM check_history WHERE user_id=?`, [userId]
    );
    res.json({ code: 200, data: { records: rows, total: cnt[0].total } });
  } catch (e) {
    console.error("查询查重记录失败:", e);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// -------------------------------------------------------------------------
// 4. JPlag 查重辅助函数（一次定义，全局复用）
function runJPlag(inputDir, cb) {
  const resultDir = path.join(__dirname, "../jplag/result");
  const jarPath   = path.join(__dirname, "../jplag/jplag.jar");

  // 清空旧报告并重建目录
  fs.rmSync(resultDir, { recursive: true, force: true });
  fs.mkdirSync(resultDir, { recursive: true });

  const cmd = `java -jar "${jarPath}" -l python3 -s -r "${resultDir}" "${inputDir}"`;
  console.log("→ 执行:", cmd);

  exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);               // 可以注释掉
    console.error(stderr);             // 可以注释掉
    if (err) return cb(err);
    cb(null, resultDir);               // 2.11.9 默认 index.html 在根目录
  });
}
// -------------------------------------------------------------------------

// ------------------ 5. 教师端发起“整份作业代码查重” ------------------
router.get("/assignment/:id", async (req, res) => {
  const assignmentId = req.params.id;

  // (1) 判断是否有学生提交
  const [rows] = await db.query(
    `SELECT 1 FROM submission WHERE assignment_id = ? LIMIT 1`,
    [assignmentId]
  );
  if (rows.length === 0) {
    return res.json({ code: 404, message: "该作业暂无提交记录" });
  }

  // (2) 计算待查重目录
  const inputDir = path.join(__dirname, `../jplag/data/${assignmentId}`);
  runJPlag(inputDir, (err) => {
    if (err) {
      console.error("JPlag 失败:", err);
      return res.status(500).json({ code: 500, message: "查重执行失败" });
    }

    // (3) 生成报告 URL：先看根目录 index.html，再看时间戳子目录
    const resultRoot = path.join(__dirname, "../jplag/result");
    const rootIndex  = path.join(resultRoot, "index.html");
    let reportUrl    = "";

    if (fs.existsSync(rootIndex)) {
      reportUrl = "http://localhost:3000/jplag/result/index.html";
    } else {
      const folders = fs.existsSync(resultRoot)
        ? fs.readdirSync(resultRoot, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name)
            .sort()
            .reverse()
        : [];

      if (folders.length === 0) {
        return res
          .status(500)
          .json({ code: 500, message: "未找到查重结果目录" });
      }
      reportUrl = `http://localhost:3000/jplag/result/${folders[0]}/index.html`;
    }

    res.json({ code: 200, message: "查重完成", reportUrl });
  });
});

module.exports = router;
