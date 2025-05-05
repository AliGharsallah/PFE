import React from "react";
import "../Styles/Button.css"

interface ButtonProps {
  type: "primary" | "outline";
  children: React.ReactNode;
  onClick: () => void; // Add the onClick prop here
}

const Button: React.FC<ButtonProps> = ({ type, children, onClick }) => {
  return (
    <button className={`btn-${type}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
