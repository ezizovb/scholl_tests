**SQL-скрипт для создания всех таблиц:**

```SQL
-- Удаляем базу данных, если она существует, чтобы начать с чистого листа
DROP DATABASE IF EXISTS school_tests;

-- Создаем новую базу данных
CREATE DATABASE school_tests CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Используем новую базу данных
USE school_tests;

-- Таблица для пользователей (учителей и учеников)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  group_id INT
);

-- Таблица для групп
CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Таблица для тестов
CREATE TABLE tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id INT,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица для вопросов
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT,
  question_text TEXT NOT NULL,
  image_url VARCHAR(255),
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_answer CHAR(1) NOT NULL,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Таблица для связи тестов и групп
CREATE TABLE group_test_relations (
  test_id INT,
  group_id INT,
  PRIMARY KEY (test_id, group_id),
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Таблица для результатов
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  test_id INT,
  score INT NOT NULL,
  answers JSON,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

```