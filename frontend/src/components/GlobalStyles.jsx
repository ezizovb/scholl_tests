import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'souche';
    src: url("./fonts/SourceCodePro-VariableFont_wght.ttf") format('wght'),
         url("./fonts/SourceCodePro-VariableFont_wght.ttf") format('wght');
    font-weight: normal;
    font-style: normal;
    font-display: swap; /* Это помогает избежать "мерцания" текста */
  }

//   body {
//     background: linear-gradient(45deg, #001f3f 0%, #17a2b8 50%, #6a5acd 100%);
//   }
    // #root{
    // background: linear-gradient(45deg, #001f3f 0%, #17a2b8 50%, #6a5acd 100%);
    
    // }
`;

export default GlobalStyles;
