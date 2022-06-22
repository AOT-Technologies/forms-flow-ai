import React from 'react';
import { withGoogleMap, GoogleMap, withScriptjs, InfoWindow, Marker } from "react-google-maps";
import Geocode from "react-geocode";
import Autocomplete from 'react-google-autocomplete';



Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAP_URL);
Geocode.enableDebug();

export default class LocationSearchModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            address: '',
            zoom: 12,
            height: 400,
            location: '',
            value: props.value,
            gmapurl: process.env.REACT_APP_GOOGLE_MAP_URL
        };
    }
    componentDidMount() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                Geocode.fromLatLng(position.coords.latitude, position.coords.longitude).then(
                    response => {
                        const address = response.results[0].formatted_address;
                        this.setState({
                            value: {
                                placeName: address,
                                coordinates: {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                }
                            }
                        });
                    },
                    error => {
                        console.error(error);
                    }
                );
            });
        } else {
            console.error("Geolocation is not supported by this browser!");
        }
    }

 

    onChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    onInfoWindowClose = () => { 

    };

    onMarkerDragEnd = (event) => {

        let newLat = event.latLng.lat(),
            newLng = event.latLng.lng();

        Geocode.fromLatLng(newLat, newLng).then(
            response => {
                const address = response.results[0].formatted_address;
                this.setState({
                    value: {
                        placeName: address || '',
                        coordinates: {
                            lat: newLat,
                            lng: newLng
                        }
                    }
                }, () => this.updateMapCoordinates());
            },
            error => {
                console.error(error);
            }
        );
    };

    onPlaceSelected = (place) => {
        const address = place.formatted_address,
            latValue = place.geometry.location.lat(),
            lngValue = place.geometry.location.lng();

        // Set these values in the state.
        this.setState({
            value: {
                placeName: address || '',
                coordinates: {
                    lat: latValue,
                    lng: lngValue
                }
            }
        }, () => this.updateMapCoordinates());
    };

    updateMapCoordinates = () => {
        this.props.onChange(this.state.value);
    };

    render() {
        let { coordinates, placeName } = this.state.value ? this.state.value : {
            placeName: '',
            coordinates: {
                lat: 0,
                lng: 0
            }
        };
        const AsyncMap = withScriptjs(
            withGoogleMap(
                () => (
                    <GoogleMap
                        defaultZoom={this.state.zoom}
                        defaultCenter={{ lat: coordinates?.lat || 0, lng: coordinates?.lng || 0 }}
                    >
                        <Autocomplete
                            placeholder={placeName === "" ? "Enter the location..." : placeName}
                            
                            style={{
                                width: '100%',
                                height: '40px',
                                paddingLeft: '16px',
                                marginTop: '2px',
                                marginBottom: '2rem',

                            }}
                            onPlaceSelected={this.onPlaceSelected}
                            types={['(regions)']}
                        />
                        <Marker
                            google={this.props.google}
                            name={'Dolores park'}
                            draggable={true}
                            onDragEnd={this.onMarkerDragEnd}
                            position={{ lat: coordinates?.lat || 0, lng: coordinates?.lng || 0 }}
                        />
                        <InfoWindow
                            onClose={this.onInfoWindowClose}
                            position={{
                                lat: ((coordinates?.lat
                                    || 0) + 0.0150), lng: coordinates?.lng || 0
                            }}
                        >
                            <div>
                                <span style={{ padding: 0, margin: 0 }}>{placeName}</span>
                            </div>
                        </InfoWindow>
                        <Marker />

                    </GoogleMap>
                )
            )
        );

        return (
            <div>
                {this.state.value && <div className='google-map'>
                    <AsyncMap
                        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_MAP_URL}`}
                        loadingElement={
                            <div style={{ height: `100%` }} />
                        }
                        containerElement={
                            <div style={{ height: this.state.height }} />
                        }
                        mapElement={
                            <div style={{ height: `100%` }} />
                        }
                    />
                </div>}
            </div>
        );
    }

}

