/*
  Warnings:

  - A unique constraint covering the columns `[examName]` on the table `ExamBoard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ExamBoard_examName_key` ON `ExamBoard`(`examName`);
