const { useState, useEffect, useCallback } = require('react');
const { useNavigate } = require('react-router-dom');
const { server } = require('../server');

require('../styles/main.css');

const Login = require('./login').default;
const Dropmenu = require('./dropmenu').default;
const AddDetail = require('./add_detail').default;
const Detailslist = require('./detailslist').default;

export default function Main(props) {
    const { userData } = props;
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [loginText, setLoginText] = useState(['', 'Войти']);
    const [showAddDetail, setShowAddDetail] = useState(false);
    const [edit, setEdit] = useState(false);
    const [oldDetail, setOldDetail] = useState(null);

    const [categories, setCategories] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [details, setDetails] = useState(null);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if(!userData) return;
        if(!userData.auth) return;

        setLoginText([userData.login, 'Выйти']);
    }, [userData])

    useEffect(() => {
        server('/getCategories').then(result => setCategories(result));
    }, [])

    useEffect(() => {
        setCount(0);
        setMaxCount(1);
        setFetching(true);
    }, [search, selectedCategories])

    useEffect(() => {
        if(fetching) {
            server('/getDetails', { search, count, selectedCategories })
            .then(result => {
                if(count == 0) setDetails(result.details);
                else setDetails([...details, ...result.details]);

                setCount(prevState => prevState + 1);
                setMaxCount(result.maxCount);
            })

            setFetching(false);
        }
    }, [fetching])

    const scroll = useCallback((e) => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && details.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, details])

    function login() {
        if(userData.auth) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        else {
            setShowLogin(true)
        }
    }

    function deleteDetail(id) {
        server('/deleteDetail', { id })
        .then(result => {
            if(result) setDetails(details.filter(detail => detail._id != id));
        })
    }

    function editDetail(id) {
        setEdit(true);
        setOldDetail(details.filter(detail => detail._id == id)[0]);
    }

    return(
        <div className='main_wrapper' onScroll={scroll} onResize={scroll}>
            <div className='header'>
                <div className='header_logo'>Магазин деталей</div>
                <input className='header_search' type='text' placeholder='Поиск...' value={search} onChange={e => setSearch(e.target.value)}/>
                <div className='header_login_wrapper'>
                    <div className='header_name'>{loginText[0]}</div>
                    {userData.auth && <img className='main_buttonImg' src='/src/busket.png' onClick={() => navigate('/busket')}/>}
                    {userData.auth && <img className='main_buttonImg' src='/src/packet.png' onClick={() => navigate('/orders')}/>}
                    <button className='main_button' onClick={login}>{loginText[1]}</button>
                </div>
            </div>

            {showLogin && <Login setShow={setShowLogin}/>}

            <div className='navigation'>
                <Dropmenu items={categories} title='Категории' selected={selectedCategories} setSelected={setSelectedCategories}/>
                <div className='navigation_selected'>
                    {selectedCategories.map((category, i) =>
                        <div key={i} className='navigation_selected_item'>
                            {category._id}{category._id != selectedCategories[selectedCategories.length - 1]._id && ','}
                        </div>
                    )}
                </div>
                {userData.admin && <button className='main_button add_detail' onClick={() => setShowAddDetail(!showAddDetail)}>Добавить деталь</button>}
            </div>

            {showAddDetail && <AddDetail setShow={setShowAddDetail} admin={userData._id}/>}
            {edit && <AddDetail setShow={setEdit} admin={userData._id} edit={true} oldDetail={oldDetail}/>}

            <Detailslist
                items={details}
                admin={userData?.admin}
                deleteDetail={deleteDetail}
                editDetail={editDetail}
            />
        </div>
    )
}