const { useState, useEffect } = require('react');

require('../styles/dropmenu.css');

export default function Dropmenu(props) {
    const { items, title, selected, setSelected } = props;

    const [showMenu, setShowMenu] = useState(false);

    function select(item) {
        if(selected.includes(item)) setSelected(selected.filter(e => e != item))
        else setSelected([...selected, item]);
    }

    return(
        <div className='dropmenu'>
            <div className='dropmenu_title' onClick={() => setShowMenu(!showMenu)}>
                {title}
                <img src='src/arrow.png' style={!showMenu ? {} : {transform: 'rotate(90deg)'}}/>
            </div>
            <div className='dropmenu_items' style={!showMenu ? {height: '0'} : {height: '500px'}}>
                {items != null && items.map((item, i) =>
                    <div key={i} className='dropmenu_item' onClick={() => select(item)}>
                        {item._id}
                        <div className='dropmenu_item_selected'>
                            {selected.includes(item) && <img src='src/checkmark.png'/>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}