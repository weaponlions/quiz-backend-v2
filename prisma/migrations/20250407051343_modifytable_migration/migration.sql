/*
  Warnings:

  - You are about to drop the column `shortText` on the `topicquestion` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `topicquestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[examBoardShortName]` on the table `ExamBoard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roundName,sectionName,examId]` on the table `ExamRound` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subjectName,examId]` on the table `ExamSubject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[topicName,subjectId]` on the table `SubjectTopic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionTitle` to the `TopicQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionYear` to the `TopicQuestion` table without a default value. This is not possible if the table is not empty.

*/
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
DROP INDEX `ExamBoard_id_key` ON `examboard`;

-- DropIndex
DROP INDEX `ExamRound_examId_fkey` ON `examround`;

-- DropIndex
DROP INDEX `ExamRound_id_key` ON `examround`;

-- DropIndex
DROP INDEX `ExamRound_ownerId_fkey` ON `examround`;

-- DropIndex
DROP INDEX `ExamSubject_examId_fkey` ON `examsubject`;

-- DropIndex
DROP INDEX `ExamSubject_id_key` ON `examsubject`;

-- DropIndex
DROP INDEX `ExamSubject_ownerId_fkey` ON `examsubject`;

-- DropIndex
DROP INDEX `SubjectTopic_id_key` ON `subjecttopic`;

-- DropIndex
DROP INDEX `SubjectTopic_subjectId_fkey` ON `subjecttopic`;

-- DropIndex
DROP INDEX `TopicQuestion_id_key` ON `topicquestion`;

-- DropIndex
DROP INDEX `TopicQuestion_roundId_fkey` ON `topicquestion`;

-- DropIndex
DROP INDEX `TopicQuestion_shortText_topicId_idx` ON `topicquestion`;

-- DropIndex
DROP INDEX `TopicQuestion_topicId_fkey` ON `topicquestion`;

-- DropIndex
DROP INDEX `User_id_key` ON `user`;

-- AlterTable
ALTER TABLE `topicquestion` DROP COLUMN `shortText`,
    DROP COLUMN `year`,
    ADD COLUMN `questionTitle` VARCHAR(255) NOT NULL,
    ADD COLUMN `questionYear` VARCHAR(5) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `userType` ENUM('ADMIN', 'CREATOR', 'STUDENT') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `AttemptedTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roundId` INTEGER NOT NULL,
    `subjectId` INTEGER NULL,
    `topicId` INTEGER NULL,
    `examId` INTEGER NULL,
    `category` VARCHAR(255) NULL,
    `score` DOUBLE NULL,
    `timeTaken` INTEGER NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AttemptedTest_userId_roundId_idx`(`userId`, `roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnsweredQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptedTestId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `chosenOption` ENUM('A', 'B', 'C', 'D') NULL,
    `correctOption` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `attempted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `AnsweredQuestion_attemptedTestId_questionId_idx`(`attemptedTestId`, `questionId`),
    UNIQUE INDEX `AnsweredQuestion_attemptedTestId_questionId_key`(`attemptedTestId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ExamBoard_examBoardShortName_key` ON `ExamBoard`(`examBoardShortName`);

-- CreateIndex
CREATE UNIQUE INDEX `ExamRound_roundName_sectionName_examId_key` ON `ExamRound`(`roundName`, `sectionName`, `examId`);

-- CreateIndex
CREATE UNIQUE INDEX `ExamSubject_subjectName_examId_key` ON `ExamSubject`(`subjectName`, `examId`);

-- CreateIndex
CREATE UNIQUE INDEX `SubjectTopic_topicName_subjectId_key` ON `SubjectTopic`(`topicName`, `subjectId`);

-- CreateIndex
CREATE INDEX `TopicQuestion_questionTitle_topicId_idx` ON `TopicQuestion`(`questionTitle`, `topicId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `ExamBoard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectTopic` ADD CONSTRAINT `SubjectTopic_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `ExamSubject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamRound` ADD CONSTRAINT `ExamRound_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `ExamBoard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamRound` ADD CONSTRAINT `ExamRound_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopicQuestion` ADD CONSTRAINT `TopicQuestion_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `SubjectTopic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopicQuestion` ADD CONSTRAINT `TopicQuestion_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `ExamRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptedTest` ADD CONSTRAINT `AttemptedTest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptedTest` ADD CONSTRAINT `AttemptedTest_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `ExamRound`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptedTest` ADD CONSTRAINT `AttemptedTest_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `ExamSubject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptedTest` ADD CONSTRAINT `AttemptedTest_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `SubjectTopic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptedTest` ADD CONSTRAINT `AttemptedTest_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `ExamBoard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnsweredQuestion` ADD CONSTRAINT `AnsweredQuestion_attemptedTestId_fkey` FOREIGN KEY (`attemptedTestId`) REFERENCES `AttemptedTest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnsweredQuestion` ADD CONSTRAINT `AnsweredQuestion_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `TopicQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
