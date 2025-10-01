import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const API_BASE_URL = "http://localhost:3000";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 30px;
  background-color: #d2e1f04f;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border: 0.1px solid #ffffff63;
  border-radius: 15px;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  outline: none;
`;

const Select = styled.select`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 7px;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  outline: none;
`;

const Option = styled.option`
  background-color: #d0f2f3ff;
  color: darkblue;
  padding: 5px 10px;
  outline: none;
  border: 1px solid #ffffff63;
`;

const Textarea = styled.textarea`
  padding: 10px;
  margin-bottom: 15px;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  outline: none;
  border: 0.1px solid #ffffff63;
  border-radius: 15px;
  resize: vertical;
  min-height: 100px;
`;

const Button = styled.button`
  padding: 12px;
  background: linear-gradient(95deg, #1750ec81, #677caa81);
  color: #030303ff;
  border: 0.1px solid #ffffff63;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 3s;
  margin-bottom: 20px;
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

const CreateTestPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error("Ошибка при получении списка групп:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const user = JSON.parse(localStorage.getItem("user"));
    const teacherId = user ? user.id : null;

    if (!teacherId) {
      setMessage("Ошибка: Войдите в систему как учитель.");
      setMessageType("error");
      return;
    }

    // Проверяем, что все поля заполнены
    if (!title || !description || !selectedGroupId) {
      setMessage("Пожалуйста, заполните все поля.");
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/teacher/create-test`,
        {
          title,
          description,
          teacherId,
          groupId: selectedGroupId,
        }
      );

      setMessage("Тест успешно создан!");
      setMessageType("success");
      setTimeout(() => {
        navigate(`/teacher/add-question/${response.data.testId}`);
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Ошибка при создании теста.");
      setMessageType("error");
    }
  };

  return (
    <Container>
      <BackButton />
      <Title>Создать новый тест</Title>
      <Form onSubmit={handleSubmit}>
        <Label>Название теста</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Label>Описание теста</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Label>Выберите группу</Label>
        <Select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          required
        >
          <Option style={{ color: "gray" }} value="" disabled>
            Выберите группу
          </Option>
          {groups.map((group) => (
            <Option key={group.id} value={group.id}>
              {group.name}
            </Option>
          ))}
        </Select>
        <Button type="submit">Создать тест</Button>
      </Form>
      {message && <Message type={messageType}>{message}</Message>}
    </Container>
  );
};

export default CreateTestPage;
