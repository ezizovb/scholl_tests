import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const API_BASE_URL = "http://localhost:3000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  font-family: Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #14152eff;
  margin-bottom: 20px;
  text-align: center;
  font-family: sourche;
  font-size: 1.3rem;
`;

const InfoBox = styled.div`
  background: #62aceeb2;
  border-left: 7px solid #007bffc9;
  padding: 15px;
  margin-bottom: 20px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  font-size: 16px;
  line-height: 1.5;
`;

const InfoBoxTitle = styled.div`
  color: black;
  font-weight: bold;
`;

const InfoBoxText = styled.span`
  color: #00109ef1;
  font-weight: normal;
`;
const QuestionContainer = styled.div`
  background-color: #d2e1f083;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;

  transition: transform 0.3s ease-in-out;
  box-shadow: 0px 4px 8px
    ${(props) => (props.isCorrect ? "#24d424ff" : "#dc3545")};
  &:hover {
    transform: scale(1.02);
  }
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const AnswerText = styled.p`
  font-size: 16px;
  margin-bottom: 5px;
  color: ${(props) => (props.isCorrect ? "#047a20ff" : "#dc3545")};
  font-weight: ${(props) => (props.isCorrect ? "bold" : "normal")};
`;

const CorrectAnswerText = styled.p`
  font-size: 16px;
  margin-top: 10px;
  color: #03791eff;
  font-weight: bold;
`;

const StudentResultDetailsPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResultDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "student") {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          `${API_BASE_URL}/api/student/results/${resultId}`
        );
        setDetails(response.data);
      } catch (err) {
        console.error("Ошибка при получении деталей результатов:", err);
        setError("Не удалось загрузить детали результатов.");
      } finally {
        setLoading(false);
      }
    };
    fetchResultDetails();
  }, [resultId, navigate]);

  if (loading) {
    return <p>Загрузка данных...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!details) {
    return (
      <Container>
        <p>Результат не найден.</p>
      </Container>
    );
  }

  const optionLetters = {
    a: "А",
    b: "Б",
    c: "В",
    d: "Г",
  };

  return (
    <Container>
      <BackButton />
      <Title>Подробный отчёт</Title>
      <InfoBox>
        <InfoBoxTitle>
          Тест: <InfoBoxText>{details.test_title}</InfoBoxText>
        </InfoBoxTitle>
        <InfoBoxTitle>
          Оценка:{" "}
          <InfoBoxText>
            {details.score} / {details.questions.length}
          </InfoBoxText>
        </InfoBoxTitle>
      </InfoBox>
      {details.questions.map((q) => {
        const studentAnswerLetter = details.answers[q.id];
        const isCorrect = studentAnswerLetter === q.correct_answer;
        const studentAnswerText = q[`option_${studentAnswerLetter}`];
        const correctAnswerText = q[`option_${q.correct_answer}`];

        return (
          <QuestionContainer key={q.id} isCorrect={isCorrect}>
            <QuestionText>Вопрос: {q.question_text}</QuestionText>
            <AnswerText isCorrect={isCorrect}>
              Ваш ответ: {optionLetters[studentAnswerLetter]}){" "}
              {studentAnswerText || "Нет ответа"}
            </AnswerText>
            {!isCorrect && (
              <CorrectAnswerText>
                Правильный ответ: {optionLetters[q.correct_answer]}){" "}
                {correctAnswerText}
              </CorrectAnswerText>
            )}
          </QuestionContainer>
        );
      })}
    </Container>
  );
};

export default StudentResultDetailsPage;
