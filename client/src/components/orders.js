const { useState, useEffect } = require('react');
const { useNavigate } = require('react-router-dom');
const { server } = require('../server');

require('../styles/orders.css');

export default function Orders(props) {
    const { userData } = props;
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if(!userData.auth) return;

        server('/getOrders', { user: { _id: userData._id, admin: userData.admin }}).then(result => setOrders(result));
    }, [userData])

    function deleteOrder(order) {
        server('/deleteOrder', { order }).then(result => server('/getOrders', { user: { _id: userData._id, admin: userData.admin }}).then(result => setOrders(result)));
    }

    function changeStatus(id, status) {
        server('/changeStatus', { id, status }).then(result => server('/getOrders', { user: { _id: userData._id, admin: userData.admin }}).then(result => setOrders(result)));
    }

    if(!userData.auth) {
        return(
            <div className='busket_noAuth_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>На главную</button>
                <div className='busket_noAuth'>Сначала войдите в аккаунт</div>
            </div>
        )
    }
    else if(orders.length == 0) {
        return(
            <div className='busket_noAuth_wrapper'>
                <button className='detail_back detail_button' onClick={() => navigate('/')}>На главную</button>
                <div className='busket_noAuth'>Нет заказов</div>
            </div>
        )
    }

    return(
        <div className='orders_wrapper'>
            <button className='detail_back detail_button' onClick={() => navigate('/')}>На главную</button>
            {orders.map((item, i) =>
                <div key={i} className='order_wrapper'>
                    <div className='order_up'>
                        {userData.admin &&
                        <select className='order_status_admin' value={item.status} onChange={e => changeStatus(item._id, e.target.value)}>
                            <option value='Ожидание'>Ожидание</option>
                            <option value='Принято'>Принято</option>
                            <option value='Отменено'>Отменено</option>
                        </select>}
                        {!userData.admin && <div className='order_status'>{item.status}</div>}
                        <img className='order_delete' src='/src/delete.png' onClick={() => deleteOrder(item)}/>
                    </div>
                    {userData.admin && <div className='order_login'>{item.user.login}</div>}
                    {userData.admin && <div className='order_login'>{item.user.phone}</div>}
                    {item.products.map((item, i) => 
                        <div key={i} className='order_product_wrapper'>
                            {item.cover != '' && <img className='order_product_cover' src={item.cover}/>}
                            {item.cover == '' && <div className='order_product_cover'>Нет изображения</div>}
                            <div className='order_product_title'>{item.title}</div>
                            <div className='order_product_count'>Количество: {item.count}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}