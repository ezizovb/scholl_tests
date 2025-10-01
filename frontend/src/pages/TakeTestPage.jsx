import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #18181aff;
  font-size: 1.3rem;
`;

const Timer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #630610ff;
`;

const QuestionContainer = styled.div`
  background: linear-gradient(90deg, #4c86ad8c, #bed1e7dc);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const QuestionImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  display: block;
  margin: 0 auto 15px;
  border-radius: 8px;
`;

const QuestionText = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
`;

const OptionLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 1.4rem;
  transition: transform 0.3s ease-in-out;

  &:hover {
    color: #030252ff;
    transform: scale(1.01);
  }
`;

const OptionInput = styled.input`
  margin-right: 10px;
  background-color: red;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #008a20b4;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background-color: #0ca12ddc;
  }

  &:disabled {
    background-color: #cccccc11;
    cursor: not-allowed;
    border: 1px solid #00000050;
    border-radius: 10px;
  }
`;

const Message = styled.p`
  font-size: 20px;
  text-align: center;
  margin-top: 50px;
`;

const TakeTestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  const storageKey = `test_${testId}_progress`;

  useEffect(() => {
    // Загрузка данных теста и прогресса из localStorage
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      const { savedQuestions, savedAnswers, savedIndex, savedTime } =
        JSON.parse(savedProgress);
      setQuestions(savedQuestions);
      setAnswers(savedAnswers);
      setCurrentQuestionIndex(savedIndex);
      setTimeLeft(savedTime);
      setLoading(false);
    } else {
      fetchQuestions();
    }
  }, [testId]);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    // Таймер и его сохранение в localStorage
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timerId);
          handleSubmitTest(true);
          return 0;
        }

        // Сохраняем прогресс в localStorage каждые 5 секунд
        if (newTime % 5 === 0) {
          saveProgress();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [loading, questions.length]);

  // Сохраняем ответы и текущий вопрос
  useEffect(() => {
    if (questions.length > 0) {
      saveProgress();
    }
  }, [answers, currentQuestionIndex]);

  const saveProgress = () => {
    const progressData = {
      savedQuestions: questions,
      savedAnswers: answers,
      savedIndex: currentQuestionIndex,
      savedTime: timeLeft,
    };
    localStorage.setItem(storageKey, JSON.stringify(progressData));
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/test/${testId}`);
      const shuffledQuestions = response.data.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
      // Сброс таймера и ответов при первом запуске
      setTimeLeft(20 * 60);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Ошибка при получении вопросов:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      handleSubmitTest();
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleSubmitTest = async (isTimeExpired = false) => {
    const finalAnswers = { ...answers };
    questions.forEach((q) => {
      if (!finalAnswers[q.id]) {
        finalAnswers[q.id] = null;
      }
    });

    try {
      const scoreResponse = await axios.post(`${API_BASE_URL}/api/test/score`, {
        test_id: parseInt(testId),
        answers: finalAnswers,
      });
      const score = scoreResponse.data.score;

      const user = JSON.parse(localStorage.getItem("user"));
      const student_id = user.id;

      await axios.post(`${API_BASE_URL}/api/student/submit-test`, {
        student_id,
        test_id: parseInt(testId),
        score,
        answers: finalAnswers,
      });

      // Очистка localStorage после завершения теста
      localStorage.removeItem(storageKey);

      if (isTimeExpired) {
        alert(`Время вышло! Тест завершен. Ваша оценка: ${score}`);
      } else {
        alert(`Тест успешно сдан! Ваша оценка: ${score}`);
      }
      navigate("/student");
    } catch (error) {
      console.error("Ошибка при отправке результатов:", error);
      alert("Ошибка при отправке результатов. Попробуйте снова.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (loading) {
    return <Message>Загрузка вопросов...</Message>;
  }

  if (questions.length === 0) {
    return <Message>В этом тесте пока нет вопросов.</Message>;
  }

  return (
    <Container>
      <Header>
        <Title>Пройти тест</Title>
        <Timer>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Timer>
      </Header>
      <QuestionContainer key={currentQuestion.id}>
        {currentQuestion.image_url && (
          <QuestionImage
            src={`${API_BASE_URL}${currentQuestion.image_url}`}
            alt="Изображение к вопросу"
          />
        )}
        <QuestionText>
          Вопрос {currentQuestionIndex + 1}: {currentQuestion.question_text}
        </QuestionText>
        <div>
          {["a", "b", "c", "d"].map((option) => (
            <OptionLabel key={option}>
              <OptionInput
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleOptionChange(currentQuestion.id, option)}
              />
              {currentQuestion[`option_${option}`]}
            </OptionLabel>
          ))}
        </div>
      </QuestionContainer>
      <Button
        onClick={handleNextQuestion}
        disabled={!answers[currentQuestion.id]}
      >
        {isLastQuestion ? "Завершить тест" : "Ответить"}
      </Button>
    </Container>
  );
};

export default TakeTestPage;
