import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
// const places = [
//     {
//         id: 'p1',
//         title: 'goal',
//         imageURL: '',
//         description: 'Masterpiece',
//         address: 'Void',
//         creator: 'u2',
//         location: { lat: -38.397, lng: 150.744 },
//     },
// ];

const UserPlaces = (props) => {
    const [loadedPlaces, setLoadedPlaces] = useState();
    const userId = useParams().userId;
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
                );
                setLoadedPlaces(responseData.places);
            } catch (err) {}
        };
        fetchRequest();
    }, [sendRequest, userId]);

    const placeDeletedHandler = (deletedPlaceId) => {
        setLoadedPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== deletedPlaceId));
    };
    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}></ErrorModal>
            {isLoading && (
                <div className='center'>
                    <LoadingSpinner></LoadingSpinner>
                </div>
            )}
            {!isLoading && loadedPlaces && (
                <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
            )}
        </React.Fragment>
    );
};

export default UserPlaces;
