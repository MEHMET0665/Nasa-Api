import React from 'react';
import moment from 'moment'
import Masonry from 'react-masonry-component';

const masonryOptions = {
    transitionDuration: 0
};

const imagesLoadedOptions = { background: '.my-bg-image-el' }

const ImageComponent = ({inputDate}) => {
    const [images, setImages] = React.useState([])
    const [isLoading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const date = moment(inputDate).format('YYYY-MM-DD')
        setLoading(true)
        const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:8000'
        fetch(apiURL + '/nasa/images?date=' + date)
        .then(res => res.json())
        .then(res => {
            if (res) {
                setImages(res.data)
                setTimeout(() => {
                    setLoading(false)
                }, 300)
            }
        })
        .catch(err => {
            alert(err)
        })
    }, [inputDate])

    if (isLoading) {
        return (
            <div style={{ width: '100%', height: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
               <h3>Loading images. Please wait...</h3>
            </div>
        )
    }

    return (
        <div>
        <Masonry
            className={'my-gallery-class'}
            elementType={'ul'}
            options={masonryOptions}
            disableImagesLoaded={false}
            updateOnEachImageLoad={false}
            imagesLoadedOptions={imagesLoadedOptions}
        >
            {images.map(item => {
                return (
                    <li className="image-element-class" key={item.fileName} style={{margin: '10px', listStyleType: 'none', minWidth: '300px', minHeight: '300px', border: '1px solid #eee' }}>
                        <a href={item.url} target="_blank">
                            <img src={item.url} style={{maxWidth: '300px', maxHeight: '300px', }} />
                        </a>
                    </li>
                )
            })}
        </Masonry>
        {!isLoading && images.length == 0 && (
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <h3 style={{ textAlign: 'center'}}>No image found for the given date!</h3>
            </div>
        )}
        </div>
    )
}

export default ImageComponent