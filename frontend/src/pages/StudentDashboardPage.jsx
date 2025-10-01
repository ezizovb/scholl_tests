import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const StyledImage = styled.img`
  width: 30%;
  height: auto;
  margin: 0 auto;
`;

const ImageContainer = styled.div`
  padding: 0px;
`;

const Title = styled.h2`
  color: #031138ff;
  margin: 10px 20px;
  text-align: center;
  font-family: sourche;
  font-size: 3vh;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #dde9e06c;
  color: #414040ff;
  border: 1px solid #84f84e2f;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s;
  &:hover {
    background: linear-gradient(90deg, #43ca70a1, #bee7c85d);
    color: #222121ff;
    border: 1px solid #84f84e86;
  }
`;

const TestList = styled.ul`
  list-style: none;
  padding: 20px 20px;
  margin-top: 50px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  background-color: #d2e1f021;
  border: 2px solid #369df136;
`;

const TestItem = styled.li`
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0.1px solid #ffffff1c;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: scale(1.01);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background: linear-gradient(-90deg, #4d8bb485, #bed1e7c4);
    border-radius: 19px;
  }
`;

const TestDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TestTitle = styled.span`
  font-weight: bold;
  font-size: 18px;
`;

const TestDescription = styled.span`
  font-size: 14px;
  color: #3b3737ff;
  margin-top: 5px;
`;

const TakeTestButton = styled(Link)`
  padding: 10px 20px;
  background-color: #f1f1f142;
  color: #0b0e14;
  text-decoration: none;
  border-radius: 12px;
  border: 0.1px solid #0044ff48;
  transition: background-color 0.3s;

  &:hover {
    background: linear-gradient(-45deg, #3b486979, #7aa6f883);
    border-radius: 15px;
    border: 0.1px solid #1a1b1d0e;
    color: #ffffffff;
  }
`;

const Icons = styled.img`
  width: 50px;
  height: 50px;
  margin-right: 10px;
  opacity: 1;
  &:hover {
    opacity: 1;
  }
`;

const StudentDashboardPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "student") {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/student/${user.id}/tests`
        );
        setTests(response.data);
      } catch (err) {
        console.error("Ошибка при получении списка тестов:", err);
        setError("Ошибка при загрузке тестов.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.group_id) {
      fetchTests();
    }
  }, [user, navigate]);

  const handleGoToResults = () => {
    navigate("/student/results");
  };

  if (loading) {
    return <p>Загрузка тестов...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Container>
      <ImageContainer>
        <StyledImage
          src={process.env.PUBLIC_URL + "/icons/user.svg"}
          alt="иконка Учителя"
        />
      </ImageContainer>
      <Title>Кабинет ученика</Title>
      <Title style={{ marginTop: "12px", textAlign: "center" }}>
        {user
          ? `Добро пожаловать, ${user.first_name} ${user.last_name}!`
          : "Загрузка"}
      </Title>
      <ButtonGroup>
        <Button onClick={handleGoToResults}>
          <Icons src={process.env.PUBLIC_URL + "/icons/clipboard-data.svg"} />
          Мои результаты
        </Button>
      </ButtonGroup>

      <TestList>
        <h2
          style={{
            color: "#07175fff",
            fontSize: "1.3rem",
            margin: "20px 10px",
          }}
        >
          Доступные тесты:
        </h2>
        {tests.length > 0 ? (
          tests.map((test) => (
            <TestItem key={test.id}>
              <TestDetails>
                <TestTitle>{test.title}</TestTitle>
                <TestDescription>{test.description}</TestDescription>
              </TestDetails>
              <TakeTestButton to={`/student/take-test/${test.id}`}>
                Пройти тест
              </TakeTestButton>
            </TestItem>
          ))
        ) : (
          <p>Для вашей группы пока нет доступных тестов.</p>
        )}
      </TestList>
    </Container>
  );
};

export default StudentDashboardPage;
