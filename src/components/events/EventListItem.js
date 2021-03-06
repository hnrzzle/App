import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './EventListItem.css';

class EventListItem extends Component {

  static propTypes = {
    event: PropTypes.object.isRequired
  };

  render() {
    const { event } = this.props;
    const { description, location, name, time, type, _id } = event;

    const { start, end } = time;

    const timeStart = new Date(start);
    const timeEnd = new Date(end);

    return (
      <li className={styles.eventListItem}>
        <Link to={`/events/${_id}`}><h2>{name}</h2></Link>
        <p>Activity: {type}</p>
        <p>Description: {description}</p>
        <p>Address: {location.name}</p>
        <p>Event Start: {timeStart.toLocaleString()}</p>
        <p>Event End: {timeEnd.toLocaleString()}</p>
      </li>
    );
  }
}

export default EventListItem;