import { IMaskInput } from 'react-imask';
const { useState, useRef } = require('react');
const { server } = require('../server');

require('../styles/login.css');

export default function Registration(props) {
    const { setShow, setShowReg } = props;

    const [login, setLogin] = useState('');
    const [phone, setPhone] = useState('+7(___)___-__-__');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const [isShow, setIsShow] = useState([false, false]);
    const [error, setError] = useState('');
    const input1 = useRef(null);
    const input2 = useRef(null);

    function showPassword1(e) {
        if(isShow[0]) {
            input1.current.type = 'password';
            e.target.src = 'src/eye.png';
            setIsShow([false, isShow[1]]);
        }
        else {
            input1.current.type = 'text';
            e.target.src = 'src/crossEye.png';
            setIsShow([true, isShow[1]]);
        }
    }

    function showPassword2(e) {
        if(isShow[1]) {
            input2.current.type = 'password';
            e.target.src = 'src/eye.png';
            setIsShow([isShow[0], false]);
        }
        else {
            input2.current.type = 'text';
            e.target.src = 'src/crossEye.png';
            setIsShow([isShow[0], true]);
        }
    }

    function registration() {
        server('/registration', { login, phone, password, repeatPassword })
        .then(result => {
            if(!result.token) setError(result);
            else {
                localStorage.setItem('token', result.token);
                window.location.reload();
            }
        })
    }

    return(
        <div className='login_wrapper'>
            <div className='login_form'>
                <div className='login_close' onClick={() => setShow(false)}>×</div>

                <div className='login_title'>Регистрация</div>
                <div className='login_label'>Логин:</div>
                <div className='login_input'>
                    <input type='text' value={login} onChange={e => setLogin(e.target.value)}/>
                </div>

                <div className='login_label'>Телефон:</div>
                <div className='login_input'>
                    <IMaskInput mask={'+{7}(000)000-00-00'} value={phone} onAccept={value => setPhone(value)} lazy={false}/>
                </div>

                <div className='login_label'>Пароль:</div>
                <div className='login_input'>
                    <input type='password' ref={input1} value={password} onChange={e => setPassword(e.target.value)}/>
                    <img src='src/eye.png' onClick={showPassword1}/>
                </div>

                <div className='login_label'>Повторите пароль:</div>
                <div className='login_input'>
                    <input type='password' ref={input2} value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)}/>
                    <img src='src/eye.png' onClick={showPassword2}/>
                </div>

                <div className='login_error'>{error}</div>
                <button className='login_button' onClick={registration}>Зарегистрироваться</button>
                <div className='login_changeForm' onClick={() => setShowReg(false)}>Войти</div>
            </div>
        </div>
    )
}