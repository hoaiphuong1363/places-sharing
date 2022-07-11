import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import Button from '../../shared/components/FormElements/Button';
import './PlaceForm.css';
import useForm from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const NewPlace = (props) => {
    const auth = useContext(AuthContext);

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler] = useForm(
        {
            title: {
                value: '',
                isValid: false,
            },
            description: {
                value: '',
                isValid: false,
            },
            address: {
                value: '',
                isValid: false,
            },
            image: {
                value: null,
                isValid: false,
            },
        },
        false
    );
    const history = useHistory();

    const placeSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', formState.inputs.title.value);
            formData.append('description', formState.inputs.description.value);
            formData.append('address', formState.inputs.address.value);
            formData.append('image', formState.inputs.image.value);

            await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, 'POST', formData, {
                Authorization: 'Bearer ' + auth.token,
            });
            // Redirect the user to a different state
            history.push('/');
        } catch (err) {}
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}></ErrorModal>
            <form className='place-form' onSubmit={placeSubmitHandler}>
                {isLoading && <LoadingSpinner asOverLay></LoadingSpinner>}
                <Input
                    id='title'
                    type='text'
                    label='Title'
                    element='input'
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText='Please enter a valid title'
                    onInput={inputHandler}
                ></Input>
                <Input
                    id='description'
                    label='Description'
                    element='textarea'
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText='Please enter a valid description'
                    onInput={inputHandler}
                ></Input>
                <Input
                    id='address'
                    label='Address'
                    element='input'
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText='Please enter a valid address'
                    onInput={inputHandler}
                ></Input>

                <ImageUpload
                    id='image'
                    onInput={inputHandler}
                    errorText='Please Provide an image'
                ></ImageUpload>

                <Button type='submit' disabled={!formState.isValid}>
                    Add Place
                </Button>
            </form>
        </React.Fragment>
    );
};

export default NewPlace;