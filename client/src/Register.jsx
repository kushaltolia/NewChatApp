import {useState} from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState(true);
    const navigate = useNavigate();
    function register(e) {
        e.preventDefault();
        const endPoint = isLoginOrRegister ? 'login' : 'register';
        axios.post(`http://localhost:4000/${endPoint}`, {
            username : username,
            password : password
        }).then((res) => {
            console.log("response is : ");
            localStorage.setItem('userData', JSON.stringify(res.data));
            console.log("User Id is : " + JSON.parse(localStorage.getItem('userData')).id);
            {isLoginOrRegister ? "" : alert('User registered successfully')};
            navigate('/user')
        }).catch((err) => {
            console.log("error is : " + err.response.data.error);
            alert(err.response.data.error)
        })
    }
    function handleClick() {
        setIsLoginOrRegister(()=> !isLoginOrRegister);
    }
    return (
    <div className = 'bg-blue-50 h-screen flex items-center'>
        <form className = 'w-64 mx-auto mb-12' onSubmit = {register}>
            <input type = "text" value = {username} onChange = {(e) => setUsername(e.target.value)} placeholder = 'username' className = 'block w-full rounded-sm p-2 mb-2 border'></input>
            <input type = "password" value = {password} onChange = {(e) => setPassword(e.target.value)} placeholder = 'password'className = 'block w-full rounded-sm p-2 mb-2 border'></input>
            <button className = 'bg-blue-500 text-white block w-full rounded-sm p-2'>{isLoginOrRegister ? "Login" : "Register"}</button>
            <div className = 'text-center mt-2'>{isLoginOrRegister ? "Not a member" : "Already a member"} <Link><button onClick = {handleClick}>{isLoginOrRegister ? "Register Here" : "Login Here"}</button></Link></div>
        </form>
    </div>
    )
} 

export default Register