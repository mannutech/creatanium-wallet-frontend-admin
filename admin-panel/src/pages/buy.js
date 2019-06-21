import React, { Component } from 'react'
import "tabler-react/dist/Tabler.css";
import { LoginPage, Page, Alert, Form, FormCard, TabbedContainer, TabbedHeader, Button, Text, Card, Dimmer, Tab, Tabs, Table, Grid, Tag, Icon, ContactCard, Timeline } from "tabler-react";
import axios from 'axios'
import Cookies from 'js-cookie'
import { API_URL } from '../constants.js'
import moment from 'moment'


import SiteWrapper from './sitewrapper'

import '../index.css'
import { white } from 'ansi-colors';

class Buy extends Component {
    state = {
        pendingTable: [],
        kycApprovalTable: [],
        otcApprovalTable: [],
        accountsApprovalTable: [],
        managementApprovalTable: [],
        readyProcessTable: [],
        processedTable: [],
        cancelledTable: [],
        searchResultTable: [],
        requestData: {
            "overview": {
                "buyId": "",
                "approval": {
                    "kyc": {
                        "approved": false,
                        "by": "",
                        "on": ""
                    },
                    "otc": {
                        "approved": false,
                        "by": "",
                        "on": ""
                    },
                    "management": {
                        "approved": false,
                        "by": "",
                        "on": ""
                    },
                    "accounts": {
                        "approved": false,
                        "by": "",
                        "on": ""
                    }
                },
                "requestDate": "",
                "aggrementDate": "",
                "confirmationDate": "",
                "status": 10
            },
            "notes": {
                "internal": [],
                "user": []
            },
            "summary": {
                "firstName": "",
                "lastName": "",
                "email": "",
                "userId": "",
                "payMode": ""
            },
            "transaction": {
                "senderAddress": "",
                "receiverAddress": "",
                "trxHash": []
            },
            "exchangeRates": {
                "spotRateId": "",
                "rates": {
                    "cmbusd": "",
                    "cmbsgd": "",
                    "sgdusd": "",
                    "usdsgd": "",
                    "ethusd": "",
                    "btcusd": ""
                },
                "timestamp": ""
            },
            "investment": {
                "buyQty": "",
                "coin": "",
                "bonusTokens": "",
                "baseTokensUSD": "",
                "bonusTokenUSD": "",
                "TotalTokensUSD": ""
            },
            "scheme": {
                "name": "",
                "duration": "",
                "bonus": "",
                "description": ""
            },
            "bank": {
                "name": "",
                "branch": "",
                "code": "",
                "accNo": "",
                "swiftCode": ""
            },
            "approvalState": [
                false,
                false,
                false,
                false
            ]
        },
        loading: false,
        approveLoading: {
            kyc: false,
            otc: false,
            accounts: false,
            management: false
        },
        requestDetailCardVisible: false,
        alertType: 'info',
        alertText: '',
        alertVisible: false,
        selectedTab: 'Pending',
        searchValue: ''
    }

    async componentDidMount() {
        axios.defaults.headers['x-session-id'] = Cookies.get('session-id')
        await this.handleLoadTab('Pending')
    }


    async handleLoadTab(title) {
        await this.setState({ selectedTab: title, loading: true });
        if (title == 'Pending') {
            this.handleRequestLookup('pending', 'pendingTable')
        }
        if (title == 'KYC Approval') {
            this.handleRequestLookup('approvalPending', 'kycApprovalTable', 'kyc')
        }
        if (title == 'OTC Approval') {
            this.handleRequestLookup('approvalPending', 'otcApprovalTable', 'otc')
        }
        if (title == 'Accounts Approval') {
            this.handleRequestLookup('approvalPending', 'accountsApprovalTable', 'accounts')
        }
        if (title == 'Management Approval') {
            this.handleRequestLookup('approvalPending', 'managementApprovalTable', 'management')
        }
        if (title == 'Approved') {
            this.handleRequestLookup('approved', 'readyProcessTable')
        }
        if (title == 'Processed') {
            this.handleRequestLookup('processed', 'processedTable')
        }
        if (title == 'Cancelled') {
            this.handleRequestLookup('cancelled', 'cancelledTable')
        }
        this.setState({ loading: false });

    }

