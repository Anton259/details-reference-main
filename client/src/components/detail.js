const { useState, useEffect, useCallback } = require('react');
const { useParams, useNavigate } = require('react-router-dom');
const { server } = require('../server');

require('../styles/detail.css');

export default function Detail(props) {
    const { userData } = props;
    const params = useParams();
    const { id } = params;

    const navigate = useNavigate();

    const [detail, setDetail] = useState(false);
    const [countDetails, setCountDetails] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        server('/getDetail', { id }).then(result => {
            setDetail(result);
            setCountDetails(result.count);
        })
    }, [])

    useEffect(() => {
        if(userData.auth) server('/getBusket', { product: id, user: userData._id }).then(result => setCount(result));
    }, [userData])

    function getDate(time) {
        const date = new Date(time);

        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const month = date.getMonth() + 1 < 10 ? '0' + Number(date.getMonth() + 1) : date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    const plusBusket = useCallback(() => {
        if(countDetails <= 0) return;

        server('/addProduct', { product: id, user: userData._id, count: count + 1, stat: -1 })
        .then(result => {
            setCount(result);
            setCountDetails(countDetails - 1);
        })
    }, [countDetails, count])

    const minusBusket = useCallback(() => {
        if(count - 1 == 0) deleteBusket();
        else {
            server('/addProduct', { product: id, user: userData._id, count: count - 1, stat: 1 })
            .then(result => {
                setCount(result);
                setCountDetails(countDetails + 1);
            })
        }
    }, [countDetails, count])

    const deleteBusket = useCallback(() => {
        server('/deleteProduct', { product: id, user: userData._id })
        .then(result => {
            setCount(result);
            setCountDetails(countDetails + 1);
        })
    }, [countDetails, count])

    if(detail == null) {
        return(
            <div className='detail_wrapper'>
                <div className='detail_nopage'>
                    Страница не найдена
                    <button className='detail_button nopage_button' onClick={() => navigate('/')}>На главную</button>
                </div>
            </div>
        )
    }
    else if(!detail) {
        return(
            <div className='detail_wrapper'>
                <div className='detail_nopage'>Загрузка...</div>
            </div>
        )
    }
    else {
        return(
            <div className='detail_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>{'<'} Назад</button>

                <div className='detail_data'>
                    <div className='detail_created'>{getDate(detail.description.time)}</div>
                    <div className='detail_view'>
                        {detail.view}
                        <img src='../src/view.png'/>
                    </div>
                </div>

                <div className='detail_title'>{detail.title}</div>
                <div className='detail_categories'>
                    {detail.categories.length != 0 && <div className='detail_category'>Категории:</div>}
                    {detail.categories.map((category, i) => <div key={i} className='detail_category'>{category}{i < detail.categories.length - 1 ? ', ' : ''}</div>)}
                </div>
                <div className='detail_description'>
                    {detail.description.blocks.map((block, i) =>
                        <div key={i} className='detail_description_block'>
                            {block.type == 'paragraph' && <div>{block.data.text}</div>}
                            {block.type == 'image' && <img src={block.data.file.url}/>}
                        </div>
                    )}
                </div>

                {userData.auth &&
                <div className='detail_order'>
                    <div className='detail_order_count'>Количество: {countDetails}</div>
                    {count == 0 && <button className='detail_button' onClick={plusBusket}>Добавить в корзину</button>}
                    {count != 0 &&
                    <div className='detail_order_busketCount'>
                        <div onClick={minusBusket}>-</div>
                        {count}
                        <div onClick={plusBusket}>+</div>
                    </div>}
                    {count != 0 && <button className='detail_button' onClick={() => navigate('/busket')}>Перейти в корзину</button>}
                </div>}

                {!userData.auth &&
                <div className='detail_order noAuth'>
                    Чтобы сделать заказ, войдите в аккаунт
                </div>}
            </div>
        )
    }
}