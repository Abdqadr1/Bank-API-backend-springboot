import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { listFormData, SPINNERS_BORDER_HTML} from '../utilities';

const AddEditModal = ({ hideModal, edit, editCountry, token }) => {
    const [form, setForm] = useState({});
    const url = process.env.REACT_APP_COUNTRY_URL + "/edit";
    const navigate = useNavigate();
    const abortControllerRef = useRef();
    const alertRef = useRef();
    const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
    const toggleAlert = () => {
        setAlert({...alert, show: !alert.show})
    }

    useEffect(() => {
        if (!alert.show) return;
        alertRef.current && alertRef.current.focus()
    }, [alert]);

    useEffect(() => {
        if (edit?.country && edit.country?.country) {
            setForm({ ...edit.country, country: edit.country.country.id });
        }
        setAlert(s => ({ ...s, show: false }))
        abortControllerRef.current = new AbortController();
        return () => abortControllerRef.current.abort();
    }, [edit.country]);

    const handleChange = (event) => {
        setForm(s => ({
            ...s,
            [event.target.id]: event.target.value
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const target = event.target;
        const data = new FormData(target);
        listFormData(data);
        const button = target.querySelector("button");
        button.disabled = true;
        const text = button.textContent;
        button.innerHTML = SPINNERS_BORDER_HTML;
        axios.post(url, data, {
            headers: {
                "Authorization" : "Bearer " + token
            },
            signal: abortControllerRef.current.signal
        })
            .then(res => {
                editCountry(res.data);
                setAlert(s => ({ ...s, variant: "success", show: true, message: "Country saved!" }));
            })
            .catch(error => {
                const response = error?.response;
                if (response.status === 406) navigate("/login/1");
                const message = response.data.message ?? "Something went wrong";
                setAlert(s => ({...s, variant: "danger", show: true, message}))
            })
            .finally(() => {
                button.innerHTML = text;
                button.disabled = false;
            })
    }

    return (
        <>
            <Modal show={edit.show} onHide={()=>hideModal('edit')}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Country (ID : {edit?.country?.id})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert ref={alertRef} tabIndex={-1} variant={alert.variant} show={alert.show} dismissible onClose={toggleAlert}>
                        {alert.message}
                    </Alert>
                    <Form onSubmit={handleSubmit}>
                        <input type="hidden" name="id" value={form?.id ?? ""} />
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Country name</Form.Label>
                            <Form.Control value={form?.name ?? ""} name="name"  onChange={handleChange} type="text" placeholder="Enter full name" required minLength="3" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="alias">
                            <Form.Label>Alias</Form.Label>
                            <Form.Control value={form?.alias ?? ""} name="alias"  onChange={handleChange} type="text" placeholder="Enter short name" required minLength="3" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="currency">
                            <Form.Label>Currency</Form.Label>
                            <Form.Control value={form?.currency ?? ""}  onChange={handleChange} name="currency" type="text" placeholder="Enter currency" required minLength="3"/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="code">
                            <Form.Label>Code</Form.Label>
                            <Form.Control value={form?.code ?? ""}  onChange={handleChange} name="code" type="number" placeholder="Enter code" required minLength="3"/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="longCode">
                            <Form.Label>Long Code</Form.Label>
                            <Form.Control value={form?.longCode ?? ""}  onChange={handleChange} name="longCode" type="number" placeholder="Enter long code" required minLength="3"/>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal> 
        </>
     );
}

export default AddEditModal;
