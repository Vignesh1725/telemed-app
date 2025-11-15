import '../stylesheets/SideBar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SideBar = ({ id }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { key: 'dashboard', path: '/dashboard', label: 'Dashboard' },
        { key: 'appointments', path: '/appointments', label: 'Appointments' },
        { key: 'chat', path: '/chatbox', label: 'Chat' },
        { key: 'doctors', path: '/doctors', label: 'Doctors' },
        { key: 'profile', path: '/profile', label: 'Profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="logo"><img src="/icons/logo.png" alt="Logo" /> <span>TeleMed</span></div>
            <nav>
                <ul>
                    {menuItems.map((item) => (
                        <Link key={item.key} to={item.path}>
                            <li className={item.key === id ? 'active' : null}>
                                {item.label}
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav>
            <div className="logout" onClick={logout}>Logout</div>
        </aside>
    )
}

export default SideBar;