import React, { useState, useEffect } from "react";
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
  font-family: sourche;
  font-size: 1.5rem;
`;

const QuestionList = styled.ul`
  list-style: none;
  padding: 0;
`;

const QuestionItem = styled.li`
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

const QuestionText = styled.span`
  font-weight: bold;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

// const ActionButton = styled.button`
//   padding: 5px 10px;
//   background-color: #ffc107;
//   color: #fff;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   font-size: 14px;
//   &:hover {
//     background-color: #e0a800;
//   }
// `;

// const DeleteButton = styled(ActionButton)`
//   background-color: #dc3545;
//   &:hover {
//     background-color: #c82333;
//   }
// `;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ffffff63;
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  border-radius: 4px;
  outline: none;
  &:hover {
    background: linear-gradient(90deg, #294a5f31, #162a425d);
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
  width: 25px;
  height: 25px;
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

const EditTestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handleEditClick = (question) => {
    setEditingQuestionId(question.id);
    setEditFormData(question);
  };

  const handleUpdateChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/api/teacher/edit-question/${editingQuestionId}`,
        editFormData
      );
      alert("Вопрос успешно обновлён!");
      setEditingQuestionId(null);
      fetchQuestions(); // Обновляем список
    } catch (error) {
      console.error("Ошибка при обновлении вопроса:", error);
      alert("Ошибка при обновлении вопроса.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот вопрос?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/teacher/delete-question/${questionId}`
        );
        alert("Вопрос успешно удалён!");
        fetchQuestions();
      } catch (error) {
        console.error("Ошибка при удалении вопроса:", error);
        alert("Ошибка при удалении вопроса.");
      }
    }
  };

  return (
    <Container>
      <BackButton />
      <Title>Редактировать тесты {/*№{testId} */}</Title>
      <p style={{ marginBottom: "15px" }}>
        Количество вопросов: {questions.length}
      </p>
      <QuestionList>
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionItem key={question.id}>
              {editingQuestionId === question.id ? (
                // Форма редактирования, которая появляется при нажатии "Изменить"
                <EditForm onSubmit={handleUpdateSubmit}>
                  <p>Текст вопроса</p>
                  <Input
                    type="text"
                    name="question_text"
                    value={editFormData.question_text || ""}
                    onChange={handleUpdateChange}
                    required
                  />
                  <p>Вариант A</p>
                  <Input
                    type="text"
                    name="option_a"
                    value={editFormData.option_a || ""}
                    onChange={handleUpdateChange}
                    required
                  />
                  <p>Вариант B</p>
                  <Input
                    type="text"
                    name="option_b"
                    value={editFormData.option_b || ""}
                    onChange={handleUpdateChange}
                    required
                  />
                  <p>Вариант C</p>
                  <Input
                    type="text"
                    name="option_c"
                    value={editFormData.option_c || ""}
                    onChange={handleUpdateChange}
                    required
                  />
                  <p>Вариант D</p>
                  <Input
                    type="text"
                    name="option_d"
                    value={editFormData.option_d || ""}
                    onChange={handleUpdateChange}
                    required
                  />
                  <p>Правильный ответ</p>
                  <Select
                    name="correct_answer"
                    value={editFormData.correct_answer || ""}
                    onChange={handleUpdateChange}
                    required
                  >
                    <Option value="a">A</Option>
                    <Option value="b">B</Option>
                    <Option value="c">C</Option>
                    <Option value="d">D</Option>
                  </Select>
                  <QuestionActions>
                    <TestActionButton type="submit">
                      <Icons src={process.env.PUBLIC_URL + "/icons/save.svg"} />
                    </TestActionButton>
                    <DeleteButton
                      type="button"
                      onClick={() => setEditingQuestionId(null)}
                    >
                      <Icons
                        src={process.env.PUBLIC_URL + "/icons/cancel.svg"}
                      />
                    </DeleteButton>
                  </QuestionActions>
                </EditForm>
              ) : (
                // Отображение вопроса в обычном режиме
                <>
                  <QuestionText>{question.question_text}</QuestionText>
                  <QuestionActions>
                    <TestActionButton onClick={() => handleEditClick(question)}>
                      <Icons
                        src={process.env.PUBLIC_URL + "/icons/pencil.svg"}
                      />
                    </TestActionButton>
                    <DeleteButton
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Icons
                        src={process.env.PUBLIC_URL + "/icons/trash3.svg"}
                      />
                    </DeleteButton>
                  </QuestionActions>
                </>
              )}
            </QuestionItem>
          ))
        ) : (
          <p>В этом тесте пока нет вопросов.</p>
        )}
      </QuestionList>
    </Container>
  );
};

export default EditTestPage;
