import React, {useContext} from "react";
import styled from 'styled-components';
import Logo from "../svg/logo.svg";
import {Link} from "react-router-dom";
import {userStore} from "../context/user";

const Header = () => {
  const { state: user } = useContext(userStore);
  return (
    <HeaderWrapper>
      <img src={Logo} alt={"Zignaly"} />
      <HeaderRightSide>
        {user._id ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/logout">Log out</Link>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </HeaderRightSide>
    </HeaderWrapper>
  )
};

export default Header;

const HeaderWrapper = styled.div`
  padding: 16px 32px;
  flex-direction: row;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 16px 10px;
  }
  max-width: 960px;
  margin: 0 auto;
`;
const HeaderRightSide = styled.div`
  & > * {
    text-decoration: none;
    display: inline-block;
    margin-left: 10px;
    &:hover {
      text-decoration: underline;
    }
  }
`;
