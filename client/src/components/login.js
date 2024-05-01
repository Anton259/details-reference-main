const { useState, useRef } = require('react');
const { server } = require('../server');

require('../styles/login.css');

const Registration = require('./registration').default;

export default function Login(props) {
    const { setShow } = props;

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const [isShow, setIsShow] = useState(false);
    const [error, setError] = useState('');
    const [showReg, setShowReg] = useState(false);
    const input = useRef(null);

    function showPassword(e) {
        if(isShow) {
            input.current.type = 'password';
            e.target.src = 'src/eye.png';
            setIsShow(false);
        }
        else {
            input.current.type = 'text';
            e.target.src = 'src/crossEye.png';
            setIsShow(true);
        }
    }

    function sign() {
        server('/login', { login, password })
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
            {!showReg &&
            <div className='login_form'>
                <div className='login_close' onClick={() => setShow(false)}>×</div>

                <div className='login_title'>Вход</div>
                <div className='login_label'>Логин:</div>
                <div className='login_input'>
                    <input type='text' value={login} onChange={e => setLogin(e.target.value)}/>
                </div>

                <div className='login_label'>Пароль:</div>
                <div className='login_input'>
                    <input type='password' ref={input} value={password} onChange={e => setPassword(e.target.value)}/>
                    <img src='src/eye.png' onClick={showPassword}/>
                </div>

                <div className='login_error'>{error}</div>
                <button className='login_button' onClick={sign}>Войти</button>
                <div className='login_changeForm' onClick={() => setShowReg(true)}>Зарегистрироваться</div>
            </div>}

            {showReg && <Registration setShow={setShow} setShowReg={setShowReg}/>}
        </div>
    )
}