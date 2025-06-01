/*
  Warnings:

  - You are about to drop the column `accessType` on the `examsubject` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `examsubject` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `examsubject` table. All the data in the column will be lost.
  - You are about to drop the column `subjectName` on the `examsubject` table. All the data in the column will be lost.
  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to drop the `answeredquestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attemptedtest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examround` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subjecttopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topicquestion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `ExamSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `answeredquestion` DROP FOREIGN KEY `AnsweredQuestion_attemptedTestId_fkey`;

-- DropForeignKey
ALTER TABLE `answeredquestion` DROP FOREIGN KEY `AnsweredQuestion_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `attemptedtest` DROP FOREIGN KEY `AttemptedTest_examId_fkey`;

-- DropForeignKey
ALTER TABLE `attemptedtest` DROP FOREIGN KEY `AttemptedTest_roundId_fkey`;

-- DropForeignKey
ALTER TABLE `attemptedtest` DROP FOREIGN KEY `AttemptedTest_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `attemptedtest` DROP FOREIGN KEY `AttemptedTest_topicId_fkey`;

-- DropForeignKey
ALTER TABLE `attemptedtest` DROP FOREIGN KEY `AttemptedTest_userId_fkey`;

-- DropForeignKey
ALTER TABLE `examround` DROP FOREIGN KEY `ExamRound_examId_fkey`;

-- DropForeignKey
ALTER TABLE `examround` DROP FOREIGN KEY `ExamRound_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `examsubject` DROP FOREIGN KEY `ExamSubject_examId_fkey`;

-- DropForeignKey
ALTER TABLE `examsubject` DROP FOREIGN KEY `ExamSubject_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `subjecttopic` DROP FOREIGN KEY `SubjectTopic_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `topicquestion` DROP FOREIGN KEY `TopicQuestion_roundId_fkey`;

-- DropForeignKey
ALTER TABLE `topicquestion` DROP FOREIGN KEY `TopicQuestion_topicId_fkey`;

-- DropIndex
DROP INDEX `ExamSubject_examId_fkey` ON `examsubject`;

-- DropIndex
DROP INDEX `ExamSubject_ownerId_fkey` ON `examsubject`;

-- DropIndex
DROP INDEX `ExamSubject_subjectName_examId_idx` ON `examsubject`;

-- DropIndex
DROP INDEX `ExamSubject_subjectName_examId_key` ON `examsubject`;

-- AlterTable
ALTER TABLE `examsubject` DROP COLUMN `accessType`,
    DROP COLUMN `active`,
    DROP COLUMN `ownerId`,
    DROP COLUMN `subjectName`,
    ADD COLUMN `subjectId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `board` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `preferredLanguage` VARCHAR(191) NULL,
    MODIFY `username` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE `answeredquestion`;

-- DropTable
DROP TABLE `attemptedtest`;

-- DropTable
DROP TABLE `examboard`;

-- DropTable
DROP TABLE `examround`;

-- DropTable
DROP TABLE `subjecttopic`;

-- DropTable
DROP TABLE `topicquestion`;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subject_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Topic_subjectId_name_key`(`subjectId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Exam_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Test` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `examId` INTEGER NULL,
    `subjectId` INTEGER NULL,
    `topicId` INTEGER NULL,
    `durationMinutes` INTEGER NOT NULL,
    `isLive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Test_examId_subjectId_topicId_idx`(`examId`, `subjectId`, `topicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examId` INTEGER NULL,
    `subjectId` INTEGER NOT NULL,
    `topicId` INTEGER NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Question_examId_subjectId_topicId_difficulty_idx`(`examId`, `subjectId`, `topicId`, `difficulty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionPool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `examId` INTEGER NULL,
    `subjectId` INTEGER NULL,
    `topicId` INTEGER NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QuestionPool_examId_subjectId_topicId_difficulty_idx`(`examId`, `subjectId`, `topicId`, `difficulty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `questionText` TEXT NOT NULL,
    `optionA` TEXT NOT NULL,
    `optionB` TEXT NOT NULL,
    `optionC` TEXT NOT NULL,
    `optionD` TEXT NOT NULL,
    `correctOption` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `explanation` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QuestionTranslation_questionId_language_key`(`questionId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,

    INDEX `TestQuestion_testId_questionId_idx`(`testId`, `questionId`),
    UNIQUE INDEX `TestQuestion_testId_position_key`(`testId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,
    `score` DOUBLE NULL,

    INDEX `TestAttempt_userId_testId_idx`(`userId`, `testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttemptAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `selectedOption` ENUM('A', 'B', 'C', 'D') NULL,
    `isCorrect` BOOLEAN NULL,

    INDEX `AttemptAnswer_attemptId_questionId_idx`(`attemptId`, `questionId`),
    UNIQUE INDEX `AttemptAnswer_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserQuestionLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `seenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserQuestionLog_userId_questionId_idx`(`userId`, `questionId`),
    UNIQUE INDEX `UserQuestionLog_userId_questionId_key`(`userId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ExamSubject_examId_subjectId_idx` ON `ExamSubject`(`examId`, `subjectId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Topic` ADD CONSTRAINT `Topic_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionPool` ADD CONSTRAINT `QuestionPool_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionTranslation` ADD CONSTRAINT `QuestionTranslation_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestion` ADD CONSTRAINT `TestQuestion_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestion` ADD CONSTRAINT `TestQuestion_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptAnswer` ADD CONSTRAINT `AttemptAnswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptAnswer` ADD CONSTRAINT `AttemptAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuestionLog` ADD CONSTRAINT `UserQuestionLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuestionLog` ADD CONSTRAINT `UserQuestionLog_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
