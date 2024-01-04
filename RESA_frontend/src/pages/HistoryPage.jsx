import React, { version } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getValue } from '../functions/generalFunctions';

const HistoryPage = () => {
    const { docID } = useParams();
    const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    const [alpha, setAlpha] = useState(alphabet);
    const [data, setData] = useState(null);
    const [focusedCell, setFocusedCell] = useState({});
    const [versions, setVersion] = useState([]);
    
  useEffect(()=>{
    loadLastVersion();
    loadVersions();
  }, []);

  if(!data) return "Loading..."

  if(!docID) return "Not ID"


  function loadLastVersion(){
    const jwtToken = document.cookie.split("=")[1];
    const query = {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset = UTF-8"
      },
      body: JSON.stringify({
        docID,
        jwtToken
      })
    };
    fetch("https://sheet-backend.iran.liara.run/versions/load", query)
    .then((response) => response.json())
    .then((d) => {
      if(d?.done && d?.data){
        setData(d?.data);
      }
      else{
        let emptyData = [];
        for(let i = 0; i < 50; i++){
          emptyData.push(alphabet?.map(r =>{
            return{
              type: "string",
              value: ""
            }
          }));
        }
        setData(emptyData);
      }
    });
  };

  function loadVersions() {
    const jwtToken = document.cookie.split('=')[1];

    const query = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset = UTF-8',
        },
        body: JSON.stringify({
            docID,
            jwtToken
        })
    };

    fetch('https://sheet-backend.iran.liara.run/documents/versions/load', query)
      .then((response) => response.json())
      .then((d) => {
            if (d?.done) {
                setVersion(d?.versions || [])
            }
        }
      )
  }

  function deleteVersion(docID, verId, loadVersions) {
    const jwtToken = document.cookie.split('=')[1];
    const query = {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset = UTF-8',
        },
        body: JSON.stringify({
            docID,
            verId,
            jwtToken
        })
    };

    fetch('https://sheet-backend.iran.liara.run/versions/delete', query)
        .then((response) => response.json())
        .then((d) => {
            if (d?.done) {
                loadVersions && loadVersions();
            }
        })
  }

  return (
    <div className='historyPage'>
      <div className="sheet2">
        <table className='sheetTable'>
            <tr className='sheetTableTr'>
                <th></th>
                {alphabet?.map(letters => {
                    return (
                        <th >
                            {letters}
                        </th>
                    )
                })}
            </tr>
            {data?.map((row, rowIndex) => {
                return (
                    <tr className='sheetTableTr'>
                        <td >{rowIndex + 1}</td>
                        {row?.map((col, colIndex) => {
                            return (
                                <td onClick={(e) => { setFocusedCell({ rowIndex, colIndex }); }} >
                                    {getValue(col, rowIndex, colIndex, focusedCell)}
                                </td>
                            )
                        })}
                    </tr>
                )
            })}
        </table>
      </div>
      <div className = 'historySideBar'>
        <div className = 'w3-center w3-padding w3-text-blue'>
            Versions
        </div>
        {versions.slice().reverse().map(v => {
            return (
                <div className = 'versionCart' onClick = {() => setData(v.data)}>
                    <div>id: {v.versionID}</div>
                    <div>time: {convertTime(v.creationDate)}</div>
                    <div className = 'w3-text-red' onClick = {() => deleteVersion(docID, v.versionID, loadVersions)}>X</div>
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default HistoryPage

function convertTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US').replace(/\//g, '-');
}