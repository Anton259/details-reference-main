const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer  = require('multer');
require('dotenv').config();
const PORT = process.env.PORT;

const User = require('./models/User');
const Category = require('./models/Category');
const Detail = require('./models/Detail');
const Order = require('./models/Order');

const app = express();

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

app.use(cors({origin: '*'}));
app.use(express.static('public'));
app.use(express.static('build'));
app.use(express.json());

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        app.listen(PORT, () => console.log(`server started on port ${PORT}`));
    }
    catch(e) {
        console.log(e);
    }
}

start();

const generateAccessToken = (id) => {
    const payload = { id };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '30d' });
}

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
})

app.post('/auth', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if(token == 'null') return res.json({ auth: false });

        const decodedData = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decodedData.id }, { password: 0 });

        if(user) return res.json({ auth: true, _id: user._id, login: user.login, admin: user.admin });
        else return res.json({ auth: false });
    }
    catch(e) {
        return res.json({ auth: false });
    }
})

app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    const user = await User.findOne({ login });
    if(user == null) return res.json(`Пользователь ${login} не найден`);

    const validPassword = bcrypt.compareSync(password, user.password);
    if(!validPassword) return res.json('Введен неверный пароль');

    const token = generateAccessToken(user._id);
    return res.json({ token });
})

app.post('/registration', async (req, res) => {
    const { login, phone, password, repeatPassword } = req.body;

    if(login.trim() == '') return res.json('Имя пользователя не может быть пустым');
    if(login.length > 20) return res.json('Имя пользователя не может быть длиннее 20 символов');
    if(phone.includes('_')) return res.json('Неверный номер телефона');
    if(password.length < 5) return res.json('Пароль должен быть длиннее 4 символов');
    if(password.length > 20) return res.json('Пароль не может быть длиннее 20 символов');
    if(password != repeatPassword) return res.json('Пароли не совпадают');

    const candidate = await User.findOne({ login });
    if(candidate) return res.json('Пользователь с таким именем уже существует');

    const hashPassword = bcrypt.hashSync(password, 7);

    const user = new User({ login, password: hashPassword, phone });
    await user.save();

    const token = generateAccessToken(user._id);
    return res.json({ token });
})

app.post('/getCategories', async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
})

app.post('/editor', multer({ storage: storageConfig }).single('image'), async (req, res) => {
    res.json({ 'success' : 1, 'file': { 'url' : process.env.SERVER_URL + '/uploads/' + req.file.originalname } });
})

app.post('/addDetail', async (req, res) => {
    const { title, count, savedData, categories, admin } = req.body;

    if(title.trim() == '') return res.json({ error: true, message: 'Название не может быть пустым' });
    if(savedData.blocks.length == 0) return res.json({ error: true, message: 'Описание не может быть пустым' });

    const detail = new Detail({ title, count, description: savedData, view: 0, admin, categories });
    await detail.save();

    res.json({ error: false, id: detail._id });
})

app.post('/editDetail', async (req, res) => {
    const { title, count, savedData, categories, id } = req.body;

    if(title.trim() == '') return res.json({ error: true, message: 'Название не может быть пустым' });
    if(savedData.blocks.length == 0) return res.json({ error: true, message: 'Описание не может быть пустым' });

    await Detail.updateOne({ _id: id }, { $set: { title, count, description: savedData, categories } });

    res.json({ error: false, id });
})

app.post('/getDetails', async (req, res) => {
    const { search, count, selectedCategories } = req.body;

    let details = [];
    let maxCount = 0;
    if(selectedCategories.length == 0) {
        details = await Detail.find({ title: { $regex: search } }).skip(count * 15).limit(15);
        maxCount = await Detail.find({ title: { $regex: search } }).countDocuments();
    }
    else {
        details = await Detail.find({ title: { $regex: search }, categories: { $all: selectedCategories } }).skip(count * 15).limit(15);
        maxCount = await Detail.find({ title: { $regex: search }, categories: { $all: selectedCategories } }).countDocuments();
    }

    for(let i = 0; i < details.length; i++) {
        const cover = await getCover(details[i]._id);
        details[i] = { ...details[i]._doc, cover };
    }

    res.json({ details, maxCount });
})

