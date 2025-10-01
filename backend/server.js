// server.js

const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Делаем папку uploads доступной для фронтенда
app.use("/uploads", express.static("uploads"));

// Настраиваем хранилище для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Настройки подключения с использованием пула
const db = mysql.createPool({
  host: "YOUR_DB_HOST", // Например: "localhost"
  user: "YOUR_DB_USER", // Например: "root"
  password: "YOUR_DB_PASSWORD", // Ваш пароль к MySQL
  database: "school_tests",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Проверка подключения (опционально)
(async () => {
  try {
    await db.execute("SELECT 1 + 1 AS solution");
    console.log("Подключение к базе данных успешно установлено.");
  } catch (err) {
    console.error("Ошибка подключения к базе данных:", err.stack);
  }
})();

// --------------------------------------------------------------------------
// Маршруты для аутентификации
// --------------------------------------------------------------------------

// Маршрут для регистрации нового пользователя (ОБНОВЛЕННЫЙ)
app.post("/api/register", async (req, res) => {
  const { username, password, role, first_name, last_name, group_id } =
    req.body;

  if (!username || !password || !role || !first_name || !last_name) {
    return res
      .status(400)
      .json({ message: "Требуются все обязательные поля." });
  }

  try {
    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ message: "Пользователь с таким логином уже существует." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (username, password, role, first_name, last_name, group_id) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, role, first_name, last_name, group_id]
    );

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован!",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для входа пользователя
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Требуется имя пользователя и пароль." });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Неверное имя пользователя или пароль." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.status(200).json({
        message: "Вход выполнен успешно.",
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          group_id: user.group_id, // Добавляем group_id в ответ
        },
      });
    } else {
      res
        .status(401)
        .json({ message: "Неверное имя пользователя или пароль." });
    }
  } catch (err) {
    console.error("Ошибка входа:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// --------------------------------------------------------------------------
// Маршруты для учителей
// --------------------------------------------------------------------------

// Маршрут для получения списка всех групп (НОВЫЙ)
app.get("/api/groups", async (req, res) => {
  try {
    const [groups] = await db.execute(
      "SELECT id, name FROM groups ORDER BY name"
    );
    res.status(200).json(groups);
  } catch (err) {
    console.error("Ошибка при получении списка групп:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для создания новой группы (НОВЫЙ)
app.post("/api/groups", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Требуется название группы." });
  }

  try {
    const [existingGroup] = await db.execute(
      "SELECT id FROM groups WHERE name = ?",
      [name]
    );
    if (existingGroup.length > 0) {
      return res
        .status(409)
        .json({ message: "Группа с таким названием уже существует." });
    }

    await db.execute("INSERT INTO groups (name) VALUES (?)", [name]);
    res.status(201).json({ message: "Группа успешно создана." });
  } catch (err) {
    console.error("Ошибка при создании группы:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для создания теста (ИСПРАВЛЕН)
app.post("/api/teacher/create-test", async (req, res) => {
  const { title, description, teacherId, groupId } = req.body;

  if (!title || !description || !teacherId || !groupId) {
    return res.status(400).json({ message: "Все поля должны быть заполнены." });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO tests (title, description, teacher_id) VALUES (?, ?, ?)",
      [title, description, teacherId]
    );
    const newTestId = result.insertId;

    // Добавляем запись в новую таблицу group_test_relations (ИСПРАВЛЕНО)
    await db.execute(
      "INSERT INTO group_test_relations (test_id, group_id) VALUES (?, ?)",
      [newTestId, groupId]
    );

    res.status(201).json({
      message: "Тест успешно создан!",
      testId: newTestId,
    });
  } catch (err) {
    console.error("Ошибка при создании теста:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для добавления вопроса к тесту (ОБНОВЛЕННЫЙ)
app.post(
  "/api/teacher/add-question",
  upload.single("image"),
  async (req, res) => {
    const {
      test_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (
      !test_id ||
      !question_text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_answer
    ) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Требуются все поля вопроса." });
    }

    try {
      const values = [
        test_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        image_url,
      ];
      const [result] = await db.execute(
        "INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        values
      );
      res.status(201).json({
        message: "Вопрос успешно добавлен!",
        question_id: result.insertId,
      });
    } catch (err) {
      console.error("Ошибка при добавлении вопроса:", err);
      res.status(500).json({ message: "Ошибка сервера." });
    }
  }
);

// Маршрут для получения всех тестов для конкретного учителя
app.get("/api/teacher/:teacherId/tests", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [results] = await db.execute(
      "SELECT id, title FROM tests WHERE teacher_id = ?",
      [teacherId]
    );
    res.status(200).json(results);
  } catch (err) {
    console.error("Ошибка при получении списка тестов для учителя:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для получения всех результатов для конкретного учителя (ИСПРАВЛЕНО)
app.get("/api/teacher/:teacherId/results", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const query = `
      SELECT
        r.id,
        r.student_id,  -- ДОБАВЛЕНО
        r.test_id,     -- ДОБАВЛЕНО
        u.first_name,
        u.last_name,
        t.title AS test_title,
        r.score,
        r.timestamp
      FROM results r
      JOIN users u ON r.student_id = u.id
      JOIN tests t ON r.test_id = t.id
      WHERE t.teacher_id = ?
      ORDER BY r.timestamp DESC
    `;
    const [results] = await db.execute(query, [teacherId]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Ошибка при получении результатов для учителя:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Если вы также используете этот маршрут, исправьте его
app.get("/api/teacher/results", async (req, res) => {
  try {
    const query = `
      SELECT
        r.id,
        r.student_id,  -- ДОБАВЛЕНО
        r.test_id,     -- ДОБАВЛЕНО
        u.first_name,
        u.last_name,
        t.title AS test_title,
        r.score,
        r.timestamp
      FROM results r
      JOIN users u ON r.student_id = u.id
      JOIN tests t ON r.test_id = t.id
      ORDER BY r.timestamp DESC
    `;
    const [results] = await db.execute(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Ошибка при получении результатов для учителя:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// --------------------------------------------------------------------------
// Маршруты для учеников
// --------------------------------------------------------------------------

// Маршрут для получения тестов, доступных для группы ученика (ИСПРАВЛЕНО)
app.get("/api/student/:studentId/tests", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [user] = await db.execute("SELECT group_id FROM users WHERE id = ?", [
      studentId,
    ]);
    if (user.length === 0) {
      return res.status(404).json({ message: "Ученик не найден." });
    }
    const studentGroupId = user[0].group_id;

    if (!studentGroupId) {
      return res.json([]);
    }

    // ИСПРАВЛЕННЫЙ ЗАПРОС
    const [tests] = await db.execute(
      `
      SELECT t.id, t.title, t.description 
      FROM tests t
      JOIN group_test_relations tg ON t.id = tg.test_id
      WHERE tg.group_id = ?
      AND t.id NOT IN (
        SELECT test_id FROM results WHERE student_id = ?
      )
      `,
      [studentGroupId, studentId]
    );

    res.json(tests);
  } catch (err) {
    console.error("Ошибка при получении тестов для ученика:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для получения вопросов для теста (НОВЫЙ)
app.get("/api/test/:testId", async (req, res) => {
  const { testId } = req.params;

  try {
    const [questions] = await db.execute(
      "SELECT id, question_text, image_url, option_a, option_b, option_c, option_d FROM questions WHERE test_id = ?",
      [testId]
    );

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "Вопросы для этого теста не найдены." });
    }

    res.json(questions);
  } catch (err) {
    console.error("Ошибка при получении вопросов:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для вычисления оценки теста на бэкенде
app.post("/api/test/score", async (req, res) => {
  const { test_id, answers } = req.body;

  if (!test_id) {
    return res.status(400).json({ message: "Требуется ID теста." });
  }

  try {
    const [rows] = await db.execute(
      "SELECT id, correct_answer FROM questions WHERE test_id = ?",
      [test_id]
    );

    let score = 0;
    const correctAnswers = {};
    rows.forEach((row) => {
      correctAnswers[row.id] = row.correct_answer;
    });

    if (answers) {
      for (const questionId in answers) {
        if (
          correctAnswers[questionId] &&
          correctAnswers[questionId] === answers[questionId]
        ) {
          score++;
        }
      }
    }

    res.status(200).json({ score });
  } catch (err) {
    console.error("Ошибка при подсчете оценки:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

app.post("/api/student/submit-test", async (req, res) => {
  const { student_id, test_id, score, answers } = req.body;

  if (!student_id || !test_id || score === undefined || !answers) {
    return res
      .status(400)
      .json({ message: "Требуются все данные для сохранения результата." });
  }

  try {
    const deleteQuery =
      "DELETE FROM results WHERE student_id = ? AND test_id = ?";
    await db.execute(deleteQuery, [student_id, test_id]);

    const insertQuery =
      "INSERT INTO results (student_id, test_id, score, answers) VALUES (?, ?, ?, ?)";
    const values = [student_id, test_id, score, JSON.stringify(answers)];
    const [result] = await db.execute(insertQuery, values);

    res.status(201).json({
      message: "Результаты успешно сохранены!",
      result_id: result.insertId,
    });
  } catch (err) {
    console.error("Ошибка при сохранении результатов:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для получения результатов ученика (ИСПРАВЛЕНО)
app.get("/api/student/:studentId/results", async (req, res) => {
  const { studentId } = req.params;

  try {
    const query =
      "SELECT r.id, r.score, r.timestamp, t.title FROM results r JOIN tests t ON r.test_id = t.id WHERE r.student_id = ?";
    const [results] = await db.execute(query, [studentId]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Ошибка при получении результатов:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

app.get("/api/teacher/results", async (req, res) => {
  try {
    const query = `
      SELECT
        r.id,
        u.first_name,
        u.last_name,
        t.title AS test_title,
        r.score,
        r.timestamp
      FROM results r
      JOIN users u ON r.student_id = u.id
      JOIN tests t ON r.test_id = t.id
      ORDER BY r.timestamp DESC
    `;
    const [results] = await db.execute(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Ошибка при получении результатов для учителя:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для получения деталей результатов теста для ученика
// Маршрут для получения деталей результатов теста для ученика (ИСПРАВЛЕНО)
app.get("/api/student/results/:resultId", async (req, res) => {
  const { resultId } = req.params;
  try {
    const [resultRows] = await db.execute(
      "SELECT id, student_id, test_id, score, answers FROM results WHERE id = ?",
      [resultId]
    );

    if (resultRows.length === 0) {
      return res.status(404).json({ message: "Результат не найден." });
    }
    const result = resultRows[0];

    const [testRows] = await db.execute(
      "SELECT title FROM tests WHERE id = ?",
      [result.test_id]
    );
    const testTitle =
      testRows.length > 0 ? testRows[0].title : "Неизвестный тест";

    // Здесь мы добавили все варианты ответов
    const [questionRows] = await db.execute(
      "SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE test_id = ?",
      [result.test_id]
    );

    const studentAnswers = JSON.parse(result.answers);

    const detailedResult = {
      test_title: testTitle,
      score: result.score,
      answers: studentAnswers,
      questions: questionRows,
    };

    res.json(detailedResult);
  } catch (err) {
    console.error("Ошибка при получении деталей результата:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Маршрут для удаления теста и всех его вопросов
app.delete("/api/teacher/delete-test/:testId", async (req, res) => {
  const { testId } = req.params;

  try {
    await db.execute("DELETE FROM group_test_relations WHERE test_id = ?", [
      testId,
    ]);
    await db.execute("DELETE FROM questions WHERE test_id = ?", [testId]);
    const [result] = await db.execute("DELETE FROM tests WHERE id = ?", [
      testId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Тест не найден." });
    }

    res
      .status(200)
      .json({ message: "Тест и все его вопросы успешно удалены." });
  } catch (err) {
    console.error("Ошибка при удалении теста:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для удаления вопроса
app.delete("/api/teacher/delete-question/:questionId", async (req, res) => {
  const { questionId } = req.params;

  try {
    const [result] = await db.execute("DELETE FROM questions WHERE id = ?", [
      questionId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Вопрос не найден." });
    }
    res.status(200).json({ message: "Вопрос успешно удалён." });
  } catch (err) {
    console.error("Ошибка при удалении вопроса:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для получения данных одного вопроса
app.get("/api/teacher/question/:questionId", async (req, res) => {
  const { questionId } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT *, image_url FROM questions WHERE id = ?",
      [questionId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Вопрос не найден." });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Ошибка при получении вопроса:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для изменения вопроса
app.put("/api/teacher/edit-question/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
  } = req.body;

  if (
    !question_text ||
    !option_a ||
    !option_b ||
    !option_c ||
    !option_d ||
    !correct_answer
  ) {
    return res.status(400).json({ message: "Требуются все поля вопроса." });
  }

  try {
    const values = [
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      questionId,
    ];
    const [result] = await db.execute(
      "UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=? WHERE id=?",
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Вопрос не найден." });
    }

    res.status(200).json({ message: "Вопрос успешно обновлён." });
  } catch (err) {
    console.error("Ошибка при обновлении вопроса:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// Маршрут для получения подробных результатов по ID результата
app.get("/api/teacher/result/:resultId/details", async (req, res) => {
  const { resultId } = req.params;

  try {
    const query = `
      SELECT
        r.id,
        r.student_id,
        r.test_id,
        r.score,
        r.answers,
        r.timestamp,
        t.title AS test_title,
        u.first_name,
        u.last_name
      FROM results r
      JOIN tests t ON r.test_id = t.id
      JOIN users u ON r.student_id = u.id
      WHERE r.id = ?
    `;
    const [resultDetails] = await db.execute(query, [resultId]);

    if (resultDetails.length === 0) {
      return res.status(404).json({ message: "Результат не найден." });
    }

    const result = resultDetails[0];

    if (!result.answers || typeof result.answers !== "string") {
      return res
        .status(400)
        .json({ message: "Некорректные данные об ответах." });
    }

    const studentAnswers = JSON.parse(result.answers);
    const questionIds = Object.keys(studentAnswers);

    let questions = [];

    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(", ");

      const questionsQuery = `
        SELECT
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer
        FROM questions
        WHERE id IN (${placeholders})
      `;
      [questions] = await db.execute(questionsQuery, questionIds);
    }

    const detailedResult = {
      ...result,
      student_answers: studentAnswers,
      questions: questions.map((q) => {
        const studentAnswer = studentAnswers[q.id];
        const isCorrect = studentAnswer === q.correct_answer;
        return {
          id: q.id,
          question_text: q.question_text,
          options: {
            a: q.option_a,
            b: q.option_b,
            c: q.option_c,
            d: q.option_d,
          },
          correct_answer: q.correct_answer,
          student_answer: studentAnswer,
          is_correct: isCorrect,
        };
      }),
    };

    res.status(200).json(detailedResult);
  } catch (err) {
    console.error("Ошибка при получении детальных результатов:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});
// Маршрут для сброса теста для ученика
app.delete("/api/teacher/reset-test/:studentId/:testId", async (req, res) => {
  const { studentId, testId } = req.params;
  try {
    const [result] = await db.execute(
      "DELETE FROM results WHERE student_id = ? AND test_id = ?",
      [studentId, testId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Результат теста не найден, сброс не требуется.",
      });
    }

    res.status(200).json({
      message: "Разрешение на повторное прохождение успешно выдано.",
    });
  } catch (err) {
    console.error("Ошибка при сбросе теста:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// --------------------------------------------------------------------------
// Запуск сервера
// --------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
