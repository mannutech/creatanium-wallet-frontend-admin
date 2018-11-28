import React, { Component } from 'react'
import "tabler-react/dist/Tabler.css";
import { LoginPage, Page, Form, FormCard, Button, Card, Dimmer } from "tabler-react";
import axios from 'axios'
import Cookies from 'js-cookie'
import { API_URL } from '../constants.js'
class Login extends Component {
    state = {
        username: '',
        password: '',
        loading: false,
        error: false,
        errormsg: 'Error encountered'
    }

    async handleLogin() {
        try {
            await this.setState({ loading: true })
            let { data } = await axios.get(`${API_URL}/admin/login?username=${this.state.username}&password=${this.state.password}`)
            //console.log(data.data)
            await Cookies.set('session-id',data.data.sessionid)
            await Cookies.set('name',data.data.firstname + ' ' + data.data.lastname)
            await Cookies.set('email',data.data.email)
            await Cookies.set('userid',data.data.userid)
            await this.setState({ loading: false, error: false, errormsg: '' })
            this.props.history.push('/')
        } catch (e) {
            await this.setState({ loading: false, error: true, errormsg: 'Cannot login' })
        }
    }
    render() {
        return (
            <div className="page">
                <div className="page-single">
                    <div className="container">
                        <div className="row">
                            <div className="col col-login mx-auto">
                                <div className="text-center mb-6">
                                    <img src="images/creatanium-logo.png" className="h-7" alt="" />
                                </div>

                                <Card statusColor="blue">
                                    {this.state.error == true ?
                                        (
                                            <Card.Alert color="danger">
                                                {this.state.errormsg}
                                            </Card.Alert>
                                        ) :
                                        (<span />)
                                    }

                                    <Dimmer active={this.state.loading} loader>
                                        <Card.Body className="p-6">
                                            <Card.Title RootComponent="div">Login to your account</Card.Title>
                                            <Form.Input label='Username' placeholder='Enter username' icon='user' value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }) }}></Form.Input>
                                            <Form.Input label='Password' placeholder='Enter password' icon='lock' type='password' value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }}></Form.Input>
                                            <Form.Footer>
                                                <Button color="primary" block={true} onClick={() => { this.handleLogin() }}>
                                                    Login
                                            </Button>
                                            </Form.Footer>
                                        </Card.Body>
                                    </Dimmer>
                                </Card>

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}

export default Login