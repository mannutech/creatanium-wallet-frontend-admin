import React, { Component } from 'react';
import { NavLink, withRouter } from "react-router-dom";

import "tabler-react/dist/Tabler.css";
import {
    Site,
    Nav,
    Grid,
    List,
    Button,
    RouterContextProvider,
} from "tabler-react";

const notificationsObjects = [
    {
        message: (
        <React.Fragment>
            This is <strong>alpha</strong> version of creatanium wallet administrator panel.
        </React.Fragment>
        ),
        time: "1 minutes ago",
    }
];

const accountDropdownProps = {
    avatarURL: "https://www.fakepersongenerator.com/Face/female/female20161025322365265.jpg",
    name: "Jane Pearson",
    description: "Administrator",
    options: [
        { icon: "help-circle", value: "Need help?" },
        { icon: "log-out", value: "Sign out" },
    ],
};

const navBarItems = [
    { value: "User Lookup", to: "/user-lookup", icon: "search", LinkComponent: withRouter(NavLink) },
    { value: "Transactions", to: "/transactions", icon: "codepen", LinkComponent: withRouter(NavLink) }
]

class SiteWrapper extends Component {
    render() {
        return (
            <Site.Wrapper
                headerProps={{
                    href: "/",
                    alt: "Tabler React",
                    imageURL: "images/creatanium-logo.png",
                    notificationsTray: { notificationsObjects },
                    accountDropdown: accountDropdownProps
                }}
                navProps={{ itemsObjects: navBarItems }}
                routerContextComponentType={withRouter(RouterContextProvider)}
                footerProps={{
                    copyright: (
                        <React.Fragment>
                            Copyright © 2018
                        <a
                                href="https://www.creatanium-wallet.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {" "}
                                Creatanium Wallet.
                        </a>{" "}
                            All rights reserved.
                      </React.Fragment>
                    ),
                    nav: (
                        <React.Fragment>
                            <Grid.Col auto={true}>
                                <List className="list-inline list-inline-dots mb-0">
                                    <List.Item className="list-inline-item">
                                        <a href=""></a>
                                    </List.Item>
                                    <List.Item className="list-inline-item">
                                        <a href=""></a>
                                    </List.Item>
                                </List>
                            </Grid.Col>
                        </React.Fragment>
                    ),
                }}
            >

                {this.props.children}
            </Site.Wrapper>
        );
    }
}

export default SiteWrapper