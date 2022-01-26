
import React from 'react';
import DatePicker from "react-datepicker";
import ImageGallery from './imageGallery'

import "react-datepicker/dist/react-datepicker.css";

const NasaComponent = () => {
    const [startDate, setStartDate] = React.useState()
    return (
        <div style={{width: '100%', height: '100%'}}>
            <div style={{ padding: '1rem'}}>
                <label style={{fontSize: '14px'}}>Select Earth date for NASA</label>
                <DatePicker
                    selected={startDate}
                    dateFormat="yyyy-MM-dd"
                    onChange={(date) => setStartDate(date)}
                />
            </div>
            <div style={{ padding: '1rem'}}>
                <ImageGallery inputDate={startDate} />
            </div>
        </div>
    )
}

export default NasaComponent