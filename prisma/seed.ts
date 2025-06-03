import { PrismaClient, userTypeEnum, difficultyEnum, correctAnswerEnum } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Users
  const users = await Promise.all(
    Array.from({ length: 10 }, () =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          password: faker.internet.password(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          preferredLanguage: faker.helpers.arrayElement(['en', 'hi']),
          exam: faker.helpers.arrayElement(['SSc CGL', 'SSC MAIN', 'CENTRAL']),
          userType: userTypeEnum.STUDENT,
          isActive: true,
        },
      })
    )
  );

  // 2. Seed Subjects
  const subjects = await Promise.all(
    Array.from({ length: 3 }, () =>
      prisma.subject.create({
        data: {
          name: faker.lorem.word() + '_' + faker.string.uuid().slice(0, 5),
        },
      })
    )
  );

  // 3. Seed Topics
  const topics = await Promise.all(
    subjects.flatMap((subject) =>
      Array.from({ length: 3 }, () =>
        prisma.topic.create({
          data: {
            subjectId: subject.id,
            name: faker.lorem.word() + '_' + faker.string.uuid().slice(0, 5),
          },
        })
      )
    )
  );

  // 4. Seed Exams
  const exams = await Promise.all(
    Array.from({ length: 3 }, () =>
      prisma.exam.create({
        data: {
          name: faker.lorem.words(2) + '_' + faker.string.uuid().slice(0, 5),
          board: faker.helpers.arrayElement(['CBSE', 'ICSE']),
          level: faker.helpers.arrayElement(['10th', '12th']),
        },
      })
    )
  );

  // 5. Seed ExamSubjects
  const examSubjects = await Promise.all(
    exams.flatMap((exam) =>
      subjects.map((subject) =>
        prisma.examSubject.create({
          data: {
            examId: exam.id,
            subjectId: subject.id,
          },
        })
      )
    )
  );

  // 6. Seed Questions
  const questions = await Promise.all(
    topics.flatMap((topic) =>
      Array.from({ length: 3 }, () =>
        prisma.question.create({
          data: {
            subjectId: topic.subjectId,
            topicId: topic.id,
            difficulty: faker.helpers.arrayElement(Object.values(difficultyEnum)),
            examId: faker.helpers.arrayElement(exams).id,
          },
        })
      )
    )
  );

  // 7. Seed QuestionTranslation
  const questionTranslations = await Promise.all(
    questions.flatMap((question) =>
      ['en', 'hi'].map((lang) =>
        prisma.questionTranslation.create({
          data: {
            questionId: question.id,
            language: lang,
            questionText: faker.lorem.sentence(),
            optionA: faker.word.words(),
            optionB: faker.word.words(),
            optionC: faker.word.words(),
            optionD: faker.word.words(),
            correctOption: correctAnswerEnum.A,
            explanation: faker.lorem.sentences(2),
          },
        })
      )
    )
  );

  // 8. Seed Tests
  const tests = await Promise.all(
    Array.from({ length: 8 }, () => {
      const subject = faker.helpers.arrayElement(subjects);
      const topic = faker.helpers.arrayElement(topics.filter(t => t.subjectId === subject.id));
      const exam = faker.helpers.arrayElement(exams);

      return prisma.test.create({
        data: {
          name: faker.company.name() + '_' + faker.string.uuid().slice(0, 5),
          subjectId: subject.id,
          topicId: topic.id,
          examId: exam.id,
          durationMinutes: faker.number.int({ min: 30, max: 120 }),
          isLive: faker.datatype.boolean(),
        },
      });
    })
  );

  // 9. Seed TestQuestions
  const testQuestions = await Promise.all(
    tests.flatMap((test) => {
      const usedQuestionIds = new Set<number>();
      const sampleQuestions = faker.helpers.arrayElements(
        questions.filter(q => !usedQuestionIds.has(q.id)), 5
      );

      return sampleQuestions.map((question, index) => {
        usedQuestionIds.add(question.id);
        return prisma.testQuestion.create({
          data: {
            testId: test.id,
            questionId: question.id,
            position: index + 1,
          },
        });
      });
    })
  );

  // 10. Seed TestAttempts
  const attempts = await Promise.all(
    Array.from({ length: 10 }, () => {
      const test = faker.helpers.arrayElement(tests);
      const user = faker.helpers.arrayElement(users);

      return prisma.testAttempt.create({
        data: {
          testId: test.id,
          userId: user.id,
          startedAt: faker.date.past(),
          submittedAt: faker.datatype.boolean() ? faker.date.recent() : null,
          score: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
        },
      });
    })
  );

  // 11. Seed AttemptAnswers
  const attemptAnswers = await Promise.all(
    attempts.flatMap((attempt) => {
      const relatedTestQuestions = testQuestions.filter(tq => tq.testId === attempt.testId);

      return relatedTestQuestions.map((tq) =>
        prisma.attemptAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: tq.questionId,
            selectedOption: faker.helpers.arrayElement(Object.values(correctAnswerEnum)),
            isCorrect: faker.datatype.boolean(),
          },
        })
      );
    })
  );

  // 12. Seed QuestionPools
  const questionPools = await Promise.all(
    questions.map((question) =>
      prisma.questionPool.create({
        data: {
          questionId: question.id,
          examId: faker.helpers.arrayElement(exams).id,
          subjectId: question.subjectId,
          topicId: question.topicId,
          difficulty: question.difficulty,
        },
      })
    )
  );

  // 13. Seed UserQuestionLogs
  const seenCombinations = new Set<string>();
  const userQuestionLogs: Promise<any>[] = [];

  while (userQuestionLogs.length < 20) {
    const user = faker.helpers.arrayElement(users);
    const question = faker.helpers.arrayElement(questions);
    const key = `${user.id}-${question.id}`;

    if (!seenCombinations.has(key)) {
      seenCombinations.add(key);
      userQuestionLogs.push(
        prisma.userQuestionLog.create({
          data: {
            userId: user.id,
            questionId: question.id,
            seenAt: faker.date.recent(),
          },
        })
      );
    }
  }

  await Promise.all(userQuestionLogs);

  console.log('✅ All tables have been seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
