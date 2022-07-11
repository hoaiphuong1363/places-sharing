import React from 'react';
import Card from '../../shared/components/UIElements/Card';
import './PlaceList.css';
import PlaceItem from './PlaceItem';
import Button from '../../shared/components/FormElements/Button';

const PlaceList = (props) => {
    if (props.items.length === 0) {
        return (
            <div className='place-list center'>
                <Card>
                    <h2>No PLaces found. Maybe create One</h2>
                    <Button>Share Place</Button>
                </Card>
            </div>
        );
    }
    return (
        <ul className='place-list'>
            {props.items.map((place) => (
                <PlaceItem key={place.id} {...place} onDelete={props.onDeletePlace} />
            ))}
        </ul>
    );
};

export default PlaceList;
