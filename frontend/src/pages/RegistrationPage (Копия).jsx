import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";

const API_BASE_URL = "http://localhost:3000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const FormContainer = styled.div`
  background-color: #d2e1f02d;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin-left: 30px;
  transition: background-color 0.3s, transform 0.3s ease-in-out;
  color: #555;
  &:hover {
    transform: scale(1.01);
    background-color: #d2e1f04f;
    color: black;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #0e0d0dff;
  margin-bottom: 20px;
  font-family: sourche;
  font-size: 1.4rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ffffff63;
  border-radius: 12px;
  outline: none;
  font-size: 16px;
  &::placeholder {
    color: #5e5555ff;
  }
`;

const Select = styled.select`
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ffffff63;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
`;

const Option = styled.option`
  background-color: #d0f2f3ff;
  color: darkblue;
  padding: 5px 10px;
  border: 1px solid #ffffff63;
`;

const Button = styled.button`
  padding: 12px;
  background: linear-gradient(95deg, #1750ec81, #677caa81);
  color: #030303ff;
  border: 0.1px solid #ffffff63;
  cursor: pointer;
  font-size: 18px;
  margin-top: 15px;
  transition: background-color 3s;
  border-radius: 15px;
  &:hover {
    background: linear-gradient(50deg, #341ca1a6, #0a6ddf5d);
    color: #ffffffff;
  }
`;

const Message = styled.p`
  text-align: center;
  margin-top: 15px;
  color: ${(props) => (props.type === "error" ? "red" : "green")};
`;

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
    group_id: "",
  });
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`);
      setGroups(response.data);
      // Устанавливаем group_id только после получения групп
      if (response.data.length > 0) {
        setFormData((prevData) => ({
          ...prevData,
          group_id: response.data[0].id,
        }));
      }
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      if (formData.role === "student" && !formData.group_id) {
        setMessage("Пожалуйста, выберите группу для ученика.");
        setMessageType("error");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/register`,
        formData
      );
      setMessage("Регистрация прошла успешно!");
      setMessageType("success");
      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "student",
        group_id: groups.length > 0 ? groups[0].id : "",
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Ошибка при регистрации.");
      setMessageType("error");
    }
  };

  return (
    <Container>
      <div
        style={{ width: "800px", display: "flex", justifyContent: "center" }}
      >
        <BackButton />

        <FormContainer>
          <Title>Регистрация</Title>
          <Form onSubmit={handleSubmit}>
            <Label>Имя</Label>
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Label>Фамилия</Label>
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <Label>Логин</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Label>Пароль</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Label>Роль</Label>
            <Select name="role" value={formData.role} onChange={handleChange}>
              <Option value="student">Ученик</Option>
              <Option disabled style={{ color: "#55525250" }} value="teacher">
                Учитель
              </Option>
            </Select>
            {formData.role === "student" && (
              <>
                <Label>Группа</Label>
                <Select
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                  required
                >
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id}>
                      {group.name}
                    </Option>
                  ))}
                </Select>
              </>
            )}
            <Button type="submit">Зарегистрироваться</Button>
          </Form>
          {message && <Message type={messageType}>{message}</Message>}
          {/* <p style={{ textAlign: "center", marginTop: "15px" }}>
            Уже есть аккаунт? <Link to="/">Войти</Link>
          </p> */}
        </FormContainer>
      </div>
    </Container>
  );
};

export default RegistrationPage;
