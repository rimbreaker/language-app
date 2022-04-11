import React from 'react';
import { AppShell, Container, useMantineTheme } from '@mantine/core';
import NavbarMain from './NavbarMain';
import HeaderMain from './HeaderMain';
import { useAuthContext } from '../contexts/AuthContextProvider';
import { useStateContext } from '../contexts/StateContextProvider';

const Layout = ({ children }: any) => {

    const { isLoggedIn } = useAuthContext()
    const { backgroundImage } = useStateContext()

    const theme = useMantineTheme()

    return (
        <div >
            <AppShell
                style={{ color: 'aliceblue', backgroundColor: theme.colors.dark[4], backgroundImage: `url(${backgroundImage})` }}
                navbarOffsetBreakpoint="sm"
                fixed
                header={
                    <HeaderMain />
                }
                navbar={isLoggedIn &&
                    <NavbarMain />
                }
            >
                <Container >
                    {children}
                </Container>
            </AppShell >
        </div>
    );
}

export default Layout;
