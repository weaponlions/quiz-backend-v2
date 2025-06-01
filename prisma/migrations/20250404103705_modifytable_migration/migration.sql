/*
  Warnings:

  - You are about to drop the column `examBoardName` on the `examboard` table. All the data in the column will be lost.
  - You are about to drop the `question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `boardLogo` to the `ExamBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examBoardLongName` to the `ExamBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examBoardShortName` to the `ExamBoard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examLogo` to the `ExamBoard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_topicId_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `Subject_examId_fkey`;

-- DropForeignKey
ALTER TABLE `topic` DROP FOREIGN KEY `Topic_subjectId_fkey`;

-- DropIndex
DROP INDEX `ExamBoard_examName_examBoardName_examBoardType_idx` ON `examboard`;

-- AlterTable
ALTER TABLE `examboard` DROP COLUMN `examBoardName`,
    ADD COLUMN `boardLogo` VARCHAR(255) NOT NULL,
    ADD COLUMN `examBoardLongName` VARCHAR(255) NOT NULL,
    ADD COLUMN `examBoardShortName` VARCHAR(255) NOT NULL,
    ADD COLUMN `examLogo` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `question`;

-- DropTable
DROP TABLE `subject`;

-- DropTable
DROP TABLE `topic`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamRound` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roundName` VARCHAR(255) NOT NULL,
    `sectionName` VARCHAR(255) NOT NULL,
    `roundType` ENUM('MAIN', 'PRELIMS') NOT NULL,
    `examId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `ownerId` INTEGER NOT NULL,
    `accessType` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',

    UNIQUE INDEX `ExamRound_id_key`(`id`),
    INDEX `ExamRound_roundName_idx`(`roundName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamSubject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectName` VARCHAR(255) NOT NULL,
    `examId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `ownerId` INTEGER NOT NULL,
    `accessType` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',

    UNIQUE INDEX `ExamSubject_id_key`(`id`),
    INDEX `ExamSubject_subjectName_examId_idx`(`subjectName`, `examId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubjectTopic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topicName` VARCHAR(255) NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `SubjectTopic_id_key`(`id`),
    INDEX `SubjectTopic_topicName_subjectId_idx`(`topicName`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopicQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionText` TEXT NOT NULL,
    `shortText` VARCHAR(255) NOT NULL,
    `answerA` TEXT NOT NULL,
    `answerB` TEXT NOT NULL,
    `answerC` TEXT NOT NULL,
    `answerD` TEXT NOT NULL,
    `answerCorrect` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `topicId` INTEGER NOT NULL,
    `roundId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `year` VARCHAR(5) NOT NULL,

    UNIQUE INDEX `TopicQuestion_id_key`(`id`),
    INDEX `TopicQuestion_shortText_topicId_idx`(`shortText`, `topicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ExamBoard_examName_examBoardType_idx` ON `ExamBoard`(`examName`, `examBoardType`);

-- AddForeignKey
ALTER TABLE `ExamRound` ADD CONSTRAINT `ExamRound_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `ExamBoard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamRound` ADD CONSTRAINT `ExamRound_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `ExamBoard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubjectTopic` ADD CONSTRAINT `SubjectTopic_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `ExamSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopicQuestion` ADD CONSTRAINT `TopicQuestion_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `SubjectTopic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopicQuestion` ADD CONSTRAINT `TopicQuestion_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `ExamRound`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
