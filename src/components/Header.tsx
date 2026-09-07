import React from "react";

export const Header: React.FC = () => {
  return (
    <>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "5px" }}>
        Бронирование авиабилетов
      </h1>
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", fontSize: "14px" }}>
        <a href="/" style={{ textDecoration: "none", color: "#007bff" }}>Поиск рейсов</a>
        <a href="/my-bookings" style={{ textDecoration: "none", color: "#007bff" }}>Мои брони</a>
      </div>
    </>
  );
};