    async handleGetRequestDetails(buyId = this.state.requestData.overview.buyId) {
        try {
            window.scrollTo(0, 0)
            let { data } = await axios.get(`${API_URL}/admin/add-funds/request/details?buyId=${buyId}`)
            this.setState({ requestData: data.data.buyRequest, requestDetailCardVisible: true })
        } catch{
            console.log('error while fetching request details')
            this.setState({ requestDetailCardVisible: false })
        }
    }

    async handleRevertApproveClick(type, buyId = this.state.requestData.overview.buyId) {
        try {
            let { data } = await axios.post(`${API_URL}/admin/add-funds/approval/revoke/${type}`, {
                "buyId": buyId
            })
            this.setState({ alertText: 'KYC approval reverted', alertVisible: true, alertType: 'success' })
            this.handleGetRequestDetails(buyId)

        } catch (e) {
            try {
                if (e.response.status === 400) {
                    this.setState({ alertText: e.response.data, alertVisible: true, alertType: 'danger' })
                } else {
                    throw "unknown"
                }
            } catch (e) {
                this.setState({ alertText: 'Revert approval request failed', alertVisible: true, alertType: 'danger' })
            } finally {
                this.handleGetRequestDetails(buyId)
            }
        }
    }

    async handleApproveClick(type, buyId = this.state.requestData.overview.buyId) {
        try {
            
            let { data } = await axios.post(`${API_URL}/admin/add-funds/approve/${type}`, {
                "buyId": buyId
            })
            this.setState({ alertText: 'Approved by ' + type.toUpperCase() + ' team', alertVisible: true, alertType: 'success' })
            this.handleGetRequestDetails(buyId)

        } catch (e) {
            try {
                if (e.response.status === 400) {
                    this.setState({ alertText: e.response.data, alertVisible: true, alertType: 'danger' })
                } else {
                    throw "unknown"
                }
            } catch (e) {
                this.setState({ alertText: 'Approval request failed', alertVisible: true, alertType: 'danger' })
            } finally {
                this.handleGetRequestDetails(buyId)
            }
        }
    }

    async handleCancel(buyId = this.state.requestData.overview.buyId) {
        try {
            window.scrollTo(0, 0)
            let r = await axios.post(`${API_URL}/admin/add-funds/cancel`, {
                buy_id: buyId
            })
            this.setState({ alertText: 'Request ' + buyId + ' has been cancelled successfully', alertVisible: true, alertType: 'info' })
            this.handleGetRequestDetails(buyId)
        } catch (e) {
            try {
                if (e.response.status === 400) {
                    this.setState({ alertText: e.response.data, alertVisible: true, alertType: 'danger' })
                } else {
                    throw "unknown"
                }
            } catch (e) {
                this.setState({ alertText: 'Cancellation of the request failed', alertVisible: true, alertType: 'danger' })
            } finally {
                this.handleGetRequestDetails(buyId)
            }
        }
    }

