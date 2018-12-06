import React, { Component } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
    Page,
    Avatar,
    Icon,
    Grid,
    Card,
    Text,
    Table,
    Alert,
    Progress,
    colors,
    Dropdown,
    Button,
    StampCard,
    StatsCard,
    ProgressCard,
    Badge,
    Form,
    Dimmer
} from "tabler-react";


import SiteWrapper from './sitewrapper'

import Cookies from 'js-cookie'
import { API_URL } from '../constants.js'


class UserLookup extends Component {
    state = {
        tableItems: [],
        tableItems1: [],
        loading: false,
        toggleWalletCard: true,
        userid: Cookies.get('userid')
    }

    componentDidMount() {
        axios.defaults.headers['x-session-id'] = Cookies.get('session-id')
    }

    async onty(a) {
        let tableItems = []
        try {
            this.setState({ loading: true })
            let { data } = await axios.get(`${API_URL}/admin/userlookup?keyword=${a.target.value}`)
            await data.map((item, i) => {
                tableItems.push({
                    key: i,
                    item: [
                        {
                            content: (<Text RootComponent="span" muted>{i + 1}</Text>),
                        },
                        {
                            content: item.first_name,
                        },
                        { content: item.last_name },
                        { content: item.country },
                        { content: item.email },
                        { content: item.mobile.replace('$', ' ') },
                        {
                            content: (
                                <React.Fragment>
                                    <span className={item.is_email_confirmed == true ? "status-icon bg-success" : "status-icon bg-warning"} /> {item.is_email_confirmed == true ? 'Yes' : 'No'}
                                </React.Fragment>
                            ),
                        },
                        {
                            alignContent: "right",
                            content: (
                                <React.Fragment>
                                    <Button size="sm" color="secondary" onClick={(e) => this.oncl(item.user_id)}>
                                        Wallet Details
                                    </Button>
                                    <span> </span>
                                    <Link to={{ pathname: '/transactions', state: { userid: item.user_id, symb: 'all' } }} props>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                        >
                                            Transactions
                                    </Button>
                                    </Link>
                                </React.Fragment>
                            ),
                        }
                    ]
                })
            })

            await this.setState({ tableItems: tableItems })
            await this.setState({ loading: false })
        } catch (e) {
            await this.setState({ tableItems: [] })
            await this.setState({ loading: false })
        }
    }

    async refreshBal(coinid, address, user_id) {
        await this.setState({ loading: true })
        await axios.get(`${API_URL}/admin/refreshbalance?coin_id=${coinid}&address=${address}`)
        await this.oncl(user_id)
        await this.setState({ loading: false })
    }

    async oncl(a) {
        let tableItems1 = []
        try {
            await this.setState({ toggleWalletCard: false })
            await this.setState({ loading: true })

            let { data } = await axios.get(`${API_URL}/admin/walletlookup?userid=${a}`)
            await data.map((item, i) => {
                tableItems1.push({
                    key: i,
                    item: [
                        {
                            content: (<Text RootComponent="span" muted>{i + 1}</Text>),
                        },
                        {
                            content: item.coin_name,
                        },
                        {
                            content: item.coin_symbol,
                        },
                        { content: item.address },
                        { content: item.converted_amt_locked },
                        { content: item.converted_amt_spend },
                        { content: item.converted_amt_tot },
                        {
                            content: (
                                <React.Fragment>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        icon="refresh-cw"
                                        onClick={() => { this.refreshBal(item.coin_id, item.address, item.user_id) }}
                                    >
                                        Refresh Balance
                                    </Button>
                                    <span> </span>
                                    <Link to={{ pathname: '/transactions', state: { userid: item.user_id, symb: item.coin_symbol } }} props>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                        >
                                            Transactions
                                    </Button>
                                    </Link>
                                </React.Fragment>
                            ),
                        },
                    ]
                })
            })

            await this.setState({ tableItems1: tableItems1 })
            await this.setState({ loading: false })
        } catch (e) {
            await this.setState({ tableItems1: [] })
            await this.setState({ toggleWalletCard: true })
            await this.setState({ loading: false })
        }
    }



    render() {
        return (
            <SiteWrapper>
                <Page.Content>
                    {this.state.toggleWalletCard == true ? (
                        <Grid.Row>
                            <Grid.Col width={12}>
                                <Alert type="primary" isDismissible>
                                    <strong>You can use </strong> email, first name, last name, user id, mobile no, address line to lookup.
                            </Alert>

                                <Form.Input
                                    className="mb-3"
                                    icon="search"
                                    placeholder="Type any information that can be used to identify the user"
                                    position="append"
                                    onChange={(e) => { this.onty(e) }}
                                />

                                {
                                    this.state.tableItems.length == 0 ? (
                                        <Card statusColor="blue">

                                            <p style={{ margin: 30, textAlign: "center" }}>
                                                <img src="images/no-result.svg" style={{ height: 160, margin: 20 }} /><br />
                                                Results will appear here when available</p>
                                        </Card>
                                    ) : (
                                            <Dimmer active={this.state.loading} loader>
                                                <Card title="User List"
                                                    statusColor="blue">
                                                    <Table
                                                        responsive={true}
                                                        className="card-table table-vcenter text-nowrap"
                                                        headerItems={[
                                                            { content: "No.", className: "w-1" },
                                                            { content: "First Name" },
                                                            { content: "Last Name" },
                                                            { content: "Country" },
                                                            { content: "Email" },
                                                            { content: "Mobile" },
                                                            { content: "Email Verified" },
                                                            { content: null },
                                                        ]}
                                                        bodyItems={this.state.tableItems}
                                                    />

                                                    <Card.Footer>
                                                        {this.state.tableItems.length} user found
                                                    </Card.Footer>
                                                </Card>
                                            </Dimmer>
                                        )
                                }


                            </Grid.Col>
                        </Grid.Row>
                    ) : (
                            <Grid.Row >
                                <Grid.Col width={12}>
                                    <Dimmer active={this.state.loading} loader>
                                        <Card statusColor="blue">
                                            <Card.Header>
                                                <Card.Title>Wallet Details</Card.Title>
                                                <Card.Options>
                                                    <Button color="primary" size="sm" onClick={() => this.setState({ toggleWalletCard: true })}>
                                                        Back To User List
                                        </Button>
                                                </Card.Options>
                                            </Card.Header>
                                            <Table
                                                responsive={true}
                                                className="card-table table-vcenter text-nowrap"
                                                headerItems={[
                                                    { content: "No.", className: "w-1" },
                                                    { content: "Coin" },
                                                    { content: "Symbol" },
                                                    { content: "Address" },
                                                    { content: "Locked Bal" },
                                                    { content: "Unlocked Bal" },
                                                    { content: "Total Bal" },
                                                    { content: null }
                                                ]}
                                                bodyItems={this.state.tableItems1}
                                            />
                                        </Card>
                                    </Dimmer>
                                </Grid.Col>
                            </Grid.Row>
                        )}
                </Page.Content>
            </SiteWrapper >
        );
    }
}

export default UserLookup