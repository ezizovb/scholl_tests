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
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-family: sourche;
  font-size: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 30px;
  background-color: #d2e1f04f;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 10px;
  border: 0.1px solid #ffffff63;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  outline: none;
  &::placeholder {
    color: #3333338c;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: linear-gradient(95deg, #1750ec81, #677caa81);
  color: #030303ff;
  border: 0.1px solid #ffffff63;
  cursor: pointer;
  font-size: 18px;
  margin-top: 15px;
  transition: background 3s;
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

const GroupList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const GroupItem = styled.li`
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  border: 0.1px solid #ffffff63;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s, transform 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(45deg, #4c52ad31, #bec4e75d);
    transform: scale(1.05);
  }
`;

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
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
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!groupName) {
      setMessage("Пожалуйста, введите название группы.");
      setMessageType("error");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/groups`, { name: groupName });
      setMessage("Группа успешно создана!");
      setMessageType("success");
      setGroupName("");
      fetchGroups(); // Обновляем список групп
    } catch (err) {
      setMessage(err.response?.data?.message || "Ошибка при создании группы.");
      setMessageType("error");
    }
  };

  return (
    <Container>
      <BackButton />
      <Title>Создать новую группу</Title>
      <Form onSubmit={handleSubmit}>
        <Label>Название группы</Label>
        <Input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Например: Б-111"
          required
        />
        <Button type="submit">Создать группу</Button>
      </Form>
      {message && <Message type={messageType}>{message}</Message>}

      <Title>Существующие группы</Title>
      <GroupList>
        {groups.length > 0 ? (
          groups.map((group) => (
            <GroupItem key={group.id}>{group.name}</GroupItem>
          ))
        ) : (
          <p>Пока нет созданных групп.</p>
        )}
      </GroupList>
    </Container>
  );
};

export default CreateGroup;
