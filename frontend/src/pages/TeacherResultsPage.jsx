import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";

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
  color: #162044ff;
  margin-bottom: 20px;
  text-align: center;
  font-family: sourche;
  font-size: 1.4rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #d2e1f02a;
  border-radius: 12px;
`;

const TableHeader = styled.thead`
  background-color: #d2e1f079;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #d2e1f02d;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border: 1px solid #369df105;
  text-align: left;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  border-bottom: 1px solid #d2e1f079;
  text-align: center;
  font-weight: bold;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
`;

const Buttons = styled.div`
  display: flex;
`;

const DetailsButton = styled.button`
  padding: 8px 10px;
  margin-left: 20px;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  color: #fff;
  border: 1px solid #5a57e0a2;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  &:hover {
    background: linear-gradient(45deg, #697aa881, #ffffff81);
    border: 1px solid #0703ff70;
  }
`;

const ResetButton = styled.button`
  padding: 8px 10px;
  background: linear-gradient(90deg, #ad674c31, #e7cabe5d);
  color: white;
  border: 1px solid #e07757a2;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 10px;
  transition: background-color 0.3s;
  &:hover {
    background: linear-gradient(45deg, #aa5d5d81, #ffffff81);
    border: 1px solid #ff290370;
  }
`;

const InfoIcon = styled.img`
  width: 30px;
  height: 30px;
  opacity: 1;
  &:hover {
    opacity: 1;
  }
`;

const TeacherResultsPage = () => {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/teacher/results`);
      setResults(response.data);
    } catch (error) {
      console.error("Ошибка при получении результатов для учителя:", error);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleResetTest = async (studentId, testId) => {
    try {
      const confirmReset = window.confirm(
        "Вы уверены, что хотите разрешить ученику повторно пройти этот тест? Это удалит предыдущий результат."
      );
      if (!confirmReset) {
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/teacher/reset-test/${studentId}/${testId}`
      );
      alert("Разрешение на повторное прохождение успешно выдано.");
      fetchResults(); // Обновляем список, чтобы результат исчез
    } catch (err) {
      console.error("Ошибка при сбросе теста:", err);
      alert("Не удалось сбросить тест. Возможно, он уже был сброшен.");
    }
  };

  return (
    <Container>
      <BackButton />
      <Title>Успеваемость учеников</Title>
      {results.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Имя ученика</TableHeaderCell>
              <TableHeaderCell>Название теста</TableHeaderCell>
              <TableHeaderCell>Оценка</TableHeaderCell>
              <TableHeaderCell>Дата сдачи</TableHeaderCell>
              <TableHeaderCell>Действия</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <tbody>
            {results.map((result, index) => (
              <TableRow key={result.id}>
                <TableCell>{`${result.first_name} ${result.last_name}`}</TableCell>
                <TableCell>{result.test_title}</TableCell>
                <TableCell>{result.score}</TableCell>
                <TableCell>{formatDate(result.timestamp)}</TableCell>
                <TableCell>
                  <Buttons>
                    <DetailsButton
                      onClick={() =>
                        navigate(`/teacher/results/${result.id}/details`)
                      }
                    >
                      <InfoIcon
                        src={process.env.PUBLIC_URL + "/icons/info-circle.svg"}
                      />
                    </DetailsButton>
                    <ResetButton
                      onClick={() =>
                        handleResetTest(result.student_id, result.test_id)
                      }
                    >
                      <InfoIcon
                        src={process.env.PUBLIC_URL + "/icons/reply.svg"}
                      />
                    </ResetButton>
                  </Buttons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Пока нет результатов для отображения.</p>
      )}
    </Container>
  );
};

export default TeacherResultsPage;
