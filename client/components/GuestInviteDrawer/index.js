import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Drawer from 'material-ui/Drawer';
import autobind from 'autobind-decorator';
import { List, ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import nprogress from 'nprogress';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';

import styles from './guest-invite.css';
import { checkStatus, parseJSON } from '../../util/fetch.util';

class GuestInviteDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      curUser: {},
      event: this.props.event,
      guests: [],
      activeCheckboxes: [],
      notifications: OrderedSet(),
    };
  }

  async componentWillMount() {
    await this.loadPassGuests();
  }

  componentWillReceiveProps(nextProps) {
    const { event, open, curUser } = nextProps;
    this.setState({ event, open, curUser });
  }

  addNotification(msgTitle, msg, dismissTime = 3400) {
    const { notifications, count } = this.state;
    const newCount = count + 1;
    const msgKey = count + 1;

    return this.setState({
      count: newCount,
      notifications: notifications.add({
        message: msg,
        title: msgTitle,
        key: msgKey,
        action: 'Dismiss',
        dismissAfter: dismissTime,
        onClick: () => this.removeNotification(msgKey),
      }),
    });
  }

  removeNotification(key) {
    const { notifications } = this.state;
    this.setState({
      notifications: notifications.filter(n => n.key !== key),
    });
  }

  async loadPassGuests() {
    nprogress.start();
    const response = await fetch('/api/user/relatedUsers', { credentials: 'same-origin' });
    let guests;
    try {
      checkStatus(response);
      guests = await parseJSON(response);
      this.setState({ guests });
    } catch (err) {
      console.log('loadPassGuests', err);
      this.addNotification('Error!!', 'Failed to load guests. Please try again later.');
      return;
    } finally {
      nprogress.done();
      this.setState({ showNoScheduledMessage: true });
    }
  }

  @autobind
  handleClose() {
    this.setState({ open: false });
  }

  handleCheck(id) {
    const { activeCheckboxes } = this.state;
    const found = activeCheckboxes.includes(id);
    if (found) {
      this.setState({
        activeCheckboxes: activeCheckboxes.filter(x => x !== id),
      });
    } else {
      this.setState({
        activeCheckboxes: [...activeCheckboxes, id],
      });
    }
  }

  async loadUserData(_id) {
    const response = await fetch(`/api/user/${_id}`, { credentials: 'same-origin' });
    try {
      checkStatus(response);
      return await parseJSON(response);
    } catch (err) {
      console.log('loadUserData', err);
      this.addNotification('Error!!', 'Failed to load user Data. Please try again later.');
      return null;
    }
  }

  @autobind
  handleInvite() {
    const { activeCheckboxes } = this.state;
    console.log('handleInvite', activeCheckboxes);
    activeCheckboxes.forEach((guest) => {
      console.log('forEach', guest);
      this.sendEmailInvite(guest);
    });
  }

  async sendEmailInvite(guestId) {

    const { event, curUser } = this.state;
    console.log(event)
    const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
    const guestData = await this.loadUserData(guestId);
    const ownerData = await this.loadUserData(event.owner);
    const msg = {
      guestName: guestData.name,
      eventName: event.name,
      eventId: event._id,
      eventOwner: event.owner,
      eventOwnerMame: curUser.name,
      url: `${fullUrl}/event/${event._id}`,
      to: guestData.emails[0],
      subject: `Invite for ${event.name}!!`,
    };
    console.log(msg, curUser);
    const response = await fetch('/api/email/sendInvite', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify(msg),
    });

    try {
      checkStatus(response);
      this.addNotification('Info!!', `${curUser.name} invited!`);
    } catch (err) {
      console.log('sendEmailOwner', err);
      this.addNotification('Error!!', `Failed to send invite to ${curUser.name} Please try again later.`);
    }
  }
  renderRows() {
    const styles = {
      divider: {
        width: '100%',
      },
    };
    const { guests } = this.state;
    const rows = [];
    guests.forEach((guest) => {
      console.log(guest);
      const row = (
        <div key={guest._id}>
          <ListItem
            primaryText={guest.name}
            leftCheckbox={<Checkbox onCheck={() => this.handleCheck(guest.userId)} />}
            rightAvatar={<Avatar src={guest.avatar} />}
          />
          <Divider style={styles.divider} />
        </div>
      );
      rows.push(row);
    });
    return rows;
  }

  render() {
    const { open, event, notifications } = this.state;
    return (
      <Drawer
        docked={false}
        width={300}
        open={open}
        onRequestChange={open => this.setState({ open })}
      > <h3> This is { event.name } </h3>
        <h6> That's yours recent guests. If you want, we can invite some for you </h6>
        <TextField
          fullWidth={true}  
          hintText="search"
          floatingLabelText="Search for Guests"
        />
        <List>
          {this.renderRows()}
        </List>
        <RaisedButton
          fullWidth={true}
          label="Invite"
          primary={true}
          onTouchTap={this.handleInvite}
        />
        <NotificationStack
          notifications={notifications.toArray()}
          onDismiss={notification => this.setState({
            notifications: notifications.delete(notification),
          })}
        />
      </Drawer>
    );
  }
}

GuestInviteDrawer.propTypes = {
  event: React.PropTypes.object,
  curUser: React.PropTypes.object,
  open: React.PropTypes.bool,
};

export default cssModules(GuestInviteDrawer, styles);
