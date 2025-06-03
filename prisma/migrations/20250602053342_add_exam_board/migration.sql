-- DropIndex
DROP INDEX IF EXISTS `Exam_name_key` ON `exam`;

-- AlterTable
ALTER TABLE `exam` ADD COLUMN `board` VARCHAR(191) NULL;
