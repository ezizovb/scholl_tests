import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 30px;
  background-color: #d2e1f04f;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  outline: none;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ffffff63;

  border-radius: 4px;
`;

const Select = styled.select`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
`;
const Option = styled.option`
  background-color: #8fabe6ce;
  color: darkblue;
  padding: 5px 10px;
  outline: none;
  border: 1px solid #ffffff63;
`;

const Button = styled.button`
  padding: 12px;
  background: linear-gradient(95deg, #1750ec81, #677caa81);
  color: #030303ff;
  border: 0.1px solid #ffffff63;
  cursor: pointer;
  font-size: 18px;
  border-radius: 15px;
  transition: background-color 0.3s;
  margin-top: 10px;

  &:hover {
    background: linear-gradient(50deg, #341ca1a6, #0a6ddf5d);
    color: #ffffffff;
  }
`;

const AddQuestionPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [questionData, setQuestionData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "a",
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null); // <-- Создаем ref для поля файла

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/test/${testId}`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Ошибка при получении вопросов:", error);
    }
  };

  const handleChange = (e) => {
    setQuestionData({ ...questionData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("test_id", parseInt(testId));
    formData.append("question_text", questionData.question_text);
    formData.append("option_a", questionData.option_a);
    formData.append("option_b", questionData.option_b);
    formData.append("option_c", questionData.option_c);
    formData.append("option_d", questionData.option_d);
    formData.append("correct_answer", questionData.correct_answer);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/teacher/add-question`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Вопрос успешно добавлен!");
      setQuestionData({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "a",
      });
      setImageFile(null);

      // Сбрасываем значение поля загрузки файла
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при добавлении вопроса.");
    }
  };

  return (
    <Container>
      <BackButton />
      <Title>Добавить вопрос к тесту {/*№{testId}*/} </Title>
      {questions.length > 0 && (
        <p>Текущее количество вопросов: {questions.length}</p>
      )}
      <Form onSubmit={handleSubmit}>
        <Label>Изображение (необязательно)</Label>
        <Input
          style={{ background: "#fcfcfc18", border: "none" }}
          type="file"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          ref={fileInputRef} // <-- Привязываем ref к полю
        />
        <Label>Текст вопроса</Label>
        <Input
          type="text"
          name="question_text"
          value={questionData.question_text}
          onChange={handleChange}
          required
        />
        <Label>Вариант A</Label>
        <Input
          type="text"
          name="option_a"
          value={questionData.option_a}
          onChange={handleChange}
          required
        />
        <Label>Вариант B</Label>
        <Input
          type="text"
          name="option_b"
          value={questionData.option_b}
          onChange={handleChange}
          required
        />
        <Label>Вариант C</Label>
        <Input
          type="text"
          name="option_c"
          value={questionData.option_c}
          onChange={handleChange}
          required
        />
        <Label>Вариант D</Label>
        <Input
          type="text"
          name="option_d"
          value={questionData.option_d}
          onChange={handleChange}
          required
        />
        <Label>Правильный ответ</Label>
        <Select
          name="correct_answer"
          value={questionData.correct_answer}
          onChange={handleChange}
          required
        >
          <Option value="a">A</Option>
          <Option value="b">B</Option>
          <Option value="c">C</Option>
          <Option value="d">D</Option>
        </Select>
        <Button type="submit">Добавить вопрос</Button>
      </Form>
      {message && (
        <p
          style={{
            color: "yellowgreen",
            textAlign: "center",
            marginTop: "15px",
          }}
        >
          {message}
        </p>
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <Button
        onClick={() => navigate("/teacher")}
        style={{
          marginTop: "20px",
          backgroundColor: "#232e38ff",
          color: "rgba(255, 255, 255, 0.8)",
        }}
      >
        Завершить и вернуться
      </Button>
    </Container>
  );
};

export default AddQuestionPage;
