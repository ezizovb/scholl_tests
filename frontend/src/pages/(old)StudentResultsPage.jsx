import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import BackButton from "../components/BackButton";

const API_BASE_URL = "http://localhost:3000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ResultItem = styled.li`
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Score = styled.span`
  font-weight: bold;
  color: #28a745;
`;

const StudentResultsPage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || user.role !== "student") {
        return;
      }

      const studentId = user.id;
      const response = await axios.get(
        `${API_BASE_URL}/api/student/${studentId}/results`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Ошибка при получении результатов:", error);
    }
  };

  return (
    <Container>
      <BackButton />
      <Title>Мои результаты</Title>
      <ResultsList>
        {results.length > 0 ? (
          results.map((result, index) => (
            <ResultItem key={index}>
              <span>{result.title}</span>
              <Score>Оценка: {result.score}</Score>
            </ResultItem>
          ))
        ) : (
          <p>Вы пока не прошли ни одного теста.</p>
        )}
      </ResultsList>
    </Container>
  );
};

export default StudentResultsPage;
