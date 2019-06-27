import React, { Component } from 'react'
import axios from 'axios'
import moment from 'moment'
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
    Stamp,
    Dropdown,
    Button,
    StampCard,
    StatsCard,
    ProgressCard,
    Badge,
    ContactCard,
    Form,
    Dimmer,
    Tag
} from "tabler-react";


import SiteWrapper from './sitewrapper'

import Cookies from 'js-cookie'
import { API_URL } from '../constants.js'

const _ = require('lodash')

class buyCMB extends Component {
    state = {
        tableItems: [],
        tableItems1: {},
        loading: false,
        toggleWalletCard: true,
        searchTerm: '',
        userid: Cookies.get('userid'),
        buttonLoading: false,
        logout :false
    }

    async componentDidMount() {
        axios.defaults.headers['x-session-id'] = Cookies.get('session-id')
        await this.onty({ target: { value: 'pending' } })
    }

    async onty(a) {
        await this.setState({ searchTerm: a.target.value })
        if (this.state.searchTerm.length > 2) {
            let tableItems = []
            try {
                this.setState({ loading: true })
                let { data } = await axios.get(`${API_URL}/admin/add-funds/request/lookup?status=${this.state.searchTerm}`)
                data = data.data.buyRequest
                await data.map((item, i) => {
                    item['loading'] = false
                    tableItems.push({
                        key: i,
                        item: [
                            {
                                content: (<Text RootComponent="span" muted>{i + 1}</Text>),
                            },
                            {
                                content: item.user_doc.first_name,
                            },
                            { content: item.user_doc.last_name },
                            { content: item.user_doc.email },
                            { content: item.buy_qty },
                            { content: item.coin_doc.symbol },
                            {
                                content: (
                                    <React.Fragment>
                                        <span className={item.status == 20 ? "status-icon bg-success" : item.status == 10 ? "status-icon bg-warning" : "status-icon bg-danger"} /> {item.status == 20 ? 'Fulfilled' : item.status == 10 ? "Awaiting Payment" : "Cancelled"}
                                    </React.Fragment>
                                ),
                            },
                            { content: moment(item.timestamp).format('DD-MMM-YYYY hh:mm a') },
                            {
                                alignContent: "right",
                                content: (
                                    <React.Fragment>
                                        <Button size="sm" color="secondary" onClick={(e) => this.oncl(item)}>
                                            Details
                                        </Button>
                                        <span> </span>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            onClick={(e) => this.onProcessClick(item.buy_id)}
                                            disabled={item.status == 10 ? false : true}>
                                            Process
                                        </Button>
                                        <span> </span>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            onClick={(e) => this.onCancelClick(item.buy_id,i)}
                                            loading={item.loading}
                                            disabled={item.status == 10 ? false : true}>
                                            Cancel
                                        </Button>
                                    </React.Fragment>
                                ),
                            }
                        ],
                        buyId : item.buy_id
                    })
                })
                await this.setState({ tableItems: tableItems })
                await this.setState({ loading: false })
            } catch (e) {
                await this.setState({ tableItems: [] })
                await this.setState({ loading: false })
            }
        } else {
            await this.setState({ tableItems: [] })
        }
    }

    async onClickResend(type) {
        try {
            await this.setState({ loadingButton: true })
            let r = await axios.post(`${API_URL}/admin/add-funds/resendEmail`, {
                buy_id: this.state.tableItems1.buy_id,
                emailType: type
            })
            await this.setState({ loadingButton: false })
        } catch (e) {
            await this.setState({ loadingButton: false })
            alert(e.response.data.message)
        }
    }


    async onCancelClick(buy_id) {
        try {
            await this.setState({ loading: true })
            let r = await axios.post(`${API_URL}/admin/add-funds/cancel`, {
                buy_id: buy_id
            })

            let tableArr = this.state.tableItems
            console.log(tableArr[0])
            let arrIndex = _.findIndex(tableArr, { buyId: '7d298bc6-0548-4e6b-9f9d-433d907d2372' })
            console.log(arrIndex)
            tableArr.splice(arrIndex, 1)

            await this.setState({ tableItems: tableArr })
            await this.setState({ loading: false })
            //this.onty({ target: { value: this.state.searchTerm } })
        } catch (e) {
            await this.setState({ loading: false })
            alert(e.response.data.message)
        }
    }

