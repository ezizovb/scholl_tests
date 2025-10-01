import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Добавлен импорт Link
import GlobalStyles from "../components/GlobalStyles";

const API_BASE_URL = "http://localhost:3000";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(45deg, #001f3f 0%, #17a2b8 50%, #6a5acd 100%);
  font-family: Arial, sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 40px 40px;
  background-color: #d2e1f027;

  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #369df136;
  min-width: 300px;
  transition: transform 0.5s ease-in-out;
  &:hover {
    transform: scale(1.05);
    background-color: #d2e1f04f;
  }
`;

const Title = styled.h2`
  color: #031349ff;
  margin-bottom: 24px;
  text-align: center;
  font-family: "souche";
  font-size: 2rem;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 16px;
  border: none;
  outline: none;
  width: 100%;
  border-radius: 15px;
  font-size: 16px;
  border: 0.1px solid #ffffff63;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  &::placeholder {
    color: #5e5555ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 12px;
  background-color: #007bff79;
  border: 1px solid rgba(91, 91, 199, 0.21);
  color: #362f2fff;
  border-radius: 30px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(45deg, #295ff3ad, #ffffff81);
    transform: scale(1.05);
    border-radius: 35px;
  }
`;

const StyledLink = styled(Link)`
  text-align: center;
  padding-top: 15px;
  color: #04570fff;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s ease-in-out;
  &:hover {
    transform: scale(1.05);
  }
`;

const ErrorMessage = styled.p`
  color: #d9534f;
  text-align: center;
  margin-top: 10px;
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const EyeIcon = styled.img`
  position: absolute;
  right: 12px;
  top: 40%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Icons = styled.img`
  width: 25px;
  height: 25px;
  opacity: 0.5;
  margin-left: 7px;
  opacity: 0.6;
  &:hover {
    opacity: 1;
  }
`;

const LoginPage = ({ setLoggedInUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password,
      });

      const { user } = response.data;

      // Сохраняем данные пользователя (например, в localStorage)
      localStorage.setItem("user", JSON.stringify(user));

      // Обновляем состояние в родительском компоненте
      if (setLoggedInUser) {
        setLoggedInUser(user);
      }

      // Перенаправляем на дашборд в зависимости от роли
      if (user.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Ошибка входа. Попробуйте снова."
      );
    }
  };

  return (
    <Container>
      <GlobalStyles />
      <Form onSubmit={handleSubmit}>
        <Title>Вход</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <PasswordContainer>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <EyeIcon
            src={
              showPassword ? "/icons/eye-fill.svg" : "/icons/eye-slash-fill.svg"
            }
            alt="toggle password visibility"
            onClick={() => setShowPassword(!showPassword)}
          />
        </PasswordContainer>
        <ButtonGroup>
          <StyledButton type="submit">
            Войти
            <Icons src={"/icons/box-arrow-right.svg"} />
          </StyledButton>
        </ButtonGroup>
        <StyledLink to="/register">Регистрация</StyledLink>
      </Form>
    </Container>
  );
};

export default LoginPage;
