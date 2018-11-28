import React, { Component } from 'react';
import axios from 'axios'
import moment from 'moment'

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
class Transactions extends Component {
    state = {
        tableItems: [],
        loading: false,
        userid: '',
        sort: 'desc',
        trxtype: 'all'
    }

    componentDidMount(){
        axios.defaults.headers['x-session-id'] = Cookies.get('session-id')
    }

    async onty(v) {
        let tableItems = []
        await this.setState({ userid: v })
        try {
            await this.setState({ loading: true })
            let { data } = await axios.get(`${API_URL}/admin/transactionlookup?user_id=${this.state.userid}&rangestart=0&rangeend=1937526914630&trxtype=${this.state.trxtype}&amountlimit=0&limit=100&sort=${this.state.sort}&symb=all&export=false`)
            await data.data.map(function (item, i) {
                tableItems.push({
                    key: i,
                    item: [
                        {
                            content: (<Text RootComponent="span" muted>{i + 1}</Text>),
                        },
                        { content: moment(item.created_at).format("h:mm:ss A Z DD-MMM-YYYY ") },
                        {
                            content: (
                                <React.Fragment>
                                    <span className={item.status == 'Completed' ? "status-icon bg-success" : "status-icon bg-warning"} /> {item.status}
                                </React.Fragment>
                            ),
                        },
                        { content: item.originator_id },
                        { content: item.beneficiary_id },
                        { content: item.source_address },
                        { content: item.destination_address },
                        { content: item.coin_code },
                        { content: item.amountInCoinUnit },
                        {
                            content: (
                                <React.Fragment>
                                    <span className={item.transfer_type == 'Credit' ? "status-icon bg-success" : "status-icon bg-danger"} /> {item.transfer_type}
                                </React.Fragment>
                            ),
                        },
                        {
                            content: (
                                <React.Fragment>
                                    <span className={item.vested == true ? "status-icon bg-warning" : "status-icon bg-info"} /> {item.vested == true ? 'Yes' : 'No'}
                                </React.Fragment>
                            ),
                        },
                        { content: item.tx_hash }
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

    async componentDidMount() {
        try {
            if (this.props.location.state.userid) {
                await this.setState({ userid: this.props.location.state.userid })
                await this.onty(this.props.location.state.userid)
            }
        } catch (e) {
            await this.setState({ userid: '' })
        }
    }

    async onttc(v) {
        await this.setState({ trxtype: v })
        await this.onty(this.state.userid)
    }

    async onsc(v) {
        await this.setState({ sort: v })
        await this.onty(this.state.userid)
    }

    render() {
        return (
            <SiteWrapper>
                <Page.Content>
                    <Grid.Row>
                        <Grid.Col width={12}>
                            <Form.Input
                                className="mb-3"
                                icon="search"
                                placeholder="Type user id here..."
                                position="append"
                                value={this.state.userid}
                                onChange={(e) => { this.onty(e.target.value) }}
                            />
                            <Grid.Row>
                                <Grid.Col width={6}>
                                    <Form.Group label="Transaction Type">
                                        <Form.Select value={this.state.trxtype} onChange={(e) => { this.onttc(e.target.value) }}>
                                            <option value="all">All</option>
                                            <option value="30">Credit</option>
                                            <option value="40">Debit</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Grid.Col>
                                <Grid.Col width={6}>
                                    <Form.Group label="Sort">
                                        <Form.Select value={this.state.sort} onChange={(e) => { this.onsc(e.target.value) }}>
                                            <option value="asc">Ascending</option>
                                            <option value="desc">Descending</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Grid.Col>
                            </Grid.Row>

                            <Dimmer active={this.state.loading} loader>
                                <Card statusColor="blue">
                                    <Card.Header>
                                        <Card.Title>Transactions</Card.Title>
                                        <Card.Options>
                                            <Button color="primary" size="sm" onClick={() => window.open("http://localhost:3000/admin/transactionlookup?user_id=bad3909f-0f37-4147-bfb8-c69b2a474319&rangestart=0&rangeend=1937526914630&trxtype=all&amountlimit=0&limit=100&sort=desc&symb=all&export=true", "_blank")}>
                                                Export Ledger To CSV
                                        </Button>
                                        </Card.Options>
                                    </Card.Header>
                                    <Table
                                        responsive={true}
                                        className="card-table table-vcenter text-nowrap"
                                        headerItems={[
                                            { content: "No.", className: "w-1" },
                                            { content: "Transaction Date" },
                                            { content: "Status" },
                                            { content: "Originator Id" },
                                            { content: "Beneficiary Id" },
                                            { content: "Originator Address" },
                                            { content: "Beneficiary Address" },
                                            { content: "Coin Type" },
                                            { content: "Amount" },
                                            { content: "Transaction Type" },
                                            { content: "Is Vested" },
                                            { content: "Transaction Hash" }
                                        ]}
                                        bodyItems={this.state.tableItems}
                                    />
                                    <Card.Footer>{this.state.tableItems.length} Transactions found</Card.Footer>
                                </Card>
                            </Dimmer>
                        </Grid.Col>
                    </Grid.Row>
                </Page.Content>
            </SiteWrapper>
        );
    }
}

export default Transactions