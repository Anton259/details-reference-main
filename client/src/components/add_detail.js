const { useState, useRef, useEffect, useCallback } = require('react');
const { useNavigate } = require('react-router-dom');
const { createReactEditorJS } = require('react-editor-js');
const  Image = require('@editorjs/image');
const { server } = require('../server');
const url = require('../server_url.js');

const ReactEditorJS = createReactEditorJS();

require('../styles/add_detail.css');

export default function AddDetail(props) {
    const { setShow, admin, edit = false, oldDetail = null } = props;

    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [count, setCount] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectCategories, setSelectCategories] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        server('/getCategories').then(result => setCategories(result));
    }, [])

    useEffect(() => {
        if(oldDetail != null) {
            setTitle(oldDetail.title);
            setSelectCategories(oldDetail.categories);
            setCount(oldDetail.count);
        }
    }, [oldDetail])

    const editorCore = useRef(null)

    const handleInitialize = useCallback((instance) => {
        editorCore.current = instance;
    }, [])

    const handleSave = useCallback(async () => {
        try {
            const savedData = await editorCore.current.save();
            
            if(!edit) {
                server('/addDetail', { title, count, savedData, categories: selectCategories, admin })
                .then(result => {
                    if(!result.error) navigate(`/detail/${result.id}`);
                    else setError(result.message);
                })
            }
            else {
                server('/editDetail', { title, count, savedData, categories: selectCategories, id: oldDetail._id })
                .then(result => {
                    if(!result.error) navigate(`/detail/${result.id}`);
                    else setError(result.message);
                })
            }
        }
        catch {
            setError('Описание не может быть пустым');
        }
    }, [title, selectCategories, count])

    function handleChange(e) {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => option.value);
        setSelectCategories(values);
    }

    return(
        <div className='addDetail'>
            <div className='addDetail_form'>
                <div className='addDetail_close' onClick={() => setShow(false)}>×</div>

                <div className='addDetail_label'>Название:</div>
                <input type='text' value={title} onChange={e => setTitle(e.target.value)}/>

                <div className='addDetail_label'>Количество:</div>
                <input type='number' value={count} onChange={e => setCount(e.target.value)}/>

                <div className='addDetail_label'>Категории:</div>
                <select className='addDetail_select' multiple value={selectCategories} onChange={handleChange}>
                    {categories.map((category, i) =>  <option key={i} className='addDetail_option' value={category._id}>{category._id}</option>)}
                </select>

                <div className='addDetail_label'>Описание:</div>
                <div className='addDetail_editor'>
                    <ReactEditorJS
                        onInitialize={handleInitialize}
                        tools={{ image: { class: Image, config: { endpoints: { byFile: url + '/editor' } } } }}
                        defaultValue={oldDetail != null ? oldDetail.description : {}}
                    />
                </div>

                <div className='addDetail_error'>{error}</div>
                <button onClick={handleSave}>{edit ? 'Изменить' : 'Сохранить'}</button>
            </div>
        </div>
    )
}