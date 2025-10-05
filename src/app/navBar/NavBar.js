import { useState } from 'react';
import HeaderNav from './headerNav/HeaderNav.js';
import FooterNav from './footerNav/FooterNav.js';
import { useAuth } from '../../context/AuthContext.js';


export default function NavBar() {
    
    const [userNavOpen, setUserNavOpen] = useState(false);
    const { isLoggedIn, authLoading, handleLogout } = useAuth();

    return (
        <>
            <HeaderNav isLoggedIn={isLoggedIn} authLoading={authLoading} handleLogout={handleLogout} userNavOpen={userNavOpen} setUserNavOpen={setUserNavOpen} />
            <FooterNav isLoggedIn={isLoggedIn} authLoading={authLoading} handleLogout={handleLogout} userNavOpen={userNavOpen} setUserNavOpen={setUserNavOpen} />
        </>
    );
}
