/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80036 (8.0.36)
 Source Host           : localhost:3306
 Source Schema         : code_check

 Target Server Type    : MySQL
 Target Server Version : 80036 (8.0.36)
 File Encoding         : 65001

 Date: 02/07/2025 16:21:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for assignment
-- ----------------------------
DROP TABLE IF EXISTS `assignment`;
CREATE TABLE `assignment`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `deadline` datetime NOT NULL,
  `create_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `teacher_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `teacher_id`(`teacher_id` ASC) USING BTREE,
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of assignment
-- ----------------------------
INSERT INTO `assignment` VALUES (2, 'q', 'wwww', '2025-05-25 00:00:00', '2025-05-24 14:23:29', 6);
INSERT INTO `assignment` VALUES (3, '实验一', '完成商品管理', '2025-05-29 23:00:00', '2025-05-28 16:29:58', 6);
INSERT INTO `assignment` VALUES (4, 'aaaaaaaaa', 'vvvvvvvvvvvvvv', '2025-06-13 00:00:00', '2025-06-07 17:32:39', 6);
INSERT INTO `assignment` VALUES (6, '两数之和', '用python求两数之和', '2025-06-30 00:00:00', '2025-06-22 16:25:57', 6);
INSERT INTO `assignment` VALUES (7, '两数求和', '求和', '2025-06-30 00:00:00', '2025-06-22 22:43:02', 6);

-- ----------------------------
-- Table structure for check_history
-- ----------------------------
DROP TABLE IF EXISTS `check_history`;
CREATE TABLE `check_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `matched_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `similarity` float NULL DEFAULT NULL,
  `create_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `check_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of check_history
-- ----------------------------
INSERT INTO `check_history` VALUES (1, 2, '停车管理系统-1747403264395-317467612.txt', 'python银行管理系统-1747320306228-385442567.txt', 3.5, '2025-05-16 21:47:45');
INSERT INTO `check_history` VALUES (2, 2, 'python银行管理系统-1747403540333-453257724.txt', '便利店商品管理系统-1747213299137-129464105.txt', 7.7, '2025-05-16 21:52:36');
INSERT INTO `check_history` VALUES (3, 2, '便利店商品管理系统-1747405470201-644551681.txt', '停车管理系统-1747403264395-317467612.txt', 3.5, '2025-05-16 22:24:31');
INSERT INTO `check_history` VALUES (4, 2, '俄罗斯方块-1747469150283-908567258.txt', '停车管理系统-1747403264395-317467612.txt', 1.8, '2025-05-17 16:05:50');
INSERT INTO `check_history` VALUES (5, 2, '俄罗斯方块-1747469377582-134674051.txt', '俄罗斯方块-1747469150283-908567258.txt', 100, '2025-05-17 16:09:39');
INSERT INTO `check_history` VALUES (6, 2, '停车管理系统-1747469402155-174642803.txt', '停车管理系统-1747403264395-317467612.txt', 100, '2025-05-17 16:10:03');

-- ----------------------------
-- Table structure for submission
-- ----------------------------
DROP TABLE IF EXISTS `submission`;
CREATE TABLE `submission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `submitted_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `score` int NULL DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `assignment_id`(`assignment_id` ASC) USING BTREE,
  INDEX `student_id`(`student_id` ASC) USING BTREE,
  CONSTRAINT `submission_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `submission_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of submission
-- ----------------------------
INSERT INTO `submission` VALUES (1, 3, 2, 'ä¾¿å©åºååç®¡çç³»ç»-1748423333933-264.txt', '2025-05-28 17:08:53', '便利店商品管理系统.txt', NULL, NULL);
INSERT INTO `submission` VALUES (2, 4, 2, 'ä¿ç½æ¯æ¹å-1749361534577-122277061.txt', '2025-06-08 13:45:34', '俄罗斯方块.txt', 83, 'w');
INSERT INTO `submission` VALUES (6, 7, 3, 'test1-1750603497889-499840366.py', '2025-06-22 22:44:57', 'test1.py', NULL, NULL);
INSERT INTO `submission` VALUES (7, 7, 2, 'test1-1750603513627-497875038.py', '2025-06-22 22:45:13', 'test1.py', NULL, NULL);
INSERT INTO `submission` VALUES (8, 7, 2, 'test1-1750603513685-557037539.py', '2025-06-22 22:45:13', 'test1.py', NULL, NULL);
INSERT INTO `submission` VALUES (9, 7, 5, 'test2-1750603540140-783986476.py', '2025-06-22 22:45:40', 'test2.py', NULL, NULL);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码',
  `role` enum('student','teacher') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'student' COMMENT '用户角色',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (2, 'b', '$2b$10$TewNVxJqIr1s4t/pXGgT3uhmqUF9sIXYMvIPXsY6XdUJgLchw4x6u', 'student', '2025-05-10 17:02:17');
INSERT INTO `user` VALUES (3, 'a', '$2b$10$s4Jnwc0pkBZ.72Igf27cYeeiHKpKyX/umaIgI2xnWgwN2Ipe0AR7m', 'student', '2025-05-14 17:06:38');
INSERT INTO `user` VALUES (4, 'teacher1', '$2a$10$3Gak1uTqz3MZHiLzTwR5qeMd/jvAo9xBFcKpTzMOfx.85XUlWDyMe', 'teacher', '2025-05-17 17:12:34');
INSERT INTO `user` VALUES (5, 'c', '$2b$10$dznnlpYOQmXTmkj.02/xk.Kr969MbGK2HC05Wbi6J/gdGoYD4IDi.', 'student', '2025-05-17 17:56:06');
INSERT INTO `user` VALUES (6, 't1', '$2b$10$OCjLO15khyAuMZT4QZ/eJOuOF74F4.rgx.eBkPg5HamGxTw1UpTfK', 'teacher', '2025-05-17 18:02:40');

SET FOREIGN_KEY_CHECKS = 1;
