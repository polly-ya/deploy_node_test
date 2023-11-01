const express = require('express')
const mongoose = require('mongoose');
const path = require('path')
const cors = require('cors')
// 上传图片使用插件
const multer = require('multer')

const router = express.Router()
const app = express()

// 跨域
app.use(cors())

// 静态资源目录
app.use(express.static(__dirname + '/static'))

// 上传的图片保存的路径
const fullPath = path.resolve(__dirname, './static')

// 连接mongodb数据库 MongoDB connection
mongoose.connect('mongodb+srv://demo_29:demo_29@cluster0.ksrfa07.mongodb.net/resource?retryWrites=true&w=majority');

// 开启数据库服务
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

// 创建image文档结构对象  Image schema and model
const imageSchema = new mongoose.Schema({
    filedname: String,
    filename: String,
    size: Number,
    mimetype: String
});

// 创建文档模型对象
const imageModel = mongoose.model('Image', imageSchema);

// 配置，可修改存储的名称以及存储位置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log('destination', file);
        cb(null, fullPath)
        // cb(null, './static')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const fileUpload = multer({ storage: storage })


// 1、上传单张
router.post('/upload', fileUpload.single('avatar'), async (req, res) => {
    const { fieldname, filename, size, mimetype } = req.file
        // const newImage = new imageModel({
        //     filedname: fieldname,
        //     filename: filename,
        //     size: size,
        //     mimetype: mimetype
        // });
        // await newImage.save();

        // 或以下方式
        imageModel.create(req.file).then(res => {
            console.log('插入数据成功');
        }).catch(err => {
            console.log('插入数据失败');
        })
        console.log(req.files);
        res.status(200).send('Image uploaded successfully');
})

// 2、上传多个文件 array  multer(options).array(filename,[,maxCount])
router.post('/uploadMultiple', fileUpload.array('photo', 3), (req, res) => {
    // console.log('上传成功', req.files);
    imageModel.insertMany(req.files).then(res => {
        console.log('插入数据成功');
    }).catch(err => {
        console.log('插入数据失败');
    })
    console.log(req.files);
})

// client 请求返回图片
router.get('/static', async (req, res) => {
    const data = await imageModel.find()
    console.log(data);
    res.send(data)
    // res.send('aaa')
})

app.use(router)

app.listen('8080', () => {
    console.log('serve is running...');
})

