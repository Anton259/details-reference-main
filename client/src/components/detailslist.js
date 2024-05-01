const { Link } = require('react-router-dom');

require('../styles/detailslist.css');

export default function Detailslist(props) {
    const { items, admin, deleteDetail, editDetail } = props;

    if(items == null) {
        return(
            <div className='itemlist_wrapper'>
                {items == null && <div className='itemlist_noItems'>Загрузка...</div>}
            </div>
        )
    }
    else if(items.length == 0) {
        return(
            <div className='itemlist_wrapper'>
                {items.length == 0 && <div className='itemlist_noItems'>Результаты не найдены</div>}
            </div>
        )
    }
    else {
        return(
            <div className='itemlist_wrapper'>
                {items.map((item, i) =>
                    <div key={i} className='itemlist_item'>
                        <Link to={`/detail/${item._id}`}>
                            {item.cover != '' && <img className='itemlist_item_cover' src={item.cover}/>}
                            {item.cover == '' && <div className='itemlist_item_cover'>Нет изображения</div>}
                            <div className='itemlist_item_description'>
                                {item.title}
                                {item.categories.length != 0 && 
                                <div className='itemlist_item_categories'>
                                    Категории: 
                                    {item.categories.length != 0 && item.categories.map((category, i) => ` ${category}`)}
                                </div>}
                            </div>
                        </Link>

                        {admin && admin != undefined && <div className='itemlist_item_admin'>
                            <img src='src/edit.png' onClick={() => editDetail(item._id)}/>
                            <img src='src/delete.png' onClick={() => deleteDetail(item._id)}/>
                        </div>}
                    </div>
                )}
            </div>
        )
    }
}