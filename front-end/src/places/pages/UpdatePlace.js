import React, { useContext } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import './PlaceForm.css';
import useForm from '../../shared/hooks/form-hook';
import Card from '../../shared/components/UIElements/Card';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
// const places = [
//     {
//         id: 'p1',
//         title: 'goal',
//         image: '',
//         description: 'Masterpiece',
//         address: 'Void',
//         creator: 'u2',
//         location: { lat: -38.397, lng: 150.744 },
//     },
// ];

const UpdatePlace = (props) => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedPlaces, setLoadedPlaces] = useState();
    const placeId = useParams().placeId;
    const history = useHistory();

    const [formState, inputHandler, setFormData] = useForm(
        {
            title: {
                value: '',
                isValid: false,
            },
            description: {
                value: '',
                isValid: false,
            },
        },
        false
    );
    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
                );
                setLoadedPlaces(responseData.place);
                setFormData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true,
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true,
                        },
                    },
                    true
                );
            } catch (err) {}
        };
        fetchPlace();
    }, [sendRequest, placeId, setFormData]);

    const placeUpdateSubmitHandler = async (event) => {
        event.preventDefault();
        console.log(formState.inputs);
        try {
            const responseData = await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
                'PATCH',
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token,
                }
            );
            history.push('/' + auth.userId + '/places');
        } catch (err) {}
    };
    if (isLoading) {
        return (
            <div className='center'>
                <LoadingSpinner></LoadingSpinner>
            </div>
        );
    }
    if (!loadedPlaces && !error) {
        return (
            <div className='center'>
                <Card>
                    <h2>NO PLACES FOUND!</h2>
                </Card>
            </div>
        );
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}></ErrorModal>
            {!isLoading && loadedPlaces && (
                <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
                    <Input
                        id='title'
                        type='text'
                        label='Title'
                        element='input'
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText='Please enter a valid title'
                        initialValue={loadedPlaces.title}
                        initialValid={true}
                        onInput={inputHandler}
                    ></Input>
                    <Input
                        id='description'
                        label='Description'
                        element='textarea'
                        validators={[VALIDATOR_MINLENGTH(5)]}
                        initialValue={loadedPlaces.description}
                        errorText='Please enter a valid description'
                        initialValid={true}
                        onInput={inputHandler}
                    ></Input>
                    <Button type='submit' disabled={!formState.isValid}>
                        Update Place
                    </Button>
                </form>
            )}
        </React.Fragment>
    );
};

export default UpdatePlace;
