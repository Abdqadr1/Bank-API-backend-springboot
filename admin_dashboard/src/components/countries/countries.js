import React from 'react';
import axios from "axios";
import Table from "react-bootstrap/Table";
import Country from './country';
import Container from 'react-bootstrap/Container';
import NavBar from '../navbar';
import MyPagination from '../traces/pagination';
import { Navigate } from 'react-router-dom';
import { SPINNERS_BORDER, useThrottle } from '../utilities';
import AddEditModal from './add_update';
import DeleteModal from '../delete_modal';
import MessageModal from "../message_modal"

class Countries extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            edit: {show: false,country: {}},
            delete: {show: false,id: 0 },
            add: false,
            pageInfo: {
                number: 1, totalPages: 1, startCount: 1,
                endCount: null, totalElements: null, numberPerPage: 1
            },
            user: JSON.parse(localStorage.getItem('user')),
            loading: true,
            messageModal: { show: false, title: "", message: "" },
            width: window.innerWidth
        };
        this.serverURl = process.env.REACT_APP_COUNTRY_URL;
        this.abortController = new AbortController();
        this.fetchCountries = this.fetchCountries.bind(this);
        this.delete = this.delete.bind(this);
        this.handleWindowWidthChange = this.handleWindowWidthChange.bind(this);
    }

    showModal = (which, id) => {
        if (which === "edit") {
            const country = this.state.countries.find(b => b.id === id);
            this.setState( state => ({
                    edit: {show:true, country}
                })
            )
        }
        if (which === "delete") {
            this.setState( state => ({
                    delete: {show:true, id}
                })
            )
        }
        if (which === "add") {
            this.setState( state => ({
                    add: true
                })
            )
        }
    }
    hideModal = (which) => {
        if (which === "edit") {
            this.setState(s => ({...s, edit : {...s.edit, show:false}}))
        }
        if (which === "delete") {
            this.setState(s => ({...s, delete : {...s.delete, show:false}}))
        }
        if (which === "add") {
            this.setState(state => ( { add: false }  ))
        }
        if (which === "message") {
            this.setState(s => ({messageModal:{...s.messageModal, show:false}}))
        }
    }
    delete = (id, cb) =>  {
        axios.delete(`${this.serverURl}/delete/${id}`, {
            headers: {
                "Authorization": "Bearer " + this.state.user?.access_token
            },
            signal: this.abortController.signal
        })
            .then(() => {
                this.setState(state => ({
                    countries: state.countries.filter(country => country.id !== id)
                }));
                this.setState(s => ({
                    messageModal: {
                        ...s.messageModal, show: true,
                        title: "Delete Country", message: "Country deleted"
                    }
                }))
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 406) this.setState(() => ({ user: {} }))
                    this.setState(s => ({
                        messageModal: {
                            ...s.messageModal, show: true,
                            title: "Delete Country", message: "Could not delete country"
                        }
                    }))
                }
            }).finally(() => {
                this.setState({ delete: { show: false, id: -1 }})
                cb();
            });
    }
    edit = (country) => {
        const countries = this.state.countries;
        const index = countries.findIndex(b => b.id === country.id);
        countries[index] = country;
        this.setState(s => ({...s, countries: [...s.countries]}))
    }
    add = (country) => {
       this.setState(s => ({...s, countries: [...s.countries, country]}))
    }

    handleWindowWidthChange = useThrottle(() => this.setState({width: window.innerWidth}), 500)

    componentDidMount() {
        window.addEventListener("resize", this.handleWindowWidthChange);
        this.fetchCountries(1);
    }

    fetchCountries(pageNumber) {
        this.setState(s => ({ loading: true }));
        const url = `${this.serverURl}/page/${pageNumber}`;
         axios.get(url,{
            headers: {
                "Authorization": "Bearer " + this.state.user?.access_token
             },
             signal: this.abortController.signal
         })
             .then(res => {
                const data = res.data;
                 this.setState(s => ({
                     countries: data.countries,
                     pageInfo: {
                         endCount: data.endCount,
                         startCount: data.startCount,
                         totalPages: data.totalPages,
                         totalElements: data.totalElements,
                         numberPerPage: data.numberPerPage,
                         number: data.currentPage
                     }
                 }));
            })
            .catch(error => {
                if (error?.response?.status === 406) this.setState(() => ({ user: { } } ))
            })
            .finally(() => {
                this.setState(s => ({loading: false}))
            })
    }
    componentWillUnmount() {
        this.abortController.abort();
        window.removeEventListener("resize", this.handleWindowWidthChange)
    }

    listCountries(countries, type) {
        return (countries.length > 0)
            ? countries.map(country => <Country key={country.id} viewType={type} {...country} showModal={this.showModal} />)
            : ((type === 'detailed')
                ? <tr><td colSpan={7} className="text-center">No Country found</td></tr>
                : <div className="text-center my-3 fw-bold">No Country found</div>)
    }

    render() {
        if(!this.state.user?.access_token) return (<Navigate to={'/login'} />) 
        return (
            <>
                {
                    (this.state.loading)
                        ? <div className="mx-auto" style={{ height: "40vh", display: "grid" }}>{SPINNERS_BORDER}</div>
                        :
                        <React.Fragment>
                            <NavBar />
                            <Container>
                                <>
                                    <div className="d-flex justify-content-start my-3">
                                        <span className="material-icons fs-1 text-secondary" onClick={() => this.showModal("add")}>
                                            note_add
                                        </span>
                                    </div>
                                    {
                                        (this.state.width >= 769)
                                        ? 
                                            <Table striped bordered hover size="sm">
                                                <thead className="bg-light text-dark">
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Alias</th>
                                                        <th className="d-md-none d-lg-block">Type</th>
                                                        <th>Code</th>
                                                        <th className="d-md-none d-lg-block">Long Code</th>
                                                        <th>Enabled</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='border-top-0'>
                                                    {this.listCountries(this.state.countries, 'detailed')}
                                                </tbody>
                                            </Table>
                                        
                                        : this.listCountries(this.state.countries, 'less')
                                    }
                                </>
                                <MyPagination pageInfo={this.state.pageInfo} go={this.fetchCountries} />
                                <AddEditModal edit={this.state.edit} hideModal={this.hideModal}
                                    editCountry={this.edit} token={this.state.user?.access_token} />
                                <DeleteModal obj={this.state.delete} hideModal={this.hideModal} deleteCountry={this.delete} />
                                <MessageModal obj={this.state.messageModal} hideModal={this.hideModal} />
                            </Container>
                        </React.Fragment>
                }
                
            </>
            
        );
    }
}

export default Countries;