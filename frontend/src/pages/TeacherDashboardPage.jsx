import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlobalStyles from "../components/GlobalStyles";
import { Link } from "react-router-dom";

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
  max-width: 30%;
  height: auto;
  margin: 0 auto;
`;

const ImageContainer = styled.div`
  padding: 0px;
`;

const Title = styled.h2`
  color: #333;
  margin: 10px 20px;
  text-align: center;
  font-family: sourche;
`;
const Header = styled.div`
  margin: 30px 0px;
  font-size: 3vh;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const Button = styled.button`
  display: flex;
  padding: 10px 20px;
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

const TextAb = styled.p`
  color: darkblue;
  margin: 20px auto;
  text-align: center;
  font-size: 1.1rem;
`;

const TestList = styled.ul`
  list-style: none;
  padding: 20px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  background-color: #d2e1f04f;
  border: 2px solid #369df136;
`;

const TestItem = styled.li`
  padding: 15px;
  border-radius: 12px;
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
    background: linear-gradient(90deg, #4d8bb485, #bed1e7c4);
  }
`;

const TestActions = styled.div`
  display: flex;
  gap: 10px;
`;

const TestActionButton = styled.button`
  padding: 7px 9px;
  background-color: #f1f1f110;
  border-radius: 55%;
  cursor: pointer;
  font-size: 14px;
  border: 0.1px solid #0044ff10;

  &:hover {
    background: linear-gradient(45deg, #ffbb00b4, #fdf07a81);
    border: 1px solid #f8e91779;
  }
`;

const Icons = styled.img`
  width: 50px;
  height: 50px;
  opacity: 1;
  &:hover {
    opacity: 1;
  }
`;

const DeleteButton = styled(TestActionButton)`
  &:hover {
    background: linear-gradient(45deg, #ff1e00ab, #f38c8c81);
    border: 1px solid #f8171779;
  }
`;

const TeacherDashboardPage = () => {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "teacher") {
      setTeacherId(user.id);
    }
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchTests();
      fetchResults();
    }
  }, [teacherId]);

  const fetchTests = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/teacher/${teacherId}/tests`
      );
      setTests(response.data);
    } catch (error) {
      console.error("Ошибка при получении списка тестов:", error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/teacher/${teacherId}/results`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Ошибка при получении результатов:", error);
    }
  };

  //   const fetchTests = async () => {
  //     try {
  //       const response = await axios.get(`${API_BASE_URL}/api/tests`);
  //       setTests(response.data);
  //     } catch (error) {
  //       console.error("Ошибка при получении тестов:", error);
  //     }
  //   };

  const handleDeleteTest = async (testId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот тест?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/teacher/delete-test/${testId}`);
        alert("Тест успешно удалён!");
        fetchTests(); // Обновляем список тестов
      } catch (error) {
        console.error("Ошибка при удалении теста:", error);
        alert("Ошибка при удалении теста.");
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Container>
      <Header>
        <ImageContainer>
          <StyledImage
            src={process.env.PUBLIC_URL + "/icons/teacherGlass.png"}
            alt="иконка Учителя"
          />
        </ImageContainer>
        <Title>Панель учителя</Title>
        <Title>
          {user
            ? `Добро пожаловать, ${user.first_name} ${user.last_name}!`
            : "Загрузка..."}
        </Title>
      </Header>
      <ButtonGroup>
        <Button onClick={() => navigate("/teacher/results")}>
          <Icons
            style={{ marginRight: "7px" }}
            src={process.env.PUBLIC_URL + "/icons/clipboard-data.svg"}
          />
          Посмотреть успеваемость
        </Button>

        <Button onClick={() => navigate("/teacher/create-test")}>
          <Icons
            style={{ marginRight: "7px" }}
            src={process.env.PUBLIC_URL + "/icons/pencil-square.svg"}
          />
          Создать новый тест
        </Button>

        <Button onClick={() => navigate("/teacher/create-group")}>
          <Icons src={process.env.PUBLIC_URL + "/icons/people.svg"} />
          Создать группу
        </Button>
      </ButtonGroup>
      <TestList>
        <TextAb>Доступные тесты для учеников:</TextAb>
        {tests.length > 0 ? (
          tests.map((test) => (
            <TestItem key={test.id}>
              <span>{test.title}</span>
              <TestActions>
                <TestActionButton
                  title="Изменит"
                  onClick={() => navigate(`/teacher/edit-test/${test.id}`)}
                >
                  <Icons
                    style={{ width: "25px", height: "25px" }}
                    src={process.env.PUBLIC_URL + "/icons/pencil.svg"}
                  />
                </TestActionButton>
                <DeleteButton
                  title="Удалить"
                  onClick={() => handleDeleteTest(test.id)}
                >
                  <Icons
                    style={{ width: "25px", height: "25px" }}
                    src={process.env.PUBLIC_URL + "/icons/trash3.svg"}
                  />
                </DeleteButton>
              </TestActions>
            </TestItem>
          ))
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "black",
              margin: "15px",
            }}
          >
            Пока нет созданных тестов.
          </p>
        )}
      </TestList>
    </Container>
  );
};

export default TeacherDashboardPage;
