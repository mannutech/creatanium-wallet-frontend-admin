import React, { Component } from 'react';
import axios from 'axios'
import moment from 'moment'
import has from 'lodash/has'

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

import DatePicker from "react-datepicker";
import "../react-datepicker-dist/react-datepicker.css";

class Transactions extends Component {
    state = {
        tableItems: [],
        loading: false,
        userid: '',
        sort: 'desc',
        trxtype: 'all',
        symb: 'all',
        ref: React.createRef(),
        startDate: new Date(),
        datePickerOpen: false,
        vest_txhash: null,
        reversetrx_disabled: true
    }

    exportCSV = () => {
        axios.get(`${API_URL}/admin/transactionlookup?user_id=${this.state.userid}&rangestart=0&rangeend=1937526914630&trxtype=${this.state.trxtype}&amountlimit=0&limit=200&sort=${this.state.sort}&symb=${this.state.symb}&export=true`).then(response => {
            let blob = new Blob([response.data], { type: 'application/octet-stream' })
            let ref = this.state.ref
            ref.current.href = URL.createObjectURL(blob)
            ref.current.download = 'ledger.csv'
            ref.current.click()
        })
    }

    async onty(v) {
        let tableItems = []
        await this.setState({ userid: v })
        try {
            await this.setState({ loading: true })
            console.log(this.state.symb)
            let { data } = await axios.get(`${API_URL}/admin/transactionlookup?user_id=${this.state.userid}&rangestart=0&rangeend=1937526914630&trxtype=${this.state.trxtype}&amountlimit=0&limit=100&sort=${this.state.sort}&symb=${this.state.symb}&export=false`)
            await data.data.map((item, i) => {
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
                                    <span className={item.status == 'Completed' ? "status-icon bg-success" : "status-icon bg-danger"} /> {item.status}
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
                        { content: item.vesting_end_ts == 0 ? 'N/A' : moment(item.vesting_end_ts).utc().format('DD-MMM-YYYY Z') },
                        {
                            content: (
                                <React.Fragment>
                                    <div style={{ maxWidth: 300, whiteSpace: 'normal', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {item.tx_hash}
                                    </div>
                                </React.Fragment>
                            )
                        },
                        {
                            content: (
                                <React.Fragment>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        icon="clock"
                                        onClick={() => { this.handleButtonVested(item.tx_hash) }}
                                        disabled={item.vested == true && Date.now() < item.vesting_end_ts && item.status != 30 ? false : true}
                                    >
                                        Change Vest Period
                                    </Button> {' '}
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        icon="rotate-ccw"
                                        onClick={() => { this.handleButtonReverseTrx(item.coin_code, item.tx_hash) }}
                                        disabled={this.state.reversetrx_disabled == false && item.status === 'Completed' ? false : true}
                                    >
                                        Reverse Transaction
                                    </Button>
                                </React.Fragment>
                            )
                        },
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
        axios.defaults.headers['x-session-id'] = Cookies.get('session-id')
        try {
            if (this.props.location.state.userid) {
                // Check if account has reversetrx permission
                let permissions = JSON.parse(Cookies.get('permissions'))
                if (has(permissions, 'admin.actions')) {
                    permissions.admin.actions.includes('reversetrx') ? await this.setState({ reversetrx_disabled: false }) : await this.setState({ reversetrx_disabled: true })
                }
                //
                await this.setState({ userid: this.props.location.state.userid, symb: this.props.location.state.symb })
                await this.onty(this.props.location.state.userid)

            }
        } catch (e) {
            await this.setState({ userid: '', symb: 'all' })
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

    async handleDateChange(date) {
        try {
            this.setState({
                startDate: date,
                loading: false,
                datePickerOpen: false
            })
            this.setState({ datePickerOpen: false })
            await axios.get(`${API_URL}/admin/vestedtschange?tx_hash=${this.state.vest_txhash}&date=${new Date(date).toISOString()}`)
            this.onty(this.state.userid)
            this.setState({ loading: false })
        } catch (e) {
            this.setState({ loading: false })
            alert('Could not change vesting period for tx : \n' + this.state.vest_txhash + '\nMessage : ' + e.response.data.message)
        }
    }

    async handleButtonVested(e) {
        this.setState({ datePickerOpen: true, vest_txhash: e })
    }

    async handleButtonReverseTrx(coin_code, tx_hash) {
        try {
            this.setState({ loading: true, tableItems: [this.state.tableItems[0]] })
            await axios.get(`${API_URL}/admin/reversetrx?coin_code=${coin_code}&tx_hash=${tx_hash}`)
            this.onty(this.state.userid)
            this.setState({ loading: false })
        } catch (e) {
            this.setState({ loading: false })
            alert(e.response.data.message)
        }
    }

    render() {
        return (
            <SiteWrapper>
                <Page.Content>
                    <Grid.Row>
                        {
                            this.state.datePickerOpen == true ?
                                <DatePicker
                                    selected={this.state.startDate}
                                    onChange={(d) => this.handleDateChange(d)}
                                    minDate={new Date()}
                                    withPortal
                                    inline /> : null
                        }


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
                                            <option value="40">Credit</option>
                                            <option value="30">Debit</option>
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
                            {
                                this.state.tableItems.length == 0 ? (
                                    <Card statusColor="blue">

                                        <p style={{ margin: 30, textAlign: "center" }}>
                                            <img src="images/no-result.svg" style={{ height: 160, margin: 20 }} /><br />
                                            Results will appear here when available</p>
                                    </Card>
                                ) : (
                                        <Dimmer active={this.state.loading} loader>
                                            <Card statusColor="blue">
                                                <Card.Header>
                                                    <Card.Title>Transactions</Card.Title>
                                                    <Card.Options>
                                                        <a style={{ display: 'none' }} href='empty' ref={this.state.ref}>ref</a>
                                                        <Button color="primary" size="sm" onClick={() => this.exportCSV()}>
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
                                                        { content: "To Vest on" },
                                                        { content: "Transaction Hash" },
                                                        { content: "Action" }
                                                    ]}
                                                    bodyItems={this.state.tableItems}
                                                />
                                                <Card.Footer>{this.state.tableItems.length} Transactions found</Card.Footer>
                                            </Card>
                                        </Dimmer>
                                    )}
                        </Grid.Col>
                    </Grid.Row>
                </Page.Content>
            </SiteWrapper>
        );
    }
}

export default Transactions