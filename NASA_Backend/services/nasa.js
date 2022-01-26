const https = require('https');
const http = require('http');
const fs = require('fs')

var imageDir = 'assets/images/nasa';

const dirCheck = async (directory) => {
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
    }
}

const isExistingDirectory = (directory) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(directory)){
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

const readDataFromFile = (filename) => {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, "utf-8", function(err, data){
            if (err) 
                reject(err); 
            else 
                resolve(data);
        });
    });
};

const getImageDataFromUrl = (url, inputDate, fileName, serverUrl, recursive=false) => {
    if (!url) {
        return false
    }
    const isSecureUrl = url.indexOf('https') > -1
    return new Promise( (resolve, reject) => {
        (isSecureUrl ? https : http).get(url, async (resp) => {
            if (resp.statusCode == 301 || resp.statusCode == 302) {
                const redirectUrl = resp.headers.location;
                resolve(await getImageDataFromUrl(redirectUrl, inputDate, fileName, serverUrl, true)) 
            } else {
                const newDir = `${imageDir}/${inputDate}`

                dirCheck(newDir)
                const newFileName = `${newDir}/${fileName}`
                console.log('Saving file.... ', newFileName)
                var file = fs.createWriteStream(newFileName);
                resp.pipe(file)
                file.on('finish', function() {
                    console.log('Saved file.......................')
                    file.close( resolve({
                        fileName,
                        url: serverUrl + '/' + newFileName
                    }));
                });
            }
          
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err.message)
        });
    })
}

const getNasaRoverImagesByDate = inputDate => {
    return new Promise((resolve, reject) => {
        const nasaAPIKey = process.env.NASA_API_KEY || null
        https.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=${nasaAPIKey}&earth_date=${inputDate}`, (resp) => {
            let data = '';
        
            resp.on('data', (chunk) => {
                data += chunk;
            });
        
            resp.on('end', () => {
                resolve(JSON.parse(data).photos)
            });
        
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err.message)
        });
    })
}

module.exports = {
    getNasaRoverImagesByDate,
    getImageDataFromUrl,
    readDataFromFile,
    isExistingDirectory
}
