const express = require('express');
const fs = require('fs');
const path = require('path')
const app = express()
const cors = require('cors')
const moment = require('moment');

require('dotenv').config()

const {getNasaRoverImagesByDate, readDataFromFile, getImageDataFromUrl, isExistingDirectory} = require('./services/nasa');

app.use(cors())
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const seedData = () => {
    console.log('..........................Seeding cache data....................................')
    readDataFromFile('dates.txt').then(async res => {
        const newArray = res.toString().split('\n')
        let dateArray = []
        newArray.map(item => {
            const freshItem = item.replace('\r', '').trim()
            if (moment(new Date(freshItem)).isValid()) {
                const time = moment(new Date(freshItem)).format("YYYY-MM-DD")
                dateArray.push(time)
            }
            return item
        })
        for (let i = 0; i < dateArray.length; i++) {
            console.log('Found cache date: ', dateArray[i])
            try {
                const nasaData = await getNasaRoverImagesByDate(dateArray[i])
                const tempData = nasaData.map(item => {
                    const temp = item.img_src.split('.') || []
                    const fileExtension = temp[temp.length - 1]
                    return {
                        url: item.img_src,
                        fileName: 'NASA' + item.id + `.${fileExtension}`,
                        date: dateArray[i]
                    }
                })
            
                for (let i = 0; i < tempData.length;i++) {
                    let item = tempData[i]
                    const {url, date, fileName} = item;
                    await getImageDataFromUrl(url, date, fileName, '')
                }
                console.log('..................................Finished Seed Process........................................')
            } catch (err) {
                console.log('Seed Error: ', err)
            }
        }
    })
}


app.get('/', (req, res) => {
    res.send('Server is running!')
})

app.get('/nasa/images', async (req, res) => {
    const inputDate = req.query.date
    if (! inputDate) {
        return res.status(400).json({
            error: true,
            message: 'Missing required param inputDate!'
        })
    }

    if (! moment(new Date(inputDate)).isValid()) {
        return res.status(400).json({
            error: true,
            message: 'Invalid date format inputDate. Should be YYYY-MM-DD'
        })
    }
    var serverUrl = req.protocol + '://' + req.get('host');
    const fileData = await readDataFromFile('dates.txt')
    const newArray = fileData.toString().split('\n')
    let dateArray = []
    newArray.map(item => {
        const freshItem = item.replace('\r', '').trim()
        if (moment(new Date(freshItem)).isValid()) {
            const time = moment(new Date(freshItem)).format("YYYY-MM-DD")
            dateArray.push(time)
        }
        return item
    })
    const newDate = moment(new Date(inputDate)).format("YYYY-MM-DD")

    // is in cache?
    if (dateArray.includes(newDate)) {
        // send result from cache
        const existingDir = 'assets/images/nasa/' + newDate
        const directoryPath = path.join(__dirname, existingDir);
        if (await isExistingDirectory(directoryPath)) {
            
            fs.readdir(directoryPath, function (err, files) {
                if (err) {
                    return res.json({
                        data: [],
                        inputDate: inputDate
                    })
                } 
                let newFiles = []
                files.forEach(function (file) {
                    newFiles.push({
                        url: serverUrl + '/' + existingDir + '/' + file,
                        fileName: file
                    })
                });
                res.json({
                    data: newFiles,
                    inputDate: inputDate
                })
            });
        } else {
            res.json({
                data: [],
                inputDate: inputDate
            })
        }
    } else {
        // update txt file
        var logStream = fs.createWriteStream('dates.txt', {flags: 'a'})
        logStream.write('\n' + newDate);
        logStream.close()

        try {
            const nasaData = await getNasaRoverImagesByDate(newDate)
            const tempData = nasaData.map(item => {
                const temp = item.img_src.split('.') || []
    
                const fileExtension = temp[temp.length - 1]
                return {
                    url: item.img_src,
                    fileName: 'NASA' + item.id + `.${fileExtension}`,
                    date: newDate
                }
            })
          
            let imageData = []
            for (let i =0; i < tempData.length;i++) {
                let item = tempData[i]
                const {url, date, fileName} = item;
                const urlData =  getImageDataFromUrl(url, date, fileName, serverUrl)
                imageData.push(urlData)
            }
            res.json({
                data: tempData,
                inputDate: inputDate
            })
        } catch (err) {
            res.status(400).json({
                error: true,
                message: err.toString()
            })
        }
    }
    
})

seedData()

app.listen(process.env.PORT || 8000)