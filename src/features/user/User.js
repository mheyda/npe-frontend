import './User.css';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';


export default function User() {

    const [userInfo, setUserInfo] = useState({});
    const [newUserInfo, setNewUserInfo] = useState(userInfo);
    const [checkedAuth, setCheckedAuth] = useState(false);
    const [editingUserInfo, setEditingUserInfo] = useState(false);
    const navigate = useNavigate();
    const firstRender = useRef(true);

    // Make request to get user's info. If they are not logged in, redirect to login page.
    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await AuthService.makeRequest({ urlExtension: 'user/info/', method: 'GET', body: null });
            
            if (userInfo.error) {
                navigate('/user/login');
            } else {
                setUserInfo(userInfo.data);
                setNewUserInfo(userInfo.data);
                setCheckedAuth(true);
            }
        }
        
        if (firstRender.current) {
            firstRender.current = false;
            getUserInfo();
        }

    }, [navigate])

    const handleEdit = async (e) => {
        e.preventDefault();
        const response = await AuthService.makeRequest({ urlExtension: 'user/info/', method: 'PUT', body: newUserInfo });

        if (response.error) {
            navigate('/user/login');
        } else {
            setUserInfo(response.data);
            setNewUserInfo(response.data);
            setEditingUserInfo(false);
        }
    }

    if (checkedAuth && editingUserInfo) {
        return (
            <main className='user-main'>
                <h2 className='user-title'>My Profile</h2>
                <form onSubmit={handleEdit}>
                    <section className='user-content'>
                        <label className='user-field'>
                            <div className='user-field-title'>Username</div>
                            <div className='user-field-content'><input className='user-field-edit' type='text' value={newUserInfo.username} disabled /></div>
                        </label>        
                        <label className='user-field'>
                            <div className='user-field-title'>Email Address</div>
                            <div className='user-field-content'><input className='user-field-edit' type='text' value={newUserInfo.email} disabled /></div>
                        </label> 
                        <label className='user-field'>
                            <div className='user-field-title'>First Name</div>
                            <div className='user-field-content'><input className='user-field-edit' type='text' value={newUserInfo.first_name} onChange={(e) => setNewUserInfo({...newUserInfo, first_name: e.target.value})} /></div>
                        </label>
                        <label className='user-field'>
                            <div className='user-field-title'>Last Name</div>
                            <div className='user-field-content'><input className='user-field-edit' type='text' value={newUserInfo.last_name} onChange={(e) => setNewUserInfo({...newUserInfo, last_name: e.target.value})} /></div>
                        </label>
                        <label className='user-field'>
                            <div className='user-field-title'>Birthdate</div>
                            <div className='user-field-content'><input className='user-field-edit' type='text' value={newUserInfo.birthdate} onChange={(e) => setNewUserInfo({...newUserInfo, birthdate: e.target.value})} /></div>
                        </label>
                    </section>
                    <div className='user-edit-btns'>
                        <button className='user-edit-btn' type='submit'>
                            Save
                        </button>
                        <button className='user-edit-btn' onClick={() => {
                                setEditingUserInfo(false);
                                setNewUserInfo(userInfo);
                            }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        );
    } else if (checkedAuth) {
        return (
            <main className='user-main'>
                <h2 className='user-title'>My Profile</h2>
                <section className='user-content'>
                        <label className='user-field'>
                            <div className='user-field-title'>Username</div>
                            <div className='user-field-content'>{userInfo.username ? userInfo.username : 'N/A'}</div>
                        </label>        
                        <label className='user-field'>
                            <div className='user-field-title'>Email Address</div>
                            <div className='user-field-content'>{userInfo.email ? userInfo.email : 'N/A'}</div>
                        </label> 
                        <label className='user-field'>
                            <div className='user-field-title'>First Name</div>
                            <div className='user-field-content'>{userInfo.first_name ? userInfo.first_name : 'N/A'}</div>
                        </label>
                        <label className='user-field'>
                            <div className='user-field-title'>Last Name</div>
                            <div className='user-field-content'>{userInfo.last_name ? userInfo.last_name : 'N/A'}</div>
                        </label>
                        <label className='user-field'>
                            <div className='user-field-title'>Birthdate</div>
                            <div className='user-field-content'>{userInfo.birthdate ? userInfo.birthdate : 'N/A'}</div>
                        </label>
                </section>
                <div className='user-edit-btns'>
                    <button className='user-edit-btn' onClick={() => setEditingUserInfo(true)}>
                        Edit
                    </button>
                </div>
            </main>
        );
    }
    
}