app.post('/getDetail', async (req, res) => {
    const { id } = req.body;

    try {
        const detail = await Detail.findOne({ _id: id });
        if(detail != null) await Detail.updateOne({ _id: id }, { $set: { view: detail.view + 1 } });

        res.json(detail);
    }
    catch(e) {
        res.json(null);
    }
})

app.post('/deleteDetail', async (req, res) => {
    const { id } = req.body;

    const detail = await Detail.findOne({ _id: id });
    await Detail.deleteOne({ _id: id });

    for(let i = 0; i < detail.description.blocks.length; i++) {
        const block = detail.description.blocks[i];
        if(block.type == 'image') {
            const url = block.data.file.url;
            const file = url.split('/')[url.split('/').length - 1];
            fs.rm(`./public/uploads/${file}`, {recursive: true}, e => {if(e) console.log(e)});
        }
    }

    res.json(true);
})

app.post('/getBusket', async (req, res) => {
    const { product, user } = req.body;

    const busket = await User.findOne({ _id: user, 'busket.product': product });
    if(busket == null) return res.json(0);
    
    res.json(busket.busket[0].count);
})

app.post('/addProduct', async (req, res) => {
    const { product, user, count, stat } = req.body;

    await User.updateOne({ _id: user }, { $pull: { busket: { product } } });
    await User.updateOne({ _id: user }, { $push: { busket: { product, count } } });
    await Detail.updateOne({ _id: product }, { $inc: { count: stat } });

    res.json(count);
})

app.post('/deleteProduct', async (req, res) => {
    const { product, user } = req.body;

    await User.updateOne({ _id: user }, { $pull: { busket: { product } } });
    await Detail.updateOne({ _id: product }, { $inc: { count: 1 } });

    res.json(0);
})

app.post('/getProducts', async (req, res) => {
    const { user } = req.body;

    const busket = await User.findOne({ _id: user }, { busket: 1 });
    let products = [];

    for(let i = 0; i < busket.busket.length; i++) {
        const cover = await getCover(busket.busket[i].product);
        const detail = await Detail.findOne({ _id: busket.busket[i].product }, { _id: 1, description: 1, title: 1, count: 1 });
        products.push({ _id: detail._id, title: detail.title, cover, count: busket.busket[i].count, allCount: detail.count });
    }

    res.json(products);
})

app.post('/addOrder', async (req, res) => {
    const { user, products } = req.body;

    const order = new Order({ user, products, status: 'Ожидание' });
    order.save();

    await User.updateOne({ _id: user }, { $set: { busket: [] } });

    res.json(true)
})

app.post('/getOrders', async (req, res) => {
    const { user } = req.body;

    let orders = [];

    if(user.admin) {
        orders = await Order.find();
        for(let i = 0; i < orders.length; i++) {
            let user = await User.findOne({ _id: orders[i].user }, { login: 1, phone: 1 });
            orders[i] = { _id: orders[i]._id, products: orders[i].products, user, status: orders[i].status };
        }
    }
    else {
        orders = await Order.find({ user: user._id });
    }

    for(let j = 0; j < orders.length; j++) {
        let prod = orders[j].products;
        let products = [];
        for(let i = 0; i < prod.length; i++) {
            const detail = await Detail.findOne({ _id: prod[i]._id }, { title: 1 });
            products.push({ ...prod[i]._doc, title: detail.title, cover: await getCover(prod[i]._id) });
        }
        orders[j] = { _id: orders[j]._id, products, user: orders[j].user, status: orders[j].status };
    }

    res.json(orders);
})

async function getCover(id) {
    let cover = '';

    const detail = await Detail.findOne({ _id: id }, { _id: 1, description: 1, title: 1, count: 1 });

    for(let j = 0; j < detail.description.blocks.length; j++) {
        const block = detail.description.blocks[j];
        if(block.type == 'image') {
            cover = block.data.file.url;
            break;
        }
    }

    return cover;
}

app.post('/deleteOrder', async (req, res) => {
    const { order } = req.body;

    for(let i = 0; i < order.products.length; i++) {
        await Detail.updateOne({ _id: order.products[i]._id }, { $inc: { count: order.products[i].count } });
    }

    await Order.deleteOne({ _id: order._id });

    res.json(true);
})

app.post('/changeStatus', async (req, res) => {
    const { id, status } = req.body;

    await Order.updateOne({ _id: id }, { $set: { status } });

    res.json(true);
})