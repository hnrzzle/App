import React from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { classnames } from '../helpers';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addEvent, updateEvent } from './actions';
import { loadUserProfile, queryProfile } from '../profile/actions';
import { getEvents } from './reducers';
import { getUser } from '../auth/reducers';
import { getUserProfile } from '../profile/reducers';
import { Redirect } from 'react-router-dom';
import styles from './AddEvent.css';

const defaultFormState = {
  eventName: '',
  description: '',
  type: '',
  location: '',
  timeStart: '',
  timeEnd: ''
};

class AddEvent extends React.Component {

  static propTypes = {
    loadUserProfile: PropTypes.func.isRequired,
    queryProfile: PropTypes.func.isRequired,
    addEvent: PropTypes.func.isRequired,
    updateEvent: PropTypes.func.isRequired,
    user: PropTypes.object,
    editing: PropTypes.bool,
    id: PropTypes.string,
    userProfile: PropTypes.object,
    groupId: PropTypes.string,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      form: defaultFormState,
      address: '',
      errorMessage: '',
      latitude: null,
      longitude: null,
      isGeocoding: false,
      redirect: false,
      newEvent: ''
    };
  }

  componentDidMount() {
    if(this.props.user !== null) {
      this.props.queryProfile(this.props.user._id)
        .then(({ payload }) => {
          return this.props.loadUserProfile(payload[0]._id);
        });
    }
  }


  handleSubmit = event => {
    event.preventDefault();
    this.structureEventData(this.state);
  };

  structureEventData = state => {

    const formData = state.form;

    const { address, latitude, longitude } = state;

    const structuredData = {
      name: formData.eventName,
      description: formData.description,
      type: formData.type,
      location: {
        name: address,
        coords: {
          lat: latitude,
          lng: longitude
        }
      },
      time: {
        start: new Date(formData.timeStart),
        end: new Date(formData.timeEnd)
      }
    };

    if(this.props.editing) {
      structuredData._id = this.props.id;
      this.props.updateEvent(structuredData);
    } else {
      structuredData.host = [this.props.userProfile._id];
      structuredData.attendance = [this.props.userProfile._id];
      if(this.props.groupId) {
        structuredData.group = [this.props.groupId];
      }
      this.props.addEvent(structuredData)
        .then(({ payload }) => {
          this.setState({
            redirect: true,
            newEvent: payload
          });
        });
    }
  };

  handleFormChange = ({ target }) => {
    this.setState(({ form }) => {
      return {
        form: {
          ...form,
          [target.name]: target.value
        }
      };
    });
  };

  handleChange = address => {
    this.setState({
      address,
      latitude: null,
      longitude: null,
      errorMessage: '',
    });
  };

  handleSelect = selected => {
    this.setState({ isGeocoding: true, address: selected });
    geocodeByAddress(selected)
      .then(res => getLatLng(res[0]))
      .then(({ lat, lng }) => {
        this.setState({
          latitude: lat,
          longitude: lng,
          isGeocoding: false,
        });
      })
      .catch(error => {
        this.setState({ isGeocoding: false });
        console.log('error', error); // eslint-disable-line no-console
      });
  };

  handleCloseClick = () => {
    this.setState({
      address: '',
      latitude: null,
      longitude: null,
    });
  };

  handleError = (status, clearSuggestions) => {
    console.log('Error from Google Maps API', status); // eslint-disable-line no-console
    this.setState({ errorMessage: status }, () => {
      clearSuggestions();
    });
  };

  handleTypeSelect = ({ target }) => {
    this.setState(({ form }) => {
      return {
        form: {
          ...form,
          type: target.value
        }
      };
    });
  };

  render() {
    const {
      address,
      errorMessage,
      latitude,
      longitude,
      isGeocoding,
      redirect,
      newEvent
    } = this.state;

    const categories = ['basketball', 'yoga', 'baseball', 'tennis', 'hiking', 'running', 'racquetball', 'frisbee', 'climbing', 'rafting', 'kayaking', 'swimming', 'golfing', 'football', 'ice hockey', 'volleyball', 'cross fit', 'softball', 'badminton', 'walking', 'chess', 'soccer'];
    const { eventName, description, timeStart, timeEnd } = this.state.form;

    if(redirect && newEvent) return <Redirect to={`/events/${newEvent._id}`}/>;

    return (
      <div className={styles.addEvent}>
        <div className="addEventForm">
          <h3>Create an Event</h3>
          <form onSubmit={this.handleSubmit}>
            <label>Event Name:</label>
            <input type="text" name="eventName" value={eventName} onChange={this.handleFormChange} required placeholder="Event Name"/>
            <label>Type of Activity:</label>
            <select onChange={this.handleTypeSelect}>
              <option>Activity</option>
              {categories.map(category => <option key={category} value={category}>
                {category}
              </option>)
              }
            </select>
            <label>Event Start:</label>
            <input type="text" name="timeStart" value={timeStart} onChange={this.handleFormChange} required placeholder="Event Start"/>
            <label>Event End:</label>
            <input type="text" name="timeEnd" value={timeEnd} onChange={this.handleFormChange} required placeholder="Event End"/>
            <label>Location:</label>
            <PlacesAutocomplete
              onChange={this.handleChange}
              value={address}
              onSelect={this.handleSelect}
              onError={this.handleError}
              shouldFetchSuggestions={address.length > 2}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => {
                return (
                  <div className="search-bar-container">
                    <input className="autocomplete"
                      {...getInputProps({
                        placeholder: 'Enter a search and select an option',
                        className: 'search-input',
                      })}
                    />
                    {this.state.address.length > 0 && (
                      <button
                        className="clear-button"
                        onClick={this.handleCloseClick}
                      >
                    Reset
                      </button>
                    )}
                    {suggestions.length > 0 && (
                      <div className="autocomplete-container">
                        {suggestions.map(suggestion => {
                          const className = classnames('suggestion-item', {
                            'suggestion-item--active': suggestion.active,
                          });

                          return (
                          /* eslint-disable react/jsx-key */
                            <div
                              {...getSuggestionItemProps(suggestion, { className })}
                            >
                              <strong>
                                {suggestion.formattedSuggestion.mainText}
                              </strong>{' '}
                              <small>
                                {suggestion.formattedSuggestion.secondaryText}
                              </small>
                            </div>
                          );
                          /* eslint-enable react/jsx-key */
                        })}
                        <div className="dropdown-footer">
                          <div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            </PlacesAutocomplete>
            <label>Description:</label>
            <textarea name="description" value={description} onChange={this.handleFormChange} required placeholder="Description"/>
            <button type="submit">{this.props.editing ? 'Update Your Event' : 'Create your Event'}</button>
          </form>
          
        </div>
        {errorMessage.length > 0 && (
          <div className="error-message">{this.state.errorMessage}</div>
        )}

        {((latitude && longitude) || isGeocoding) && (
          <div className="location-update">
            <h3 className="geocode-result-header">Your location has been updated</h3>
            {isGeocoding ? (
              <div>
                <p>Loading...</p>
              </div>
            ) : (
              <div>
                <div className="geocode-result-item--lat">
                  <label>Address:</label>
                  <span>{address}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({ 
    event: getEvents(state),
    user: getUser(state),
    userProfile: getUserProfile(state)
  }),
  { addEvent, updateEvent, queryProfile, loadUserProfile  }
)(AddEvent);