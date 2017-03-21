import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import Toggle from 'material-ui/Toggle';
import cssModules from 'react-css-modules';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Divider from 'material-ui/Divider';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import NotificationBar from '../NotificationBar/NotificationBar';
import avatarPlaceHolder from '../../assets/Profile_avatar_placeholder_large.png';
import styles from './nav-bar.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    const { isAuthenticated, curUser, showPastEvents } = this.props;
    this.state = {
      userAvatar: avatarPlaceHolder,
      isAuthenticated,
      curUser,
      conditionalHomeLink: '/',
      toggleVisible: true,
      showPastEvents,

    };
  }

  componentWillMount() {
    const { location, curUser, isAuthenticated, showPastEvents } = this.props;
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.Avatar, showPastEvents });
    this.MenuVisibility(location);
  }

  componentWillReceiveProps(nextProps) {
    const { location, curUser, isAuthenticated, showPastEvents } = nextProps;
    this.MenuVisibility(location);
    this.setState({ curUser, isAuthenticated, userAvatar: curUser.avatar, showPastEvents });
  }

  MenuVisibility(location) {
    if (location.pathname === '/dashboard') {
      this.setState({ toggleVisible: true });
    } else {
      this.setState({ toggleVisible: false });
    }
  }

  @autobind
  handleAuthClick() {
    this.props.cbOpenLoginModal('/dashboard');
  }

  @autobind
  handleDashboardClick() {
    browserHistory.push('/dashboard');
  }

  @autobind
  handleFilterToggle(ev, isInputChecked) {
    this.props.cbFilter(isInputChecked);
  }

  renderRightGroup() {
    const { toggleVisible } = this.state;
    const inLineStyles = {
      TollbarGroup: {
        paddingRight: '5%',
      },
      menu: {
        iconStyle: {
          minWidth: 70,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        toggle: {
          label: {
            fontSize: '18px',
          },
          thumbSwitched: {
            backgroundColor: 'red',
          },
        },
        itens: {
          backgroundColor: 'white',
        },
      },
    };
    const { isAuthenticated, curUser, userAvatar, showPastEvents } = this.state;

    if (isAuthenticated) {
      return (
        <ToolbarGroup
          lastChild
        >
          <NotificationBar curUser={curUser} />
          {!toggleVisible ?
            <FlatButton
              styleName="DashButton"
              onTouchTap={this.handleDashboardClick}
            >
              Dashboard
            </FlatButton>
            : null
          }
          <IconMenu
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            styleName="iconMenu"
            iconStyle={inLineStyles.menu.iconStyle}
            listStyle={inLineStyles.menu.itens}
            iconButtonElement={
              <IconButton style={{ padding: '25px 1% 56px 0px' }}>
                <div>
                  <Avatar
                    src={userAvatar}
                  />
                  <ArrowDown style={{ color: '#ffffff', fontSize: '30px' }} />
                </div>
              </IconButton>}
          >
            <MenuItem>
              <Toggle
                label={'Past Events'}
                toggled={showPastEvents}
                styleName="Toggle"
                labelStyle={inLineStyles.menu.toggle.label}
                thumbSwitchedStyle={inLineStyles.menu.toggle.thumbSwitched}
                onToggle={this.handleFilterToggle}
              />
            </MenuItem >
            <Divider />
            <MenuItem
              href={'/api/auth/logout'}
              primaryText="Logout"
            />
          </IconMenu>
        </ToolbarGroup>
      );
    }
    return (
      <ToolbarGroup
        lastChild
      >
        <RaisedButton styleName="loginButton" backgroundColor="transparent" onTouchTap={this.handleAuthClick}>
          Login
        </RaisedButton>
      </ToolbarGroup>
    );
  }

  render() {
    return (
      <Toolbar
        styleName="toolBar"
      >
        <ToolbarGroup
          firstChild
          styleName="leftToolbarGroup"
        >
          <FlatButton
            href={this.state.conditionalHomeLink}
            styleName="logoButton"
          >
            Lets Meet
          </FlatButton>
        </ToolbarGroup >
        {this.renderRightGroup()}
      </Toolbar>
    );
  }
}

NavBar.propTypes = {
  location: React.PropTypes.object,
  cbFilter: React.PropTypes.func,
  isAuthenticated: React.PropTypes.bool,
  curUser: React.PropTypes.object,
  cbOpenLoginModal: React.PropTypes.func,
  showPastEvents: React.PropTypes.bool,
};

export default cssModules(NavBar, styles);
