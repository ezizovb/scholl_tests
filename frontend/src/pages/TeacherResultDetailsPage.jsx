import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams } from "react-router-dom";
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
  transition: transform 0.3s ease-in-out;

  //   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  //   border: 1px solid ${(props) =>
    props.isCorrect ? "#24d424ff" : "#dc3545"};
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

const TeacherResultDetailsPage = () => {
  const { resultId } = useParams();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetchResultDetails();
  }, [resultId]);

  const fetchResultDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/teacher/result/${resultId}/details`
      );
      setDetails(response.data);
    } catch (error) {
      console.error("Ошибка при получении деталей:", error);
    }
  };

  if (!details) {
    return (
      <Container>
        <p>Загрузка данных...</p>
      </Container>
    );
  }

  const getOptionLetter = (options, value) => {
    return Object.keys(options).find((key) => options[key] === value);
  };

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
          Ученик:{" "}
          <InfoBoxText>
            {details.first_name} {details.last_name}
          </InfoBoxText>
        </InfoBoxTitle>
        <InfoBoxTitle>
          Тест: <InfoBoxText>{details.test_title}</InfoBoxText>
        </InfoBoxTitle>
        <InfoBoxTitle>
          Оценка:{" "}
          <InfoBoxText>
            {details.score} / {details.questions.length}
          </InfoBoxText>
        </InfoBoxTitle>
        <InfoBoxTitle>
          Дата сдачи:{" "}
          <InfoBoxText>
            {new Date(details.timestamp).toLocaleString()}
          </InfoBoxText>
        </InfoBoxTitle>
      </InfoBox>
      {details.questions.map((q) => (
        <QuestionContainer key={q.id} isCorrect={q.is_correct}>
          <QuestionText>Вопрос: {q.question_text}</QuestionText>
          <AnswerText isCorrect={q.is_correct}>
            Ваш ответ: {optionLetters[q.student_answer]}){" "}
            {q.options[q.student_answer]}
          </AnswerText>
          {!q.is_correct && (
            <CorrectAnswerText>
              Правильный ответ: {optionLetters[q.correct_answer]}){" "}
              {q.options[q.correct_answer]}
            </CorrectAnswerText>
          )}
        </QuestionContainer>
      ))}
    </Container>
  );
};

export default TeacherResultDetailsPage;
