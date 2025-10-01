import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
  color: #162044ff;
  margin-bottom: 20px;
  text-align: center;
  font-family: sourche;
  font-size: 1.4rem;
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #d2e1f02a;
  border-radius: 12px;
`;

const TableHeader = styled.th`
  background-color: #d2e1f079;
  text-align: center;
  color: black;
  padding: 12px;
  text-align: left;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
`;

const TableRow = styled.tr`
  padding: 0;
  &:nth-child(even) {
    background-color: #d2e1f02d;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border: 1px solid #369df105;
  text-align: left;
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

const Message = styled.p`
  text-align: center;
  margin-top: 50px;
  font-size: 18px;
  color: #555;
`;

const InfoIcon = styled.img`
  width: 30px;
  height: 30px;
  opacity: 0.4;
  &:hover {
    opacity: 1;
  }
`;

const StudentResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "student") {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/student/${user.id}/results`
        );
        setResults(response.data);
      } catch (err) {
        console.error("Ошибка при получении результатов:", err);
        setError("Ошибка при загрузке результатов.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  if (loading) {
    return <Message>Загрузка результатов...</Message>;
  }

  if (error) {
    return <Message>{error}</Message>;
  }

  return (
    <Container>
      <BackButton />
      <Title>Мои результаты</Title>
      {results.length > 0 ? (
        <ResultsTable>
          <thead>
            <TableRow>
              <TableHeader>Название теста</TableHeader>
              <TableHeader>Оценка</TableHeader>
              <TableHeader>Дата</TableHeader>
              <TableHeader>Действия</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.title}</TableCell>
                <TableCell>{result.score}</TableCell>
                <TableCell>
                  {new Date(result.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {/* Проверяем, существует ли result.id, прежде чем создавать ссылку */}
                  {result.id ? (
                    <DetailsButton
                      onClick={() => navigate(`/student/results/${result.id}`)}
                    >
                      <InfoIcon
                        title="Подробно"
                        src={process.env.PUBLIC_URL + "/icons/info-circle.svg"}
                      />
                    </DetailsButton>
                  ) : (
                    <div>Нет данных</div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </ResultsTable>
      ) : (
        <Message>Вы ещё не проходили тесты.</Message>
      )}
    </Container>
  );
};

export default StudentResultsPage;