    async onProcessClick(buy_id) {
        try {
            await this.setState({ loading: true })
            let r = await axios.post(`${API_URL}/admin/add-funds/process`, {
                buy_id: buy_id
            })
            this.onty({ target: { value: this.state.searchTerm } })
        } catch (e) {
            await this.setState({ loading: false })
            alert(e.response.data.message)
        }
    }



    async oncl(a) {
        try {
            console.log(a)
            await this.setState({ tableItems1: a })
            await this.setState({ toggleWalletCard: false })
        } catch (e) {
            await this.setState({ tableItems1: {} })
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
                                    <strong>You can type </strong> all, pending, cancelled or processed to filter the requests.
                            </Alert>

                                <Form.Input
                                    className="mb-3"
                                    icon="search"
                                    placeholder="Type all, pending, cancelled or processed to filter the requests"
                                    position="append"
                                    value={this.state.searchTerm}
                                    onChange={(e) => { this.onty(e) }}
                                />


                                {
                                    this.state.tableItems.length == 0 && this.state.loading == false ? (
                                        <Card statusColor="blue">

                                            <p style={{ margin: 30, textAlign: "center" }}>
                                                <img src="images/no-result.svg" style={{ height: 160, margin: 20 }} /><br />
                                                Results will appear here when available</p>
                                        </Card>
                                    ) : (
                                            <Dimmer active={this.state.loading} loader>
                                                <Card title="Buy Requests"
                                                    statusColor="blue">
                                                    <Table
                                                        responsive={true}
                                                        className="card-table table-vcenter text-nowrap"
                                                        headerItems={[
                                                            { content: "No.", className: "w-1" },
                                                            { content: "First Name" },
                                                            { content: "Last Name" },
                                                            { content: "Email" },
                                                            { content: "Qty" },
                                                            { content: "Coin" },
                                                            { content: "status" },
                                                            { content: "Date" },
                                                            { content: null },
                                                        ]}
                                                        bodyItems={this.state.tableItems}
                                                    />

                                                    <Card.Footer>
                                                        {this.state.tableItems.length} buy request found
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
                                                <Card.Title>Buy Record</Card.Title>
                                                <Card.Options>
                                                    <Button color="primary" size="sm" onClick={() => this.setState({ toggleWalletCard: true })}>
                                                        Back
                                                    </Button>
                                                </Card.Options>
                                            </Card.Header>
                                            <Card.Body>
                                                <ContactCard
                                                    cardTitle={<React.Fragment><Icon name="bar-chart" /> Summary</React.Fragment>}
                                                    details={[

                                                        { title: "First", content: this.state.tableItems1.user_doc.first_name },
                                                        { title: "Last Name", content: this.state.tableItems1.user_doc.last_name },

                                                        { title: "Email", content: this.state.tableItems1.user_doc.email },
                                                        { title: "User ID", content: this.state.tableItems1.user_id },

                                                        { title: "Buy Reference ID", content: "2189b3c5-2c49-45ac-bccb-ff4610f574cb" },

                                                        {
                                                            title: "Status",
                                                            content: <Tag color={this.state.tableItems1.status == 10 ? 'yellow' : this.state.tableItems1.status == 20 ? 'lime' : 'red'} addOn={<Icon name={this.state.tableItems1.status == 10 ? 'circle' : this.state.tableItems1.status == 20 ? 'check-circle' : 'x-circle'} />}>{this.state.tableItems1.status == 10 ? 'Awaiting Payment' : this.state.tableItems1.status == 20 ? 'Fulfilled' : 'Cancelled'}</Tag>,
                                                        },
                                                        {
                                                            title: "Buy Qty",
                                                            content: <Tag color="lime" addOn={<Icon name="shopping-bag" />}>{this.state.tableItems1.buy_qty}</Tag>,
                                                        },
                                                        {
                                                            title: "Coin",
                                                            content: "CMB",
                                                        },
                                                        { title: "Pay Mode", content: "OTC" },
                                                        { title: "Buy Request Created On", content: moment(this.state.tableItems1.timestamp).format("h:mm:ss A DD-MMMM-YYYY ") },

                                                    ]}
                                                />

                                                <ContactCard
                                                    cardTitle={<React.Fragment><Icon name="box" /> Transaction Details</React.Fragment>}
                                                    details={[
                                                        { title: "Sender Address", content: <Tag color="red" addOn={<Icon name="arrow-up-right" />}>{this.state.tableItems1.source_address}</Tag> },
                                                        { title: "Receiver Address", content: <Tag color="indigo" addOn={<Icon name="arrow-down-left" />}>{this.state.tableItems1.receiver_address}</Tag> },
                                                        {
                                                            title: "Trx Hash",
                                                            content: <Tag.List>
                                                                {this.state.tableItems1.trx_doc.map(e => {
                                                                    return <Tag>{e.tx_hash}</Tag>
                                                                })}
                                                            </Tag.List>
                                                        },

                                                    ]}
                                                />

                                                <ContactCard
                                                    cardTitle={<React.Fragment><Icon name="rss" /> Spot Rate</React.Fragment>}
                                                    details={[{ title: "Spot Rate ID", content: "62f20921-03ec-44d2-b44f-635ca5605b54" },
                                                    { title: "Spot Rate Timestamp", content: moment(this.state.tableItems1.spotrate_doc.price_data.date).format("h:mm:ss A DD-MMMM-YYYY ") },
                                                    { title: "Spot Rate (USD)", content: <span>{"1.04 "} <Icon flag name="us" /></span> },
                                                    { title: "Spot Rate (SGD)", content: <span>{"1.40 "} <Icon flag name="sg" /></span> },
                                                    ]}
                                                />

                                                <ContactCard
                                                    cardTitle={<React.Fragment><Icon name="clipboard" /> Scheme Details</React.Fragment>}
                                                    details={[
                                                        { title: "Scheme Name", content: this.state.tableItems1.scheme_doc.scheme_name },
                                                        { title: "Scheme Duration", content: this.state.tableItems1.scheme_doc.scheme_duration_days + ' days'},
                                                        { title: "Scheme Reward Percent", content: this.state.tableItems1.scheme_doc.reward_percent }
                                                    ]}
                                                />

                                                <ContactCard
                                                    cardTitle={<React.Fragment><Icon name="briefcase" /> Bank Details</React.Fragment>}
                                                    details={[

                                                        { title: "Bank Name", content: this.state.tableItems1.bank_doc.bank_name },
                                                        { title: "Bank Branch", content: this.state.tableItems1.bank_doc.branch_name },

                                                        { title: "Bank Code", content: this.state.tableItems1.bank_doc.bank_code },

                                                        { title: "Account No", content: this.state.tableItems1.bank_doc.account_no },
                                                        { title: "SWIFT Code", content: this.state.tableItems1.bank_doc.SWIFT_code },

                                                    ]}
                                                />
                                            </Card.Body>
                                            <Card.Footer>
                                                <Button color="secondary" size="sm" loading={this.state.loadingButton} disabled={this.state.loadingButton || this.state.tableItems1.status != 10} onClick={() => { this.onClickResend('buyRequest') }}>Resend Request Email</Button>
                                                <span> </span>
                                                <Button color="secondary" size="sm" loading={this.state.loadingButton} disabled={this.state.loadingButton || this.state.tableItems1.status != 20} onClick={() => { this.onClickResend('buyProcessed') }}>Resend Processed Email</Button>
                                                <span> </span>
                                                <Button color="secondary" size="sm" loading={this.state.loadingButton} disabled={this.state.loadingButton || this.state.tableItems1.status != 30} onClick={() => { this.onClickResend('buyCancelled') }}>Resend Cancelled Email</Button>
                                            </Card.Footer>
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

export default buyCMB