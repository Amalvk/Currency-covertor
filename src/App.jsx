import './App.css';
import CSVReader from 'react-csv-reader'
import React, { useState } from 'react';
import DocumentIcon from "./assets/icons/document.svg"
import Select from 'react-select'
import { currencies } from './assets/currencies';
import csvDownload from 'json-to-csv-export'

function App() {
   
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(false)

  const handleCurrencyChange = (value) => {
    setSelectedCurrency(value.value)
  }

  const handleConvertDownload = () => {

    if (selectedCurrency) {

      let url = `https://api.freecurrencyapi.com/v1/latest?apikey=9Z3ZHG7sseXtmI1nqk0twy8gHDoYem2JQRWIKqyf&base_currency=${selectedCurrency}`

      let baseCurrencyValue;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          baseCurrencyValue = data.data;
          console.log(uploadedDocuments);
          uploadedDocuments.forEach(element => {
            let newData = element.rows.map((item => (
              {
                ...item,
                "Converted Currency": selectedCurrency,
                "Converted Amount": item.Amount / baseCurrencyValue[item.Currency]
              }
            )))
            csvDownload({ data: newData, filename: `converted_${element.name}`, delimiter: ',', })
          });
        });
    }



  }

  const handleOnFileLoaded = (data, fileInfo, originalFile) => {
    // console.log(data, fileInfo, originalFile)
    if (data && data.length) {
      let temp_columns = data[0].map((header) => ({ "Header": header, "accessor": header }));
      let temp_rows = [];
      data.forEach((rows, index) => {
        if (index > 0 && rows.length == 4) {
          let row_data = { 
            "Name": rows[0],
            "Currency": rows[1],
            "Amount": rows[2],
            "Transaction Date": rows[3]
          }; 
          temp_rows.push(row_data)
        }
      });
      setUploadedDocuments([...uploadedDocuments, { ...fileInfo, rows: temp_rows, columns: temp_columns }])
    }
  }
  return (
    <div className="container text-center  ">
      <div className="header-sec pt-5 pb-2">
        <h1 className='header-blue'>Currency Converter</h1>
        <p className=''>Upload CSV files to convert Currency value</p>
      </div>
      <div className="d-flex justify-content-center">
        <label className='button-container' htmlFor={'upload-button'}>
          <div className={"csv-reader-input "}>
            <img src={DocumentIcon} width={24} height={24} />
            <p className='m-0 mx-2'> Upload File</p>
          </div>
        </label>
        <CSVReader inputId="upload-button" cssClass="csv-reader-input mw-100 d-none" onFileLoaded={handleOnFileLoaded} />
      </div>
      <div className="d-flex justify-content-center">
        <div className="files-container mt-2">
          <Select onChange={handleCurrencyChange} placeholder="Select Currency" options={currencies} />
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <div className="files-container">
          <div className="uploaded-files mt-2 p-2">
            {
              uploadedDocuments.length ? uploadedDocuments.map(item => {
                return (
                  <div className="document-item" key={item.name}>
                    <p>{item.name}</p>
                  </div>
                )
              }) :
                <div className="empty-sec d-flex justify-content-center align-items-center">
                  <p className='text-white-50 font-monospace' >upload documents to convert</p>
                </div>
            }
          </div>
          <div className="footer d-flex justify-content-end mt-2">
          </div>
          <button className='btn btn-success ' onClick={handleConvertDownload}>Convert & Download</button>
          <div className="mt-2 font-monospace supported text-wrap text-white-50">Supported Currencies : EUR,USD,JPY,BGN,CZK,DKK,GBP,HUF,PLN,RON,SEK,CHF,ISK,NOK,HRK,RUB,TRY,AUD,BRL,CAD,CNY,HKD,IDR,ILS,INR,KRW,MXN,MYR,NZD,PHP,SGD,THB,ZAR.</div >

        </div>
      </div>
    </div>
  );
}

export default App;