    async handleRequestLookup(status, tableName, approvalType = undefined, search = undefined) {
        let tableItems = []
        try {
            this.setState({ loading: true })

            let { data } = await axios.get(`${API_URL}/admin/add-funds/request/lookup?status=${status}&approvalType=${approvalType}&searchTerm=${search}`)
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
                                item.usdEquivPrice
                            ),
                        },
                        {
                            content: item.buy_id
                        },
                        { content: moment(item.timestamp).format('DD-MMM-YYYY hh:mm a') },
                        {
                            alignContent: "right",
                            content: (
                                <React.Fragment>
                                    <Button size="sm" color="secondary" onClick={(e) => this.handleGetRequestDetails(item.buy_id)}>
                                        Details
                                    </Button>
                                </React.Fragment>
                            ),
                        }
                    ],
                    buyId: item.buy_id
                })
            })
            await this.setState({ [tableName]: tableItems })
            await this.setState({ loading: false })
        } catch (e) {
            await this.setState({ [tableName]: [] })
            await this.setState({ loading: false })
        }
    }

    render() {
        return (
            <SiteWrapper>
                <Page.Content>

                    {this.state.alertVisible && <Alert type={this.state.alertType} isDismissible onDismissClick={() => { this.setState({ alertVisible: false }) }}>
                        {this.state.alertText}
                    </Alert>}

                    {this.state.requestDetailCardVisible == false && (<Card statusColor="blue">
                        <Card.Header>
                            <Card.Title>Buy Request</Card.Title>
                            <Card.Options>

                                <Form.InputGroup>
                                    <Form.Input
                                        className="form-control-sm"
                                        placeholder="Enter Buy Ref to search"
                                        value={this.state.searchValue}
                                        onChange={(e) => { this.setState({ searchValue: e.target.value }) }}
                                    />
                                    <span className="input-group-btn ml-2">
                                        <Button
                                            size="sm"
                                            color="blue"
                                            icon="search"
                                            onClick={async () => {
                                                await this.handleRequestLookup('all', 'searchResultTable', undefined, this.state.searchValue);
                                                this.state.searchResultTable.length ? this.setState({ selectedTab: 'Search Result' }) :
                                                    this.setState({ selectedTab: 'Pending' })
                                            }}
                                        />
                                    </span>
                                </Form.InputGroup>

                            </Card.Options>
                        </Card.Header>
                        <Card.Body>
                            {/*  <div style={{ width: '100%', backgroundColor: '#467fcf', padding: '0.5rem 1.5rem 0.5rem 1.5rem' }}>
                                <Form.Input name='username' placeholder='Search using Buy Id' />
                            </div> */}
                            <TabbedHeader
                                selectedTitle={this.state.selectedTab}
                                stateCallback={async (e) => { await this.handleLoadTab(e) }}
                            >

                                {this.state.searchResultTable.length > 0 && <Tab title="Search Result"></Tab>}
                                <Tab title="Pending"></Tab>
                                <Tab title="KYC Approval"></Tab>
                                <Tab title="OTC Approval"></Tab>
                                <Tab title="Accounts Approval"></Tab>
                                <Tab title="Management Approval"></Tab>
                                <Tab title="Approved"></Tab>
                                <Tab title="Processed"></Tab>
                                <Tab title="Cancelled"></Tab>
                            </TabbedHeader>
                            <TabbedContainer selectedTitle={this.state.selectedTab}>

                                {this.state.searchResultTable.length > 0 &&
                                    <Tab title="Search Result">
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
                                                { content: "Price USD" },
                                                { content: "Buy Ref." },
                                                { content: "Date" },
                                                { content: "Actions" },
                                            ]}
                                            bodyItems={this.state.searchResultTable}
                                        />
                                    </Tab>}

                                <Tab title="Pending">
                                    {this.state.pendingTable.length ? <Table
                                        responsive={true}
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.pendingTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>There are no newly created buy requests</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>When the customer creates the buy request it will appear here initially</div>

                                        </div>}
                                </Tab>

                                <Tab title="KYC Approval">
                                    {this.state.kycApprovalTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.kycApprovalTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no requests waiting for KYC approval</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the requests that requires the KYC approval will be shown here</div>
                                        </div>}
                                </Tab>

                                <Tab title="OTC Approval">
                                    {this.state.otcApprovalTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.otcApprovalTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no requests waiting for OTC approval</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the requests that requires the OTC approval will be shown here</div>
                                        </div>}</Tab>

                                <Tab title="Accounts Approval">
                                    {this.state.accountsApprovalTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.accountsApprovalTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no requests waiting for Accounts approval</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the requests that requires the Accounts approval will be shown here</div>
                                        </div>}</Tab>

                                <Tab title="Management Approval">
                                    {this.state.managementApprovalTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.managementApprovalTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no requests waiting for Management approval</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the requests that requires the Management approval will be shown here</div>
                                        </div>}</Tab>

                                <Tab title="Approved">
                                    {this.state.readyProcessTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.readyProcessTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no requests ready for processing</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the requests that can be processed will be shown here</div>
                                        </div>}</Tab>

                                <Tab title="Processed">
                                    {this.state.processedTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.processedTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no requests that has been processed</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the processed request will be shown here</div>
                                        </div>}</Tab>

                                <Tab title="Cancelled">
                                    {this.state.cancelledTable.length ? <Table
                                        responsive
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "First Name" },
                                            { content: "Last Name" },
                                            { content: "Email" },
                                            { content: "Qty" },
                                            { content: "Coin" },
                                            { content: "Price USD" },
                                            { content: "Buy Ref." },
                                            { content: "Date" },
                                            { content: "Actions" },
                                        ]}
                                        bodyItems={this.state.cancelledTable}
                                    /> : <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <img style={{ width: '20rem' }} src="images/not-found.svg" /><br />
                                            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>The are no cancelled requests</div>
                                            <div style={{ marginTop: '0.1rem', fontSize: '0.8rem', fontWeight: 600 }}>All the cancelled requests will be shown here</div>
                                        </div>}</Tab>
                            </TabbedContainer>

                        </Card.Body>
                    </Card>)}

                    {this.state.requestDetailCardVisible && (<span>

                        <Card statusColor="blue">
                            <Card.Header>
                                <Card.Title>Buy Request Details | <span style={{ fontSize: '0.8rem' }}>{this.state.requestData.overview.buyId}</span></Card.Title>
                                <Card.Options>
                                    <Button color="primary" size="sm" onClick={() => this.handleGetRequestDetails()}>
                                        Refresh Data
                                </Button>&nbsp;&nbsp;&nbsp;&nbsp;
                                <Button color="primary" size="sm" onClick={() => { this.setState({ requestDetailCardVisible: false, alertVisible: false }) }}>
                                        Back
                                </Button>
                                </Card.Options>
                            </Card.Header>
                            <Card.Body>
                                <Grid.Row gutters="xs">
                                    <Grid.Col width={12} sm={12} lg={8}>
                                        <Card title="Actions" isCollapsible>
                                            <Card.Body>

                                                <Grid.Row cards deck>
                                                    <Grid.Col md={4}>
                                                        <Button disabled={this.state.requestData.approvalState[0]} color="info" outline icon="thumbs-up" size="sm" onClick={() => { this.handleApproveClick('kyc') }}>Approve KYC</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={4}>
                                                        <Button disabled={this.state.requestData.approvalState[1]} color="info" outline icon="thumbs-up" size="sm" onClick={() => { this.handleApproveClick('otc') }}>Approve OTC</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={4}>
                                                        <Button disabled={this.state.requestData.approvalState[2]} color="info" outline icon="thumbs-up" size="sm" onClick={() => { this.handleApproveClick('accounts') }}>Approve Accounts</Button>
                                                    </Grid.Col>
                                                </Grid.Row>
                                                <Grid.Row cards deck>
                                                    <Grid.Col md={4}>
                                                        <Button disabled={this.state.requestData.approvalState[3]} color="info" outline icon="thumbs-up" size="sm" onClick={() => { this.handleApproveClick('management') }}>Approve Management</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={4}>
                                                        <Button disabled={!this.state.requestData.approvalState[0]} color="info" outline icon="thumbs-down" size="sm" onClick={() => { this.handleRevertApproveClick('kyc') }}>Revert KYC Approval</Button>
                                                    </Grid.Col>
                                                </Grid.Row>
                                                <div style={{ marginTop: '1.5rem' }}></div>
                                                <Grid.Row cards deck >
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">View KYC Data</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">Edit KYC Data</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">View Aggrement</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">Edit Aggrement</Button>
                                                    </Grid.Col>
                                                </Grid.Row>

                                                <Grid.Row cards deck>

                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">Print Aggrement Form</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">View BEEP Form</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">Edit BEEP Form</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="secondary" size="sm">Print BEEP Form</Button>
                                                    </Grid.Col>
                                                </Grid.Row>
                                                <div style={{ marginTop: '1.5rem' }}></div>
                                                <Grid.Row cards deck>
                                                    <Grid.Col md={4}>
                                                        <Button color="secondary" size="sm">Send Request Email</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={4}>
                                                        <Button color="secondary" size="sm">Send Aggrement Email</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={4}>
                                                        <Button color="secondary" size="sm">Send Confirmation Email</Button>
                                                    </Grid.Col>
                                                </Grid.Row>
                                                <Grid.Row cards deck>
                                                    <Grid.Col md={4}>
                                                        <Button color="secondary" size="sm">Send Cancellation Email</Button>
                                                    </Grid.Col>
                                                </Grid.Row>
                                                <div style={{ marginTop: '1.5rem' }}></div>
                                                <Grid.Row cards deck>
                                                    <Grid.Col md={3}>
                                                        <Button color="danger" outline icon="x" size="sm" onClick={() => { this.handleCancel() }}>Cancel Request</Button>
                                                    </Grid.Col>
                                                    <Grid.Col md={3}>
                                                        <Button color="success" outline icon="check" size="sm">Process Request</Button>
                                                    </Grid.Col>
                                                </Grid.Row>
                                            </Card.Body>
                                        </Card>

                                        <Dimmer active={this.state.loading} loader>
                                            <Card title="Buy Request Data" isCollapsible>
                                                <Card.Body>
                                                    <ContactCard
                                                        cardTitle={<React.Fragment><Icon name="bar-chart" /> Summary</React.Fragment>}
                                                        details={[

                                                            { title: "First", content: this.state.requestData.summary.firstName },
                                                            { title: "Last Name", content: this.state.requestData.summary.lastName },

                                                            { title: "Email", content: this.state.requestData.summary.email },
                                                            { title: "User ID", content: this.state.requestData.summary.userId },
                                                            { title: "Pay Mode", content: this.state.requestData.summary.payMode },

                                                        ]}
                                                    />

                                                    <ContactCard
                                                        cardTitle={<React.Fragment><Icon name="box" /> Transaction Details</React.Fragment>}
                                                        details={[
                                                            { title: "Sender Address", content: <Tag color="red" addOn={<Icon name="arrow-up-right" />}>{this.state.requestData.transaction.senderAddress}</Tag> },
                                                            { title: "Receiver Address", content: <Tag color="indigo" addOn={<Icon name="arrow-down-left" />}>{this.state.requestData.transaction.receiverAddress}</Tag> },
                                                            {
                                                                title: "Trx Hash",
                                                                content: <Tag.List>
                                                                    {this.state.requestData.transaction.trxHash.map(v => {
                                                                        return <Tag>{v.tx_hash}</Tag>
                                                                    })}
                                                                </Tag.List>
                                                            },

                                                        ]}
                                                    />

                                                    <ContactCard
                                                        cardTitle={<React.Fragment><Icon name="rss" /> Exhange Rates</React.Fragment>}
                                                        details={[{ title: "Rate ID", content: this.state.requestData.exchangeRates.spotRateId },
                                                        { title: "Timestamp", content: moment(this.state.requestData.exchangeRates.timestamp).format("h:mm:ss A DD-MMMM-YYYY ") },
                                                        { title: "CMB/USD", content: <span>{Number(this.state.requestData.exchangeRates.rates.cmbusd).toFixed(4)}</span> },
                                                        { title: "CMB/SGD", content: <span>{Number(this.state.requestData.exchangeRates.rates.cmbsgd).toFixed(4)}</span> },
                                                        { title: "SGD/USD", content: <span>{Number(this.state.requestData.exchangeRates.rates.sgdusd).toFixed(4)}</span> },
                                                        { title: "USD/SGD", content: <span>{Number(this.state.requestData.exchangeRates.rates.usdsgd).toFixed(4)}</span> },
                                                        { title: "ETH/USD", content: <span>{Number(this.state.requestData.exchangeRates.rates.ethusd).toFixed(4)}</span> },
                                                        { title: "BTC/USD", content: <span>{Number(this.state.requestData.exchangeRates.rates.btcusd).toFixed(4)}</span> },
                                                        ]}
                                                    />

                                                    <ContactCard
                                                        cardTitle={<React.Fragment><Icon name="clipboard" /> Investment Details</React.Fragment>}
                                                        details={[
                                                            {
                                                                title: "Buy Qty",
                                                                content: <Tag color="lime" addOn={<Icon name="shopping-bag" />}>{this.state.requestData.investment.buyQty}</Tag>,
                                                            },
                                                            {
                                                                title: "Coin",
                                                                content: this.state.requestData.investment.coin,
                                                            },
                                                            {
                                                                title: "Base Tokens (US $)",
                                                                content: this.state.requestData.investment.baseTokensUSD,
                                                            },
                                                            {
                                                                title: "Bonus Tokens (US $)",
                                                                content: this.state.requestData.investment.bonusTokenUSD,
                                                            },
                                                            {
                                                                title: "Total Tokens (US $)",
                                                                content: this.state.requestData.investment.TotalTokensUSD,
                                                            },
                                                        ]}
                                                    />

                                                    <ContactCard
                                                        cardTitle={<React.Fragment><Icon name="clipboard" /> Scheme Details</React.Fragment>}
                                                        details={[
                                                            { title: "Scheme Name", content: this.state.requestData.scheme.name },
                                                            { title: "Scheme Duration", content: this.state.requestData.scheme.duration + ' days' },
                                                            { title: "Bonus", content: this.state.requestData.scheme.bonus + ' %' },
                                                            { title: "Description", content: this.state.requestData.scheme.description }
                                                        ]}
                                                    />

                                                    <ContactCard
                                                        cardTitle={<React.Fragment><Icon name="briefcase" /> Bank Details</React.Fragment>}
                                                        details={[

                                                            { title: "Bank Name", content: this.state.requestData.bank.name },
                                                            { title: "Bank Branch", content: this.state.requestData.bank.branch },
                                                            { title: "Bank Code", content: this.state.requestData.bank.code },

                                                            { title: "Account No", content: this.state.requestData.bank.accNo },
                                                            { title: "SWIFT Code", content: this.state.requestData.bank.swiftCode },

                                                        ]}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        </Dimmer>

                                    </Grid.Col>
                                    <Grid.Col width={12} sm={12} lg={4}>
                                        <Card title="Overview" isCollapsible>
                                            <Card.Body>
                                                <div style={{ margin: '0rem 1rem 0rem 1rem' }}>
                                                    <span>
                                                        <Form.StaticText>
                                                            <strong>Buy Id</strong>
                                                        </Form.StaticText>
                                                        <Form.StaticText>
                                                            {this.state.requestData.overview.buyId}
                                                        </Form.StaticText>
                                                    </span>
                                                    <span>
                                                        <Form.StaticText>
                                                            <strong>Request Created On</strong>
                                                        </Form.StaticText>
                                                        <Form.StaticText>
                                                            {moment(this.state.requestData.overview.requestDate).format("h:mm:ss A DD-MMMM-YYYY ")}
                                                        </Form.StaticText>
                                                    </span>
                                                    <span>
                                                        <Form.StaticText>
                                                            <strong>Status</strong>
                                                        </Form.StaticText>
                                                        <Form.StaticText>
                                                            <Tag> {this.state.requestData.overview.status}</Tag>
                                                        </Form.StaticText>
                                                    </span>
                                                    <span>
                                                        <Form.StaticText>
                                                            <strong>Approvals</strong>
                                                        </Form.StaticText>
                                                        <Timeline>
                                                            <Timeline.Item
                                                                title="KYC Team"
                                                                badgeColor={this.state.requestData.overview.approval.kyc.approved ? 'green' : 'red'}
                                                                time={<div style={{ textAlign: 'right' }}><span style={{ color: '#d2691e' }}>{moment(this.state.requestData.overview.approval.kyc.on).format('DD/MM/YY HH:mm').replace('Invalid date', '')}</span></div>}
                                                                active
                                                                description={this.state.requestData.overview.approval.kyc.by}
                                                            />
                                                            <Timeline.Item
                                                                title="OTC Team"
                                                                badgeColor={this.state.requestData.overview.approval.otc.approved ? 'green' : 'red'}
                                                                time={<div style={{ textAlign: 'right' }}><span style={{ color: '#d2691e' }}>{moment(this.state.requestData.overview.approval.otc.on).format('DD/MM/YY HH:mm').replace('Invalid date', '')}</span></div>}
                                                                active
                                                                description={this.state.requestData.overview.approval.otc.by}
                                                            />
                                                            <Timeline.Item
                                                                title="Accounts Team"
                                                                badgeColor={this.state.requestData.overview.approval.accounts.approved ? 'green' : 'red'}
                                                                time={<div style={{ textAlign: 'right' }}><span style={{ color: '#d2691e' }}>{moment(this.state.requestData.overview.approval.accounts.on).format('DD/MM/YY HH:mm').replace('Invalid date', '')}</span></div>}
                                                                active
                                                                description={this.state.requestData.overview.approval.accounts.by}
                                                            />
                                                            <Timeline.Item
                                                                title="Management Team"
                                                                badgeColor={this.state.requestData.overview.approval.management.approved ? 'green' : 'red'}
                                                                time={<div style={{ textAlign: 'right' }}><span style={{ color: '#d2691e' }}>{moment(this.state.requestData.overview.approval.management.on).format('DD/MM/YY HH:mm').replace('Invalid date', '')}</span></div>}
                                                                active
                                                                description={this.state.requestData.overview.approval.management.by}
                                                            />
                                                        </Timeline>
                                                    </span>
                                                    <span>
                                                        <Form.StaticText>
                                                            <strong>Internal Notes</strong>
                                                        </Form.StaticText>
                                                        <Form.StaticText>
                                                            <a href="">Click to view</a>
                                                        </Form.StaticText>
                                                    </span>
                                                    <span>
                                                        <Form.StaticText>
                                                            <strong>User Notes</strong>
                                                        </Form.StaticText>
                                                        <Form.StaticText>
                                                            <a href="">Click to view</a>
                                                        </Form.StaticText>
                                                    </span>



                                                </div>
                                            </Card.Body>
                                        </Card>

                                    </Grid.Col>

                                </Grid.Row>
                            </Card.Body>
                        </Card></span>
                    )}

                </Page.Content>
            </SiteWrapper>

        )
    }
}

export default Buy