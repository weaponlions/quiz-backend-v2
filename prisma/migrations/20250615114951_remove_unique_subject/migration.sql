-- DropIndex
DROP INDEX `Exam_name_key` ON `exam`;

-- DropIndex
DROP INDEX `Subject_name_key` ON `subject`;

-- AlterTable
ALTER TABLE `exam` ADD COLUMN `board` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `questiontranslation` MODIFY `optionC` TEXT NULL,
    MODIFY `optionD` TEXT NULL;
