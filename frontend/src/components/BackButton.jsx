import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledButton = styled.button`
  background: linear-gradient(90deg, #4c86ad31, #bed1e75d);
  color: #fff;
  border: 0.1px solid #ffffff63;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  margin-bottom: 20px;
  align-self: flex-start;

  &:hover {
    background-color: #5a6268;
    background: linear-gradient(45deg, #697aa881, #ffffff81);
  }
`;

const IconBack = styled.img`
  margin: 5px;
  width: 35px;
  height: 35px;
  opacity: 0.3;
  &:hover {
    opacity: 1;
  }
`;

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <StyledButton onClick={() => navigate(-1)}>
      <IconBack
        src={process.env.PUBLIC_URL + "/icons/back.svg"}
        alt="back icon"
      />
    </StyledButton>
  );
};

export default BackButton;
