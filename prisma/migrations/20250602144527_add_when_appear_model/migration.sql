/*
  Warnings:

  - You are about to drop the column `board` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Exam_name_key` ON `exam`;

-- AlterTable
ALTER TABLE `exam` ADD COLUMN `board` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `board`,
    ADD COLUMN `exam` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `QuestionAppear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `whenAppear` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `examId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionAppear` ADD CONSTRAINT `QuestionAppear_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
