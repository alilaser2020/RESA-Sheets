import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const AccessDocument = ({ loadDocuments, showAccessModal, setShowAccessModal }) => {

    const theme = useTheme();
    const [accessValue, setAccessValue] = useState(showAccessModal?.access || []);
    const [users, setUsers] = useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setAccessValue(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const buttonStyle = { fontSize: "1.7rem", padding: "1rem", borderRadius: "1.2rem", marginTop: "1.5rem" };

    useEffect(() => {
        loadUsers();
    }, [])

    const closeAccessDoc = () => {
        setShowAccessModal(null);
    }

    const loadUsers = () => {
        const query = {
            method: "POST",
            headers: {
                "Content-type" : "application/json; charset = UTF-8"
            },
            body: JSON.stringify({})
        };
        fetch("https://sheet-backend.iran.liara.run/users/loadall", query)
        .then((response) => response.json())
        .then((data) => {
            if(data?.users){
                setUsers(data?.users);
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const onSubmit = (e) => {
        e.preventDefault();
        const jwtToken = document.cookie.split("=")[1];
        const query = {
            method: "POST",
            headers: {
                "Content-type" : "application/json; charset = UTF-8"
            },
            body: JSON.stringify({
                docID: showAccessModal?.docID,
                access: accessValue,
                jwtToken
            })
        };
        fetch("https://sheet-backend.iran.liara.run/documents/giveAccess", query)
        .then((response) => response.json())
        .then((data) => {
            if(data?.done){
                closeAccessDoc();
                loadDocuments && loadDocuments();
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className = "w3-modal-content">
            <header className = "w3-container">
                <span className='w3-button w3-text-red w3-display-topright' onClick = {()=>closeAccessDoc()}>
                    <h4>X</h4>
                </span>
            </header>
            <form className="formHolder">
                <p style={{ textAlign: "center", fontWeight: "bold" }}>Edit Access</p>
                <FormControl sx={{ m: 1, width: 400, marginLeft: "7rem" }}>
                    <InputLabel id="demo-multiple-name-label">Name</InputLabel>
                    <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        multiple
                        value={accessValue}
                        onChange={handleChange}
                        input={<OutlinedInput label="Name" />}
                        MenuProps={MenuProps}
                    >
                        {users.map((username) => (
                            <MenuItem
                                key={username}
                                value={username}
                                style={getStyles(username, accessValue, theme)}
                            >
                                {username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button size="large" sx={buttonStyle} variant="contained" type="submit" onClick = {(e) => onSubmit(e)}>Give Access</Button>
            </form>
        </div>
    )
}

export default AccessDocument


