import { NavLink } from "react-router";

export const Header = () => {
  return (
    <>
      <h1 data-testid="page-title" className="site-header__title">
        Бронирование авиабилетов
      </h1>
      <div className="site-header__nav">
        <NavLink to="/" end>Поиск рейсов</NavLink>
        <NavLink to="/lookup" data-testid="nav-lookup">Мои брони</NavLink>
      </div>
    </>
  );
};
